// USRA Website JavaScript - Professional & ESLint Compliant

/* eslint-env browser */
/* global AOS, window, document, console, navigator, requestAnimationFrame, setTimeout, clearTimeout */

'use strict';

// Initialize AOS safely
(function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
})();

// Utility Functions
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    },

    // Show loading overlay
    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="loading"></div>';
        document.body.appendChild(loader);
        
        setTimeout(() => {
            loader.classList.add('show');
        }, 10);
        
        return loader;
    },

    // Hide loading overlay
    hideLoading(loader) {
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 300);
        }
    }
};

// Auth Management
const AuthManager = {
    elements: {
        authBox: document.getElementById('authBox'),
        btnSignIn: document.getElementById('btnSignIn'),
        btnSignUp: document.getElementById('btnSignUp'),
        btnAnonymous: document.getElementById('btnAnonymous'),
        btnSignOut: document.getElementById('btnSignOut'),
        authForm: document.getElementById('authForm'),
        authStatus: document.getElementById('authStatus')
    },

    setUI(state) {
        const { authBox, btnSignIn, btnSignUp, btnAnonymous, btnSignOut, authStatus } = this.elements;
        
        if (!authBox) return;
        
        if (state === 'signed-in') {
            if (btnSignIn) btnSignIn.style.display = 'none';
            if (btnSignUp) btnSignUp.style.display = 'none';
            if (btnAnonymous) btnAnonymous.style.display = 'none';
            if (btnSignOut) btnSignOut.style.display = 'inline-block';
            if (authStatus) authStatus.textContent = 'Signed in';
        } else {
            if (btnSignIn) btnSignIn.style.display = 'inline-block';
            if (btnSignUp) btnSignUp.style.display = 'inline-block';
            if (btnAnonymous) btnAnonymous.style.display = 'inline-block';
            if (btnSignOut) btnSignOut.style.display = 'none';
            if (authStatus) authStatus.textContent = '';
        }
    },

    async refreshVisibility() {
        if (!window.USRA || !window.USRA.supabase) return;
        
        try {
            const { data: { user } } = await window.USRA.supabase.auth.getUser();
            if (this.elements.authBox) this.elements.authBox.style.display = 'block';
            this.setUI(user ? 'signed-in' : 'signed-out');
        } catch (error) {
            console.warn('Auth visibility check failed:', error);
        }
    },

    init() {
        const { authForm, btnSignUp, btnAnonymous, btnSignOut, authStatus } = this.elements;

        if (authForm && window.USRA && window.USRA.supabase) {
            authForm.addEventListener('submit', this.handleSignIn.bind(this));

            if (btnSignUp) {
                btnSignUp.addEventListener('click', this.handleSignUp.bind(this));
            }

            if (btnAnonymous) {
                btnAnonymous.addEventListener('click', this.handleAnonymousSignIn.bind(this));
            }

            if (btnSignOut) {
                btnSignOut.addEventListener('click', this.handleSignOut.bind(this));
            }
        }

        // Listen to auth state changes
        if (window.USRA && window.USRA.supabase) {
            window.USRA.supabase.auth.onAuthStateChange((_event, session) => {
                this.setUI(session?.user ? 'signed-in' : 'signed-out');
            });
        }

        this.refreshVisibility();
    },

    async handleSignIn(e) {
        e.preventDefault();
        
        const emailEl = document.getElementById('authEmail');
        const passwordEl = document.getElementById('authPassword');
        const { btnSignIn, authStatus } = this.elements;
        
        if (!emailEl || !passwordEl) return;
        
        const email = emailEl.value.trim();
        const password = passwordEl.value;
        
        if (btnSignIn) {
            btnSignIn.disabled = true;
            btnSignIn.innerHTML = '<span class="loading"></span> Signing in...';
        }
        
        try {
            const { error } = await window.USRA.signInWithEmail(email, password);
            
            if (btnSignIn) {
                btnSignIn.disabled = false;
                btnSignIn.textContent = 'Sign In';
            }
            
            if (error) {
                if (authStatus) {
                    authStatus.textContent = error.message;
                    authStatus.style.color = '#FF0000';
                }
            } else {
                if (authStatus) {
                    authStatus.textContent = 'Signed in successfully';
                    authStatus.style.color = '#4CAF50';
                }
                this.setUI('signed-in');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            if (authStatus) {
                authStatus.textContent = 'Sign in failed';
                authStatus.style.color = '#FF0000';
            }
        }
    },

    async handleSignUp() {
        const emailEl = document.getElementById('authEmail');
        const passwordEl = document.getElementById('authPassword');
        const { btnSignUp, authStatus } = this.elements;
        
        if (!emailEl || !passwordEl || !btnSignUp) return;
        
        const email = emailEl.value.trim();
        const password = passwordEl.value;
        
        btnSignUp.disabled = true;
        btnSignUp.innerHTML = '<span class="loading"></span> Creating...';
        
        try {
            const { error } = await window.USRA.signUpWithEmail(email, password);
            
            btnSignUp.disabled = false;
            btnSignUp.textContent = 'Create Account';
            
            if (error) {
                if (authStatus) {
                    authStatus.textContent = error.message;
                    authStatus.style.color = '#FF0000';
                }
            } else {
                if (authStatus) {
                    authStatus.textContent = 'Account created. Check your email to confirm.';
                    authStatus.style.color = '#4CAF50';
                }
            }
        } catch (error) {
            console.error('Sign up error:', error);
            btnSignUp.disabled = false;
            btnSignUp.textContent = 'Create Account';
        }
    },

    async handleAnonymousSignIn() {
        const { btnAnonymous, authStatus } = this.elements;
        
        if (!btnAnonymous) return;
        
        btnAnonymous.disabled = true;
        btnAnonymous.innerHTML = '<span class="loading"></span> Signing in...';
        
        try {
            const { error } = await window.USRA.signInAnonymously();
            
            btnAnonymous.disabled = false;
            btnAnonymous.innerHTML = '<i class="fas fa-user-secret"></i> Continue as Guest';
            
            if (error) {
                if (authStatus) {
                    authStatus.textContent = error.message;
                    authStatus.style.color = '#FF0000';
                }
            } else {
                if (authStatus) {
                    authStatus.textContent = 'Signed in as guest';
                    authStatus.style.color = '#4CAF50';
                }
                this.setUI('signed-in');
            }
        } catch (error) {
            console.error('Anonymous sign in error:', error);
            btnAnonymous.disabled = false;
            btnAnonymous.innerHTML = '<i class="fas fa-user-secret"></i> Continue as Guest';
            if (authStatus) {
                authStatus.textContent = 'Anonymous sign in failed';
                authStatus.style.color = '#FF0000';
            }
        }
    },

    async handleSignOut() {
        try {
            await window.USRA.signOut();
            this.setUI('signed-out');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
};

// Navigation Manager
const NavigationManager = {
    elements: {
        hamburger: document.querySelector('.hamburger'),
        navMenu: document.querySelector('.nav-menu'),
        navMore: document.querySelector('.nav-more'),
        navbar: document.querySelector('.navbar')
    },

    init() {
        this.setupMobileToggle();
        this.setupDropdown();
        this.setupSmoothScrolling();
        this.setupNavbarScroll();
        this.setupMobileMenuClose();
    },

    setupMobileToggle() {
        const { hamburger, navMenu } = this.elements;
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    },

    setupDropdown() {
        const { navMore } = this.elements;
        
        if (navMore) {
            navMore.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    navMore.classList.toggle('open');
                }
            });
        }
    },

    setupSmoothScrolling() {
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
    },

    setupNavbarScroll() {
        let navbarTicking = false;
        const { navbar } = this.elements;

        const updateNavbar = () => {
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                } else {
                    navbar.style.background = 'rgba(0, 0, 0, 0.9)';
                }
            }
            navbarTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!navbarTicking) {
                requestAnimationFrame(updateNavbar);
                navbarTicking = true;
            }
        });
    },

    setupMobileMenuClose() {
        const { hamburger, navMenu } = this.elements;
        
        if (hamburger && navMenu) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
};

// Events Section Manager
const EventsManager = {
    elements: {
        section: null,
        navTabs: null,
        eventCards: null,
        navSlider: null
    },

    isAnimating: false,

    init() {
        this.elements.section = document.querySelector('.events-ultra');
        if (!this.elements.section) return;

        this.elements.navTabs = document.querySelectorAll('.nav-tab');
        this.elements.eventCards = document.querySelectorAll('.event-card-premium, .event-featured');
        this.elements.navSlider = document.querySelector('.nav-slider');

        this.setupNavigation();
        this.setupCardInteractions();
        this.setupButtonRipples();
        this.initializeDisplay();
    },

    setupNavigation() {
        const { navTabs, navSlider } = this.elements;

        if (!navTabs.length || !navSlider) return;

        navTabs.forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
            tab.addEventListener('mouseenter', this.handleTabHover.bind(this));
            tab.addEventListener('mouseleave', this.handleTabLeave.bind(this));
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            const activeTab = document.querySelector('.nav-tab.active');
            if (activeTab) {
                this.updateSliderPosition(activeTab, true);
            }
        }, 100));
    },

    handleTabClick(e) {
        const tab = e.currentTarget;
        
        if (tab.classList.contains('active') || this.isAnimating) return;

        // Remove active state from all tabs
        this.elements.navTabs.forEach(t => {
            t.classList.remove('active');
            t.style.transform = 'scale(1)';
        });

        // Add active state to clicked tab
        tab.classList.add('active');
        tab.style.transform = 'scale(1.02)';
        
        this.updateSliderPosition(tab);
        
        const filter = tab.getAttribute('data-filter');
        this.filterEvents(filter);

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    handleTabHover(e) {
        const tab = e.currentTarget;
        if (!tab.classList.contains('active')) {
            tab.style.transform = 'scale(1.01)';
        }
    },

    handleTabLeave(e) {
        const tab = e.currentTarget;
        if (!tab.classList.contains('active')) {
            tab.style.transform = 'scale(1)';
        }
    },

    updateSliderPosition(activeTab, instant = false) {
        const { navSlider } = this.elements;
        
        if (!navSlider) return;
        
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        
        navSlider.style.transition = instant ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        navSlider.style.transform = `translateX(${tabLeft}px)`;
        navSlider.style.width = `${tabWidth}px`;
    },

    filterEvents(category) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const { eventCards } = this.elements;

        // Hide all cards first
        eventCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('hide');
                card.classList.remove('show');
            }, index * 50);
        });

        // Show matching cards after hide animation
        setTimeout(() => {
            let visibleIndex = 0;
            eventCards.forEach((card) => {
                const cardCategory = card.getAttribute('data-category');
                const shouldShow = category === 'all' || cardCategory === category;
                
                if (shouldShow) {
                    setTimeout(() => {
                        card.classList.remove('hide');
                        card.classList.add('show');
                    }, visibleIndex * 100);
                    visibleIndex++;
                }
            });
            
            setTimeout(() => {
                this.isAnimating = false;
            }, visibleIndex * 100 + 500);
        }, eventCards.length * 50 + 200);

        this.updateEventCounts();
    },

    updateEventCounts() {
        const { navTabs, eventCards } = this.elements;

        navTabs.forEach(tab => {
            const category = tab.dataset.filter;
            const countElement = tab.querySelector('.tab-count');
            
            if (countElement) {
                if (category === 'all') {
                    countElement.textContent = eventCards.length;
                } else {
                    const count = Array.from(eventCards).filter(card => 
                        card.getAttribute('data-category') === category
                    ).length;
                    countElement.textContent = count;
                }
            }
        });
    },

    setupCardInteractions() {
        const { eventCards } = this.elements;

        eventCards.forEach(card => {
            let hoverTimeout;

            card.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            card.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(() => {
                    this.style.transform = 'translateY(0) scale(1)';
                }, 50);
            });

            // Touch support for mobile
            card.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-4px) scale(1.01)';
            });

            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'translateY(0) scale(1)';
                }, 150);
            });
        });
    },

    setupButtonRipples() {
        const buttons = document.querySelectorAll('.btn-premium, .btn-card, .btn-cta');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 600);
            });
        });
    },

    initializeDisplay() {
        const { navTabs, eventCards } = this.elements;

        // Initialize slider position
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab) {
            this.updateSliderPosition(activeTab, true);
            this.updateEventCounts();
        }

        // Show all events initially with staggered animation
        setTimeout(() => {
            eventCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('show');
                }, index * 150);
            });
        }, 500);
    }
};

// Statistics Animation Manager
const StatsManager = {
    init() {
        this.setupObserver();
    },

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let start = 0;
            const increment = target / (2000 / 16);
            
            const updateCount = () => {
                start += increment;
                if (start < target) {
                    stat.textContent = Math.floor(start);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateCount();
        });
    },

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target.querySelector('.stat-number');
                    if (statNumber && !statNumber.classList.contains('animated')) {
                        statNumber.classList.add('animated');
                        this.animateStats();
                    }
                }
            });
        });

        document.querySelectorAll('.stat-item').forEach(item => {
            observer.observe(item);
        });
    }
};

// Form Handler
const FormManager = {
    init() {
        this.setupRegistrationForm();
    },

    setupRegistrationForm() {
        const form = document.getElementById('schoolRegistrationForm');
        if (!form) return;

        // Remove any existing listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Wait for DOM to be ready and other scripts to load
        setTimeout(async () => {
            const actualForm = document.getElementById('schoolRegistrationForm');
            if (!actualForm) return;

            // Test Supabase connection
            if (window.USRA && window.USRA.supabase) {
                try {
                    console.log('Testing Supabase connection...');
                    const { data, error } = await window.USRA.supabase.from('schools').select('count').limit(1);
                    if (error) {
                        console.error('Supabase connection test failed:', error);
                    } else {
                        console.log('Supabase connection successful');
                    }
                } catch (err) {
                    console.error('Supabase connection error:', err);
                }
            }

            actualForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Form submission started');
            
            // Set a timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                console.error('Form submission timeout');
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                    submitBtn.disabled = false;
                }
                Utils.showNotification('Registration is taking too long. Please try again.', 'error');
            }, 30000); // 30 second timeout
            
            if (!window.USRA || !window.USRA.supabase) {
                clearTimeout(timeoutId);
                console.error('Database connection not available');
                Utils.showNotification('Database connection not available. Please refresh the page and try again.', 'error');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn.disabled) return; // Prevent double submission

            try {
                console.log('Processing form data...');
                const formData = new FormData(this);
                const payload = Object.fromEntries(formData);

                // Validate required fields
                const requiredFields = [
                    'schoolName', 'centerNumber', 'schoolEmail', 'schoolPhone1', 
                    'address', 'region', 'district', 'adminFullName', 'nin', 
                    'role', 'sex', 'qualification', 'contact1'
                ];
                
                const missingFields = requiredFields.filter(field => !payload[field] || payload[field].trim() === '');
                if (missingFields.length > 0) {
                    clearTimeout(timeoutId);
                    console.error('Missing required fields:', missingFields);
                    Utils.showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                        submitBtn.disabled = false;
                    }
                    return;
                }

                // Validate terms acceptance
                const termsCheckbox = document.getElementById('termsAccept');
                if (!termsCheckbox?.checked) {
                    clearTimeout(timeoutId);
                    console.error('Terms not accepted');
                    Utils.showNotification('Please accept the terms and conditions to proceed.', 'error');
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                        submitBtn.disabled = false;
                    }
                    return;
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(payload.schoolEmail)) {
                    clearTimeout(timeoutId);
                    console.error('Invalid email format:', payload.schoolEmail);
                    Utils.showNotification('Please enter a valid email address', 'error');
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                        submitBtn.disabled = false;
                    }
                    return;
                }

                // Validate phone numbers
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(payload.schoolPhone1) || !phoneRegex.test(payload.contact1)) {
                    clearTimeout(timeoutId);
                    console.error('Invalid phone format');
                    Utils.showNotification('Please enter valid phone numbers', 'error');
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                        submitBtn.disabled = false;
                    }
                    return;
                }

                // Show immediate feedback
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;

                // Handle file uploads first
                console.log('Starting file uploads...');
                const fileUrls = await FormManager.handleFileUploads(formData);
                console.log('File upload results:', fileUrls);

                // Create user account first if password provided
                console.log('Creating user account...');
                let userCreated = false;
                let userId = null;
                if (payload.adminPassword && payload.schoolEmail) {
                    try {
                        const { data: authData, error: authError } = await window.USRA.signUpWithEmail(
                            payload.schoolEmail, 
                            payload.adminPassword
                        );
                        
                        if (!authError && authData.user) {
                            userCreated = true;
                            userId = authData.user.id;
                        }
                    } catch (authErr) {
                        console.warn('User account creation failed, continuing with registration:', authErr);
                    }
                }

                // Insert school registration data
                console.log('Preparing school data for database...');
                const schoolData = {
                    name: payload.schoolName,
                    principal_name: payload.adminFullName,
                    email: payload.schoolEmail,
                    phone: payload.schoolPhone1,
                    address: payload.address,
                    center_number: payload.centerNumber,
                    school_email: payload.schoolEmail,
                    contact1: payload.schoolPhone1,
                    contact2: payload.schoolPhone2,
                    region: payload.region,
                    district: payload.district,
                    badge_url: fileUrls.schoolBadge || null
                };

                // Add created_by if user was created
                if (userId) {
                    schoolData.created_by = userId;
                }

                console.log('Inserting school data:', schoolData);
                const { data: schoolResult, error: schoolError } = await window.USRA.supabase
                    .from('schools')
                    .insert(schoolData)
                    .select()
                    .single();
                
                console.log('School insert result:', schoolResult, schoolError);
                if (schoolError) throw schoolError;

                // Insert member data if user was created
                if (userCreated && userId) {
                    const memberData = {
                        user_id: userId,
                        full_name: payload.adminFullName,
                        nin: payload.nin,
                        role: payload.role,
                        sex: payload.sex,
                        highest_qualification: payload.qualification,
                        contact1: payload.contact1,
                        contact2: payload.contact2,
                        profile_photo_url: fileUrls.profilePhoto || null,
                        supporting_docs_url: fileUrls.supportingDocs || null
                    };

                    const { error: memberError } = await window.USRA.supabase
                        .from('members')
                        .insert(memberData);
                    
                    if (memberError) {
                        console.warn('Member data insertion failed:', memberError);
                    }
                }
                
                // Show success message
                Utils.showNotification(
                    userCreated 
                        ? 'Registration and account created successfully! Redirecting...' 
                        : 'Registration submitted successfully! Redirecting...', 
                    'success'
                );
                
                // Store registration data for profile page
                const profileData = {
                    ...payload,
                    schoolId: schoolResult.id,
                    fileUrls: fileUrls,
                    registrationDate: new Date().toISOString()
                };
                localStorage.setItem('registrationData', JSON.stringify(profileData));
                
                // Show loading overlay during redirect
                const loadingOverlay = document.createElement('div');
                loadingOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    font-family: 'Inter', sans-serif;
                `;
                loadingOverlay.innerHTML = `
                    <div style="text-align: center;">
                        <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-red); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                        <h3 style="color: var(--primary-red); margin-bottom: 10px;">Registration Successful!</h3>
                        <p style="color: #666;">Redirecting to your profile...</p>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `;
                document.body.appendChild(loadingOverlay);
                
                // Clear the timeout since we succeeded
                clearTimeout(timeoutId);
                
                // Quick redirect
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
                
            } catch (err) {
                // Clear the timeout since we're handling the error
                clearTimeout(timeoutId);
                console.error('Registration error:', err);
                
                // Show user-friendly error message
                let errorMessage = 'Registration failed. Please try again.';
                if (err.message.includes('duplicate key')) {
                    errorMessage = 'This email or school is already registered. Please use a different email address.';
                } else if (err.message.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else if (err.message.includes('invalid')) {
                    errorMessage = 'Invalid data provided. Please check your information and try again.';
                }
                
                Utils.showNotification(errorMessage, 'error');
                
                // Reset button
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                    submitBtn.disabled = false;
                }
                
                // Remove any loading overlays
                const loadingOverlay = document.querySelector('.loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.remove();
                }
            }
        });
        }, 100); // Wait 100ms for other scripts to initialize
    },

    async handleFileUploads(formData) {
        const fileUrls = {};
        
        try {
            // Get current user for file organization (skip for now to avoid auth issues)
            const userId = 'anonymous-' + Date.now();

            // Handle school badge upload
            const schoolBadge = formData.get('schoolBadge');
            if (schoolBadge && schoolBadge.size > 0) {
                const fileExt = schoolBadge.name.split('.').pop();
                const fileName = `${userId}/school-badge-${Date.now()}.${fileExt}`;
                
                const { data: badgeData, error: badgeError } = await window.USRA.supabase.storage
                    .from('school-badges')
                    .upload(fileName, schoolBadge);
                
                if (!badgeError && badgeData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('school-badges')
                        .getPublicUrl(fileName);
                    fileUrls.schoolBadge = publicUrl;
                }
            }

            // Handle profile photo upload
            const profilePhoto = formData.get('profilePhoto');
            if (profilePhoto && profilePhoto.size > 0) {
                const fileExt = profilePhoto.name.split('.').pop();
                const fileName = `${userId}/profile-photo-${Date.now()}.${fileExt}`;
                
                const { data: photoData, error: photoError } = await window.USRA.supabase.storage
                    .from('profile-photos')
                    .upload(fileName, profilePhoto);
                
                if (!photoError && photoData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('profile-photos')
                        .getPublicUrl(fileName);
                    fileUrls.profilePhoto = publicUrl;
                }
            }

            // Handle supporting documents upload
            const supportingDocs = formData.get('supportingDocs');
            if (supportingDocs && supportingDocs.size > 0) {
                const fileExt = supportingDocs.name.split('.').pop();
                const fileName = `${userId}/supporting-docs-${Date.now()}.${fileExt}`;
                
                const { data: docsData, error: docsError } = await window.USRA.supabase.storage
                    .from('supporting-docs')
                    .upload(fileName, supportingDocs);
                
                if (!docsError && docsData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('supporting-docs')
                        .getPublicUrl(fileName);
                    fileUrls.supportingDocs = publicUrl;
                }
            }

        } catch (error) {
            console.warn('File upload error:', error);
            // Continue with registration even if file uploads fail
            // Return empty object so registration can proceed
        }

        console.log('File upload completed, returning:', fileUrls);
        return fileUrls;
    }
};

// Enhanced Registration System with Supabase Integration
class RegistrationSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.registrationData = {};
        this.init();
    }

    init() {
        // Test Supabase connection first
        this.testSupabaseConnection();
        
        this.bindEvents();
        this.showStep(this.currentStep);
        this.updateProgressBar();
        this.setupFileUploads();
        this.setupPasswordStrength();
        this.loadDraftData();
    }

    async testSupabaseConnection() {
        if (window.USRA && window.USRA.supabase) {
            try {
                console.log('Testing Supabase connection...');
                const { data, error } = await window.USRA.supabase.from('schools').select('count').limit(1);
                if (error) {
                    console.error('Supabase connection test failed:', error);
                } else {
                    console.log('Supabase connection successful');
                }
            } catch (err) {
                console.error('Supabase connection error:', err);
            }
        }
    }

    bindEvents() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Progress step navigation
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.addEventListener('click', () => {
                if (index + 1 <= this.currentStep) {
                    this.currentStep = index + 1;
                    this.showStep(this.currentStep);
                    this.updateProgressBar();
                }
            });
        });

        // Form submission
        const form = document.getElementById('schoolRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        // Auto-save on input
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => this.autoSave());
        });

        // Terms checkbox
        const termsCheckbox = document.getElementById('termsAccept');
        const submitButton = document.querySelector('.submit-form');
        
        if (termsCheckbox && submitButton) {
            termsCheckbox.addEventListener('change', function() {
                submitButton.disabled = !this.checked;
                submitButton.style.opacity = this.checked ? '1' : '0.5';
            });
            
            // Initialize state
            submitButton.disabled = !termsCheckbox.checked;
            submitButton.style.opacity = termsCheckbox.checked ? '1' : '0.5';
        }
    }

    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            if (this.currentStep === 3) {
                this.updateSummary();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
        }
    }

    showStep(step) {
        document.querySelectorAll('.form-step').forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 === step);
        });
        
        // Scroll to top
        const formContainer = document.querySelector('.registration-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    updateProgressBar() {
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 <= this.currentStep);
        });
    }

    validateCurrentStep() {
        const currentStepEl = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return true;
        
        const requiredFields = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            this.clearFieldError(field);
            
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                // Additional validation
                if (field.type === 'email' && !this.isValidEmail(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                    this.showFieldError(field, 'Please enter a valid phone number');
                    isValid = false;
                } else if (field.type === 'password' && field.value.length < 6) {
                    this.showFieldError(field, 'Password must be at least 6 characters long');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = 'var(--primary-red)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--primary-red);
            font-size: 0.85rem;
            margin-top: 0.3rem;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
    }

    updateSummary() {
        document.querySelectorAll('[data-field]').forEach(element => {
            const fieldName = element.getAttribute('data-field');
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                element.textContent = field.value || '-';
            }
        });
    }

    autoSave() {
        // Collect form data
        const form = document.getElementById('schoolRegistrationForm');
        if (!form) return;
        
        const formData = new FormData(form);
        this.registrationData = Object.fromEntries(formData.entries());
        
        // Save to localStorage for recovery
        localStorage.setItem('usra_registration_draft', JSON.stringify(this.registrationData));
        
        // Show auto-save indicator
        this.showAutoSaveIndicator();
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = 'Draft Saved';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        
        // Show and hide indicator
        setTimeout(() => indicator.style.opacity = '1', 100);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }

    loadDraftData() {
        const draftData = localStorage.getItem('usra_registration_draft');
        if (draftData) {
            try {
                const data = JSON.parse(draftData);
                // Populate form fields with draft data
                Object.keys(data).forEach(key => {
                    const field = document.querySelector(`[name="${key}"]`);
                    if (field && data[key] && field.type !== 'file') {
                        field.value = data[key];
                    }
                });
                
                Utils.showNotification('Draft data restored', 'success');
            } catch (error) {
                console.error('Error loading draft data:', error);
            }
        }
    }

    setupFileUploads() {
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', function() {
                const uploadArea = this.parentNode.querySelector('.file-upload-area span');
                if (this.files[0]) {
                    uploadArea.textContent = `Selected: ${this.files[0].name}`;
                    this.parentNode.style.borderColor = 'var(--primary-red)';
                    this.parentNode.style.background = 'rgba(220, 38, 38, 0.05)';
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordField = document.getElementById('adminPassword');
        const strengthDiv = document.getElementById('passwordStrength');
        
        if (passwordField) {
            passwordField.addEventListener('input', () => {
                this.updatePasswordStrength(passwordField.value);
            });

            passwordField.addEventListener('focus', () => {
                if (strengthDiv) strengthDiv.style.display = 'block';
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let strengthLabel = 'Very Weak';
        let color = '#ff4757';

        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        switch (strength) {
            case 0:
            case 1:
                strengthLabel = 'Very Weak';
                color = '#ff4757';
                break;
            case 2:
                strengthLabel = 'Weak';
                color = '#ff7675';
                break;
            case 3:
                strengthLabel = 'Fair';
                color = '#fdcb6e';
                break;
            case 4:
                strengthLabel = 'Good';
                color = '#6c5ce7';
                break;
            case 5:
                strengthLabel = 'Strong';
                color = '#00b894';
                break;
        }

        const percentage = (strength / 5) * 100;
        strengthFill.style.width = percentage + '%';
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = `Password strength: ${strengthLabel}`;
        strengthText.style.color = color;
    }

    async submitForm() {
        console.log('=== REGISTRATION SUBMISSION STARTED ===');
        
        if (!this.validateCurrentStep()) {
            console.log('Validation failed for current step');
            return;
        }

        const termsAccepted = document.getElementById('termsAccept')?.checked;
        if (!termsAccepted) {
            console.log('Terms not accepted');
            Utils.showNotification('Please accept the terms and conditions', 'error');
            return;
        }

        console.log('Starting registration process...');
        
        // Show loading
        this.showLoading(true);

        try {
            // Collect all form data
            console.log('Collecting form data...');
            const formData = this.collectFormData();
            console.log('Form data collected:', formData);
            
            // Save to Supabase database
            console.log('Saving to database...');
            const result = await this.saveToDatabase(formData);
            console.log('Database save result:', result);
            
            if (result.success) {
                console.log('Registration successful! Preparing redirect...');
                
                // Clear draft data
                localStorage.removeItem('usra_registration_draft');
                
                // Store data for profile page
                localStorage.setItem('registrationData', JSON.stringify(result.data));
                console.log('Data stored in localStorage for profile page');
                
                // Show success message
                Utils.showNotification('Registration submitted successfully! Redirecting to profile...', 'success');
                
                // Hide loading and show success overlay
                this.showLoading(false);
                this.showSuccessOverlay();
                
                // Redirect after a short delay
                console.log('Redirecting to profile page in 2 seconds...');
                setTimeout(() => {
                    console.log('Executing redirect to profile.html');
                    try {
                        window.location.href = 'profile.html';
                    } catch (redirectError) {
                        console.error('Redirect failed, trying alternative method:', redirectError);
                        window.location.replace('profile.html');
                    }
                }, 2000);

                // Fallback redirect in case the main one fails
                setTimeout(() => {
                    if (window.location.pathname.includes('registration.html')) {
                        console.log('Fallback redirect executing...');
                        window.location.replace('profile.html');
                    }
                }, 5000);
                
            } else {
                console.error('Registration failed:', result.message);
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error stack:', error.stack);
            
            let errorMessage = 'Registration failed. Please try again.';
            if (error.message.includes('duplicate key')) {
                errorMessage = 'This email or school is already registered. Please use a different email address.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('Database connection')) {
                errorMessage = 'Database connection failed. Please refresh the page and try again.';
            } else {
                errorMessage = `Registration failed: ${error.message}`;
            }
            
            Utils.showNotification(errorMessage, 'error');
        } finally {
            this.showLoading(false);
            console.log('=== REGISTRATION SUBMISSION ENDED ===');
        }
    }

    collectFormData() {
        const form = document.getElementById('schoolRegistrationForm');
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                // Keep file objects for upload
                data[key] = value;
            } else {
                data[key] = value;
            }
        }
        
        // Add metadata
        data.registrationDate = new Date().toISOString();
        data.status = 'pending';
        data.id = this.generateId();
        
        return { formData, data };
    }

    async saveToDatabase(formDataObj) {
        console.log('=== SAVE TO DATABASE STARTED ===');
        const { formData, data } = formDataObj;
        
        console.log('Checking database connection...');
        if (!window.USRA || !window.USRA.supabase) {
            console.error('Database connection not available');
            throw new Error('Database connection not available');
        }
        console.log('Database connection OK');

        // Add timeout to entire operation
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out after 30 seconds')), 30000);
        });

        const saveOperation = async () => {

        try {
            // Handle file uploads first (non-blocking - continue even if they fail)
            console.log('Starting file uploads...');
            let fileUrls = {};
            try {
                fileUrls = await this.handleFileUploads(formData);
                console.log('File uploads completed:', fileUrls);
            } catch (uploadError) {
                console.warn('File uploads failed, continuing with registration:', uploadError);
                fileUrls = {}; // Continue with empty file URLs
            }
            
            // Create user account if password provided
            let userCreated = false;
            let userId = null;
            if (data.adminPassword && data.schoolEmail) {
                console.log('Creating user account for:', data.schoolEmail);
                try {
                    const { data: authData, error: authError } = await window.USRA.signUpWithEmail(
                        data.schoolEmail, 
                        data.adminPassword
                    );
                    
                    console.log('Auth result:', { authData, authError });
                    
                    if (!authError && authData.user) {
                        userCreated = true;
                        userId = authData.user.id;
                        console.log('User account created successfully:', userId);
                    } else if (authError) {
                        console.log('Auth error (continuing without user account):', authError);
                    }
                } catch (authErr) {
                    console.warn('User account creation failed, continuing with registration:', authErr);
                }
            } else {
                console.log('No password provided, skipping user account creation');
            }

            // Prepare school data for database
            console.log('Preparing school data...');
            
            // Validate required fields
            const requiredFields = {
                schoolName: data.schoolName,
                adminFullName: data.adminFullName,
                schoolEmail: data.schoolEmail,
                schoolPhone1: data.schoolPhone1,
                address: data.address
            };
            
            const missingFields = [];
            for (const [key, value] of Object.entries(requiredFields)) {
                if (!value || value.trim() === '') {
                    missingFields.push(key);
                }
            }
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            
            const schoolData = {
                name: data.schoolName.trim(),
                principal_name: data.adminFullName.trim(),
                email: data.schoolEmail.trim().toLowerCase(),
                phone: data.schoolPhone1.trim(),
                address: data.address.trim(),
                center_number: data.centerNumber || null,
                school_email: data.schoolEmail.trim().toLowerCase(),
                contact1: data.schoolPhone1.trim(),
                contact2: data.schoolPhone2 ? data.schoolPhone2.trim() : null,
                region: data.region || null,
                district: data.district || null,
                badge_url: fileUrls.schoolBadge || null
            };

            if (userId) {
                schoolData.created_by = userId;
            }

            console.log('School data prepared:', schoolData);

            // Insert school data
            console.log('Inserting school data into database...');
            
            // First, try inserting without immediately selecting (to avoid RLS issues)
            const { error: insertError } = await window.USRA.supabase
                .from('schools')
                .insert(schoolData);
            
            if (insertError) {
                console.error('School insertion failed:', insertError);
                throw insertError;
            }
            
            console.log('School data inserted successfully');
            
            // Now try to get the inserted record (with retry mechanism)
            let schoolResult = null;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries && !schoolResult) {
                try {
                    const { data: selectData, error } = await window.USRA.supabase
                        .from('schools')
                        .select('*')
                        .eq('email', schoolData.email)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                    
                    if (!error && selectData) {
                        schoolResult = selectData;
                        console.log('School record retrieved:', schoolResult);
                        break;
                    }
                } catch (selectError) {
                    console.warn(`Attempt ${retryCount + 1} to retrieve school record failed:`, selectError);
                }
                
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`Retrying school record retrieval (${retryCount}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                }
            }
            
            // If we still can't get the record, create a fallback ID
            if (!schoolResult) {
                console.warn('Could not retrieve inserted school record, using fallback');
                schoolResult = { 
                    id: 'temp-' + Date.now(),
                    ...schoolData,
                    created_at: new Date().toISOString()
                };
            }

            console.log('School data inserted successfully, ID:', schoolResult.id);

            // Insert member data if user was created
            if (userCreated && userId) {
                console.log('Inserting member data...');
                const memberData = {
                    user_id: userId,
                    full_name: data.adminFullName,
                    nin: data.nin,
                    role: data.role,
                    sex: data.sex,
                    highest_qualification: data.qualification,
                    contact1: data.contact1,
                    contact2: data.contact2,
                    profile_photo_url: fileUrls.profilePhoto || null,
                    supporting_docs_url: fileUrls.supportingDocs || null
                };

                console.log('Member data:', memberData);

                const { error: memberError } = await window.USRA.supabase
                    .from('members')
                    .insert(memberData);
                
                if (memberError) {
                    console.warn('Member data insertion failed:', memberError);
                } else {
                    console.log('Member data inserted successfully');
                }
            }

            // Return success with combined data
            const result = {
                success: true,
                data: {
                    ...data,
                    schoolId: schoolResult.id,
                    fileUrls: fileUrls,
                    userCreated: userCreated
                }
            };
            
            console.log('=== SAVE TO DATABASE COMPLETED SUCCESSFULLY ===');
            console.log('Final result:', result);
            return result;

        } catch (error) {
            console.error('=== SAVE TO DATABASE FAILED ===');
            console.error('Database save error:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return {
                success: false,
                message: error.message || 'Unknown database error'
            };
        }
        }; // End saveOperation function

        // Race between the save operation and timeout
        try {
            return await Promise.race([saveOperation(), timeoutPromise]);
        } catch (error) {
            console.error('Database operation failed or timed out:', error);
            return {
                success: false,
                message: error.message || 'Database operation failed'
            };
        }
    }

    async handleFileUploads(formData) {
        const fileUrls = {};
        
        try {
            const userId = 'anonymous-' + Date.now();

            // Handle school badge upload
            const schoolBadge = formData.get('schoolBadge');
            if (schoolBadge && schoolBadge.size > 0) {
                const fileExt = schoolBadge.name.split('.').pop();
                const fileName = `${userId}/school-badge-${Date.now()}.${fileExt}`;
                
                const { data: badgeData, error: badgeError } = await window.USRA.supabase.storage
                    .from('school-badges')
                    .upload(fileName, schoolBadge);
                
                if (!badgeError && badgeData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('school-badges')
                        .getPublicUrl(fileName);
                    fileUrls.schoolBadge = publicUrl;
                }
            }

            // Handle profile photo upload
            const profilePhoto = formData.get('profilePhoto');
            if (profilePhoto && profilePhoto.size > 0) {
                const fileExt = profilePhoto.name.split('.').pop();
                const fileName = `${userId}/profile-photo-${Date.now()}.${fileExt}`;
                
                const { data: photoData, error: photoError } = await window.USRA.supabase.storage
                    .from('profile-photos')
                    .upload(fileName, profilePhoto);
                
                if (!photoError && photoData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('profile-photos')
                        .getPublicUrl(fileName);
                    fileUrls.profilePhoto = publicUrl;
                }
            }

            // Handle supporting documents upload
            const supportingDocs = formData.get('supportingDocs');
            if (supportingDocs && supportingDocs.size > 0) {
                const fileExt = supportingDocs.name.split('.').pop();
                const fileName = `${userId}/supporting-docs-${Date.now()}.${fileExt}`;
                
                const { data: docsData, error: docsError } = await window.USRA.supabase.storage
                    .from('supporting-docs')
                    .upload(fileName, supportingDocs);
                
                if (!docsError && docsData) {
                    const { data: { publicUrl } } = window.USRA.supabase.storage
                        .from('supporting-docs')
                        .getPublicUrl(fileName);
                    fileUrls.supportingDocs = publicUrl;
                }
            }

        } catch (error) {
            console.warn('File upload error:', error);
        }

        return fileUrls;
    }

    generateId() {
        return 'USRA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    showLoading(show) {
        let overlay = document.getElementById('loadingOverlay');
        
        if (show && !overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-red); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h3 style="color: var(--primary-red); margin-bottom: 10px;">Processing Registration...</h3>
                    <p style="color: #666;">Please wait while we save your information</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(overlay);
        } else if (!show && overlay) {
            overlay.remove();
        }
    }

    showSuccessOverlay() {
        // Remove any existing overlays
        const existingOverlay = document.getElementById('loadingOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'successOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; animation: successPulse 1s ease-out;">
                    <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
                </div>
                <h2 style="color: #10b981; margin-bottom: 15px; font-size: 2rem;">Registration Successful!</h2>
                <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px;">Your school has been registered successfully</p>
                <p style="color: #999; font-size: 0.9rem; margin-bottom: 20px;">Redirecting to your profile page...</p>
                <button onclick="window.location.href='profile.html'" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 10px;">
                    View Profile Page
                </button>
            </div>
            <style>
                @keyframes successPulse {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;
        document.body.appendChild(overlay);

        // Auto-remove after redirect
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    }
}

// Global function for password toggle (backward compatibility)
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const passwordIcon = document.getElementById(fieldId + 'Icon');
    
    if (passwordField && passwordIcon) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    }
}

// Global debug functions for testing
window.debugRegistration = {
    testRedirect: function() {
        console.log('Testing redirect to profile page...');
        window.location.href = 'profile.html';
    },
    
    testDataStorage: function() {
        const testData = {
            schoolName: 'Test School',
            adminFullName: 'Test User',
            schoolEmail: 'test@school.com',
            registrationDate: new Date().toISOString()
        };
        localStorage.setItem('registrationData', JSON.stringify(testData));
        console.log('Test data stored:', testData);
        this.testRedirect();
    },
    
    checkSupabase: function() {
        console.log('USRA object:', window.USRA);
        console.log('Supabase:', window.USRA?.supabase);
        if (window.USRA?.supabase) {
            console.log('Supabase connection appears to be available');
        } else {
            console.error('Supabase connection not available');
        }
    }
};

// Add to console for easy access
console.log('Debug functions available: window.debugRegistration');
console.log('- debugRegistration.testRedirect() - Test redirect to profile');
console.log('- debugRegistration.testDataStorage() - Test data storage and redirect');
console.log('- debugRegistration.checkSupabase() - Check Supabase connection');

// Dashboard Role Check
const DashboardManager = {
    async init() {
        try {
            if (!window.USRA || !window.USRA.supabase) return;
            
            const navDash = document.getElementById('navDashboard');
            if (!navDash) return;
            
            const { data: { user } } = await window.USRA.supabase.auth.getUser();
            if (!user) { 
                navDash.style.display = 'none'; 
                return; 
            }
            
            const { data: rows } = await window.USRA.supabase
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
        } catch (error) {
            console.warn('Dashboard role check failed:', error);
        }
    }
};

// Lightbox Manager
const LightboxManager = {
    init() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!galleryItems.length) return;

        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');

        if (!lightbox || !lightboxImage) return;

        let currentIndex = 0;
        const items = Array.from(galleryItems);

        const openLightbox = (index) => {
            currentIndex = index;
            const item = items[currentIndex];
            const imgSrc = item.getAttribute('href');
            const caption = item.getAttribute('data-title') || '';

            lightboxImage.src = imgSrc;
            if (lightboxCaption) lightboxCaption.textContent = caption;
            
            lightbox.style.display = 'flex';
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.style.display = 'none';
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % items.length;
            openLightbox(currentIndex);
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            openLightbox(currentIndex);
        };

        // Event listeners
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxNext) lightboxNext.addEventListener('click', showNext);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                switch (e.key) {
                    case 'Escape':
                        closeLightbox();
                        break;
                    case 'ArrowRight':
                        showNext();
                        break;
                    case 'ArrowLeft':
                        showPrev();
                        break;
                    default:
                        break;
                }
            }
        });

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
};

// Add Ripple CSS Animation
(function addRippleStyles() {
    if (document.querySelector('#ripple-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
    // Navbar JS from provided spec
    EventsManager.init();
    StatsManager.init();
    // Initialize Enhanced Registration System
    if (document.getElementById('schoolRegistrationForm')) {
        new RegistrationSystem();
    } else {
    FormManager.init();
    }
    DashboardManager.init();
    LightboxManager.init();

    // Enhance navbar to mirror provided behavior
    (function providedNavbarJS(){
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const body = document.body;
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                mobileMenu.classList.toggle('open');
                body.classList.toggle('menu-open');

                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', (!isExpanded).toString());
            });
        }

        const dropdownButtons = document.querySelectorAll('.dropdown-mobile button');
        dropdownButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dropdownContent = button.nextElementSibling;
                const icon = button.querySelector('i');

                if (dropdownContent) dropdownContent.classList.toggle('hidden');

                if (icon) {
                    if (dropdownContent && dropdownContent.classList.contains('hidden')) {
                        icon.setAttribute('data-feather', 'chevron-down');
                    } else {
                        icon.setAttribute('data-feather', 'chevron-up');
                    }
                    if (window.feather && typeof window.feather.replace === 'function') {
                        window.feather.replace();
                    }
                }
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;
                e.preventDefault();
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    hamburger?.classList.remove('active');
                    mobileMenu.classList.remove('open');
                    document.body.classList.remove('menu-open');
                    hamburger?.setAttribute('aria-expanded', 'false');
                }
                window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
            });
        });

        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            document.querySelectorAll('section').forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}` || 
                            (sectionId === 'index' && link.getAttribute('href') === 'index.html')) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    })();
});

// Export for global access
window.USRAUtils = Utils;
