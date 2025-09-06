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
        btnSignOut: document.getElementById('btnSignOut'),
        authForm: document.getElementById('authForm'),
        authStatus: document.getElementById('authStatus')
    },

    setUI(state) {
        const { authBox, btnSignIn, btnSignUp, btnSignOut, authStatus } = this.elements;
        
        if (!authBox) return;
        
        if (state === 'signed-in') {
            if (btnSignIn) btnSignIn.style.display = 'none';
            if (btnSignUp) btnSignUp.style.display = 'none';
            if (btnSignOut) btnSignOut.style.display = 'inline-block';
            if (authStatus) authStatus.textContent = 'Signed in';
        } else {
            if (btnSignIn) btnSignIn.style.display = 'inline-block';
            if (btnSignUp) btnSignUp.style.display = 'inline-block';
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
        const { authForm, btnSignUp, btnSignOut, authStatus } = this.elements;

        if (authForm && window.USRA && window.USRA.supabase) {
            authForm.addEventListener('submit', this.handleSignIn.bind(this));

            if (btnSignUp) {
                btnSignUp.addEventListener('click', this.handleSignUp.bind(this));
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
        const form = document.getElementById('registrationForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!window.USRA || !window.USRA.supabase) {
                Utils.showNotification('Supabase not initialized', 'info');
                return;
            }

            try {
                const { data: auth } = await window.USRA.supabase.auth.getUser();
                if (!auth || !auth.user) {
                    Utils.showNotification('Please sign in as an administrator first.', 'info');
                    return;
                }

                const formData = new FormData(this);
                const payload = Object.fromEntries(formData);

                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
                submitBtn.disabled = true;

                const { error } = await window.USRA.supabase.from('schools').insert({
                    name: payload.schoolName,
                    principal_name: payload.principalName,
                    email: payload.email,
                    phone: payload.phone,
                    address: payload.address,
                    estimated_players: payload.players ? Number(payload.players) : null,
                    notes: payload.message || null
                });
                
                if (error) throw error;
                
                Utils.showNotification('Registration submitted successfully!', 'success');
                this.reset();
                
            } catch (err) {
                Utils.showNotification(`Submission failed: ${err.message}`, 'info');
            } finally {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Register School';
                    submitBtn.disabled = false;
                }
            }
        });
    }
};

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
    FormManager.init();
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
