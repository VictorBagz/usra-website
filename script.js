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

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

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
