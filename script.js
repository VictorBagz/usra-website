// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Auth UI wiring
const authBox = document.getElementById('authBox');
const btnSignIn = document.getElementById('btnSignIn');
const btnSignUp = document.getElementById('btnSignUp');
const btnSignOut = document.getElementById('btnSignOut');
const authForm = document.getElementById('authForm');
const authStatus = document.getElementById('authStatus');

function setAuthUI(state) {
    if (!authBox) return;
    if (state === 'signed-in') {
        btnSignIn.style.display = 'none';
        btnSignUp.style.display = 'none';
        btnSignOut.style.display = 'inline-block';
        authStatus.textContent = 'Signed in';
    } else {
        btnSignIn.style.display = 'inline-block';
        btnSignUp.style.display = 'inline-block';
        btnSignOut.style.display = 'none';
        authStatus.textContent = '';
    }
}

async function refreshAuthVisibility() {
    if (!window.USRA || !window.USRA.supabase) return;
    const { data: { user } } = await USRA.supabase.auth.getUser();
    if (authBox) authBox.style.display = 'block';
    setAuthUI(user ? 'signed-in' : 'signed-out');
}

if (authForm && window.USRA && window.USRA.supabase) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        btnSignIn.disabled = true;
        btnSignIn.innerHTML = '<span class="loading"></span> Signing in...';
        const { error } = await USRA.signInWithEmail(email, password);
        btnSignIn.disabled = false;
        btnSignIn.textContent = 'Sign In';
        if (error) {
            authStatus.textContent = error.message;
            authStatus.style.color = '#FF0000';
        } else {
            authStatus.textContent = 'Signed in successfully';
            authStatus.style.color = '#4CAF50';
            setAuthUI('signed-in');
        }
    });

    btnSignUp.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        btnSignUp.disabled = true;
        btnSignUp.innerHTML = '<span class="loading"></span> Creating...';
        const { error } = await USRA.signUpWithEmail(email, password);
        btnSignUp.disabled = false;
        btnSignUp.textContent = 'Create Account';
        if (error) {
            authStatus.textContent = error.message;
            authStatus.style.color = '#FF0000';
        } else {
            authStatus.textContent = 'Account created. Check your email to confirm.';
            authStatus.style.color = '#4CAF50';
        }
    });

    btnSignOut.addEventListener('click', async () => {
        await USRA.signOut();
        setAuthUI('signed-out');
    });
}

// Listen to auth state changes
if (window.USRA && window.USRA.supabase) {
    USRA.supabase.auth.onAuthStateChange((_event, session) => {
        setAuthUI(session?.user ? 'signed-in' : 'signed-out');
    });
}

refreshAuthVisibility();

// Conditionally show Dashboard link for chair/admin users
(async function showDashboardForAdmins(){
    try {
        if (!window.USRA || !USRA.supabase) return;
        const navDash = document.getElementById('navDashboard');
        if (!navDash) return;
        const { data: { user } } = await USRA.supabase.auth.getUser();
        if (!user) { navDash.style.display = 'none'; return; }
        const { data: rows } = await USRA.supabase
            .from('members')
            .select('role')
            .eq('user_id', user.id)
            .limit(1);
        const role = String(rows?.[0]?.role || '').toLowerCase();
        if (role.startsWith('chair') || role.includes('admin')) {
            navDash.style.display = 'list-item';
        } else {
            navDash.style.display = 'none';
        }
    } catch (e) {
        console.warn('Dashboard role check failed:', e);
    }
})();

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Mobile dropdown toggle
const navMore = document.querySelector('.nav-more');
if (navMore) {
    navMore.addEventListener('click', (e) => {
        // Only toggle on small screens
        if (window.innerWidth <= 768) {
            e.preventDefault();
            navMore.classList.toggle('open');
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.9)';
    }
});

// Counter Animation for Statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const target = parseInt(statNumber.getAttribute('data-target'));
            animateCounter(statNumber, target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all stat items
document.querySelectorAll('.stat-item').forEach(item => {
    observer.observe(item);
});

// Form Handling (home registration form - guarded if missing)
const homeRegistrationForm = document.getElementById('registrationForm');
if (homeRegistrationForm) homeRegistrationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Require auth
    if (!window.USRA || !USRA.supabase) {
        showNotification('Supabase not initialized', 'info');
        return;
    }

    const { data: auth } = await USRA.supabase.auth.getUser();
    if (!auth || !auth.user) {
        showNotification('Please sign in as an administrator first.', 'info');
        return;
    }

    // Get form data
    const formData = new FormData(this);
    const payload = Object.fromEntries(formData);

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    submitBtn.disabled = true;

    try {
        const { error } = await USRA.supabase.from('schools').insert({
            name: payload.schoolName,
            principal_name: payload.principalName,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            estimated_players: payload.players ? Number(payload.players) : null,
            notes: payload.message || null
        });
        if (error) throw error;
        showNotification('Registration submitted successfully! We will contact you soon.', 'success');
        this.reset();
    } catch (err) {
        showNotification(`Submission failed: ${err.message}`, 'info');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Registration page: schoolRegistrationForm → insert school and member profile
const schoolRegistrationForm = document.getElementById('schoolRegistrationForm');
if (schoolRegistrationForm && window.USRA && USRA.supabase) {
    schoolRegistrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
        submitBtn.disabled = true;

        const { data: { user } } = await USRA.supabase.auth.getUser();
        if (!user) {
            showNotification('Please sign in first to submit.', 'info');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Collect data
        const fd = new FormData(this);

        // Upload helpers to Supabase Storage
        async function uploadToBucket(bucket, file, keyPrefix) {
            if (!file || file.size === 0) return null;
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${keyPrefix}-${Date.now()}.${fileExt}`;
            const { error: upErr } = await USRA.supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
            if (upErr) throw upErr;
            // Public URLs for public buckets; signed for private
            if (bucket === 'supporting-docs') {
                const { data: { signedUrl }, error: urlErr } = await USRA.supabase.storage
                    .from(bucket)
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
                if (urlErr) throw urlErr;
                return signedUrl;
            } else {
                const { data } = USRA.supabase.storage.from(bucket).getPublicUrl(filePath);
                return data.publicUrl;
            }
        }

        // Read files from form
        const badgeFile = fd.get('schoolBadge');
        const profileFile = fd.get('profilePhoto');
        const docsFile = fd.get('supportingDocs');

        let badgeUrl = null;
        let profilePhotoUrl = null;
        let docsUrl = null;

        try {
            // Upload files (if provided)
            badgeUrl = await uploadToBucket('school-badges', badgeFile, 'badge');
            profilePhotoUrl = await uploadToBucket('profile-photos', profileFile, 'profile');
            docsUrl = await uploadToBucket('supporting-docs', docsFile, 'docs');

            // Insert or upsert member profile
            const memberPayload = {
                user_id: user.id,
                full_name: fd.get('adminFullName') || null,
                nin: fd.get('nin') || null,
                role: fd.get('role') || null,
                sex: fd.get('sex') || null,
                highest_qualification: fd.get('qualification') || null,
                contact1: fd.get('contact1') || null,
                contact2: fd.get('contact2') || null,
                profile_photo_url: profilePhotoUrl,
                supporting_docs_url: docsUrl
            };

            // upsert on user_id uniqueness
            const { error: memberErr } = await USRA.supabase
                .from('members')
                .upsert(memberPayload, { onConflict: 'user_id' });
            if (memberErr) throw memberErr;

            // Insert school
            const schoolPayload = {
                name: fd.get('schoolName'),
                principal_name: fd.get('adminFullName') || '',
                email: fd.get('schoolEmail') || '',
                phone: fd.get('schoolPhone1') || '',
                address: fd.get('address') || '',
                notes: null,
                center_number: fd.get('centerNumber') || null,
                school_email: fd.get('schoolEmail') || null,
                contact1: fd.get('schoolPhone1') || null,
                contact2: fd.get('schoolPhone2') || null,
                region: fd.get('region') || null,
                district: fd.get('district') || null,
                badge_url: badgeUrl
            };

            const { error: schoolErr } = await USRA.supabase
                .from('schools')
                .insert(schoolPayload);
            if (schoolErr) throw schoolErr;

            showNotification('Registration submitted. Thank you!', 'success');
            this.reset();
        } catch (err) {
            showNotification(`Submission failed: ${err.message}`, 'info');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const payload = Object.fromEntries(formData);

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;

    try {
        if (window.USRA && USRA.supabase) {
            const { error } = await USRA.supabase.from('contacts').insert({
                name: payload.contactName,
                email: payload.contactEmail,
                subject: payload.contactSubject,
                message: payload.contactMessage
            });
            if (error) throw error;
        }
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        this.reset();
    } catch (err) {
        showNotification(`Send failed: ${err.message}`, 'info');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Newsletter form
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    if (email) {
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        this.reset();
    }
});

// Legacy notification function - replaced by enhanced version above
// This is kept for backwards compatibility but redirects to the new function

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation styles
const style = document.createElement('style');
style.textContent = `
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Add scroll reveal animations for elements not using AOS
const scrollRevealElements = document.querySelectorAll('.feature, .contact-item, .footer-section');

const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

scrollRevealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollRevealObserver.observe(element);
});

// Initialize tooltips for better UX
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.getAttribute('title');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        this.tooltip = tooltip;
    });
    
    element.addEventListener('mouseleave', function() {
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
    });
});

console.log('USRA Website loaded successfully! 🏉');

// Quick Win Improvements for Better UX

// 1. Enhanced loading states function
function showLoading(element, message = 'Loading...') {
    if (!element) return;
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    element.innerHTML = `<span class="loading"></span> ${message}`;
    element.disabled = true;
    return originalContent;
}

function hideLoading(element, originalContent = null) {
    if (!element) return;
    const content = originalContent || element.getAttribute('data-original-content');
    if (content) {
        element.innerHTML = content;
        element.removeAttribute('data-original-content');
    }
    element.disabled = false;
}

// 2. Global error boundary for better UX
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error || e);
    showNotification('Something went wrong. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    e.preventDefault(); // Prevent the default console error
});

// 3. Network status detection and user feedback
let isOnline = navigator.onLine;

function updateNetworkStatus() {
    const networkIndicator = document.getElementById('networkStatus');
    if (networkIndicator) {
        networkIndicator.className = isOnline ? 'network-online' : 'network-offline';
        networkIndicator.innerHTML = isOnline 
            ? '<i class="fas fa-wifi"></i> Online' 
            : '<i class="fas fa-wifi-slash"></i> Offline';
    }
}

window.addEventListener('online', () => {
    isOnline = true;
    updateNetworkStatus();
    showNotification('Connection restored! You\'re back online.', 'success');
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateNetworkStatus();
    showNotification('You\'re offline. Some features may not work.', 'warning');
});

// 4. Auto-save functionality for forms
function autoSave(formData, key, expiryMinutes = 30) {
    try {
        const data = {
            formData: formData,
            timestamp: Date.now(),
            expiry: Date.now() + (expiryMinutes * 60 * 1000)
        };
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
    } catch (e) {
        console.warn('Auto-save failed:', e);
    }
}

function loadAutoSave(key) {
    try {
        const saved = localStorage.getItem(`autosave_${key}`);
        if (!saved) return null;
        
        const data = JSON.parse(saved);
        if (Date.now() > data.expiry) {
            localStorage.removeItem(`autosave_${key}`);
            return null;
        }
        return data.formData;
    } catch (e) {
        console.warn('Load auto-save failed:', e);
        return null;
    }
}

function clearAutoSave(key) {
    try {
        localStorage.removeItem(`autosave_${key}`);
    } catch (e) {
        console.warn('Clear auto-save failed:', e);
    }
}

// 5. Enhanced notification system with different types
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications of the same type
    const existing = document.querySelectorAll(`.notification-${type}`);
    existing.forEach(el => {
        if (document.body.contains(el)) {
            document.body.removeChild(el);
        }
    });

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icons[type] || icons.info}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-family: inherit;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    const closeNotification = () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeNotification);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            if (document.body.contains(notification)) {
                closeNotification();
            }
        }, duration);
    }
    
    return notification;
}

// 6. Performance monitoring and optimization
function measurePerformance(name, fn) {
    return async function(...args) {
        const start = performance.now();
        try {
            const result = await fn.apply(this, args);
            const end = performance.now();
            console.log(`${name} took ${(end - start).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            console.error(`${name} failed after ${(end - start).toFixed(2)}ms:`, error);
            throw error;
        }
    };
}

// 7. Initialize auto-save for forms
function initAutoSave() {
    const forms = document.querySelectorAll('form[data-autosave]');
    forms.forEach(form => {
        const key = form.getAttribute('data-autosave') || 'default';
        
        // Load saved data on page load
        const savedData = loadAutoSave(key);
        if (savedData) {
            const shouldRestore = confirm('Found unsaved form data. Would you like to restore it?');
            if (shouldRestore) {
                Object.keys(savedData).forEach(fieldName => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field && field.type !== 'file') {
                        field.value = savedData[fieldName];
                    }
                });
                showNotification('Form data restored from auto-save', 'success');
            } else {
                clearAutoSave(key);
            }
        }
        
        // Auto-save on input changes
        form.addEventListener('input', debounce(() => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (form.querySelector(`[name="${key}"]`).type !== 'file') {
                    data[key] = value;
                }
            }
            autoSave(data, key);
        }, 2000));
        
        // Clear auto-save on successful submit
        form.addEventListener('submit', () => {
            // Small delay to allow form processing
            setTimeout(() => {
                if (!form.querySelector('.error')) {
                    clearAutoSave(key);
                }
            }, 1000);
        });
    });
}

// 8. Debounce utility for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 9. Initialize improvements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add network status indicator to navbar if it doesn't exist
    const navbar = document.querySelector('.nav-container');
    if (navbar && !document.getElementById('networkStatus')) {
        const networkStatus = document.createElement('div');
        networkStatus.id = 'networkStatus';
        networkStatus.style.cssText = `
            font-size: 0.8rem;
            padding: 4px 8px;
            border-radius: 12px;
            background: rgba(255,255,255,0.1);
            margin-left: 10px;
        `;
        navbar.appendChild(networkStatus);
        updateNetworkStatus();
    }
    
    // Initialize auto-save
    initAutoSave();
    
    // Initialize download tracking
    initDownloadTracking();
    
    // Add retry functionality to failed requests
    window.retryFailedRequest = function(requestFn, maxRetries = 3) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            function attempt() {
                attempts++;
                requestFn()
                    .then(resolve)
                    .catch(error => {
                        if (attempts < maxRetries && !isOnline) {
                            showNotification(`Attempt ${attempts} failed. Retrying when online...`, 'warning');
                            window.addEventListener('online', attempt, { once: true });
                        } else if (attempts < maxRetries) {
                            setTimeout(attempt, 1000 * attempts); // Exponential backoff
                        } else {
                            reject(error);
                        }
                    });
            }
            
            attempt();
        });
    };
});

// 10. Download tracking and user feedback
function initDownloadTracking() {
    const downloadLinks = document.querySelectorAll('a[download]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const fileName = this.getAttribute('download');
            const fileType = fileName.split('.').pop().toUpperCase();
            
            // Show download notification
            showNotification(`Downloading ${fileType} file: ${fileName}`, 'info', 3000);
            
            // Track download in console for analytics
            console.log(`Download initiated: ${fileName} from ${this.href}`);
            
            // Optional: Send download tracking to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'file_name': fileName,
                    'file_type': fileType
                });
            }
        });
        
        // Add download indicator on hover
        link.addEventListener('mouseenter', function() {
            const fileName = this.getAttribute('download');
            this.setAttribute('title', `Download ${fileName}`);
        });
    });
}

// 11. Expose utilities globally for use in other scripts
window.USRAUtils = {
    showLoading,
    hideLoading,
    showNotification,
    autoSave,
    loadAutoSave,
    clearAutoSave,
    measurePerformance,
    debounce,
    retryFailedRequest: window.retryFailedRequest,
    initDownloadTracking
};

// Gallery Lightbox
(function initLightbox(){
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    if (!items.length) return;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const btnClose = document.getElementById('lightboxClose');
    const btnPrev = document.getElementById('lightboxPrev');
    const btnNext = document.getElementById('lightboxNext');
    let current = 0;

    function openAt(index){
        current = index;
        const link = items[current];
        img.src = link.getAttribute('href');
        img.alt = link.querySelector('img')?.alt || 'Photo';
        caption.textContent = link.dataset.title || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }

    function close(){
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
    }

    function prev(){ openAt((current - 1 + items.length) % items.length); }
    function next(){ openAt((current + 1) % items.length); }

    items.forEach((el, i) => {
        el.addEventListener('click', (e) => { e.preventDefault(); openAt(i); });
    });
    btnClose?.addEventListener('click', close);
    btnPrev?.addEventListener('click', prev);
    btnNext?.addEventListener('click', next);
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });
})();
