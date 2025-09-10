// Sign In Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    const signinForm = document.getElementById('signinForm');
    const btnSignIn = document.getElementById('btnSignIn');
    const btnCreateAccount = document.getElementById('btnCreateAccount');
    const signinStatus = document.getElementById('signinStatus');
    const forgotPassword = document.getElementById('forgotPassword');

    // Handle sign in form submission
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!window.USRA || !window.USRA.supabase) {
                showStatus('Authentication service not available', 'error');
                return;
            }

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showStatus('Please enter both email and password', 'error');
                return;
            }

            // Show loading state
            btnSignIn.disabled = true;
            btnSignIn.innerHTML = '<span class="loading"></span> Signing in...';

            try {
                const { data, error } = await window.USRA.signInWithEmail(email, password);
                
                if (error) {
                    showStatus(error.message, 'error');
                } else {
                    showStatus('Sign in successful! Redirecting...', 'success');
                    
                    // Redirect to dashboard after successful sign in
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Sign in error:', error);
                showStatus('Sign in failed. Please try again.', 'error');
            } finally {
                // Reset button state
                btnSignIn.disabled = false;
                btnSignIn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            }
        });
    }

    // Handle create account button
    if (btnCreateAccount) {
        btnCreateAccount.addEventListener('click', async function() {
            if (!window.USRA || !window.USRA.supabase) {
                showStatus('Authentication service not available', 'error');
                return;
            }

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showStatus('Please enter both email and password to create an account', 'error');
                return;
            }

            // Show loading state
            btnCreateAccount.disabled = true;
            btnCreateAccount.innerHTML = '<span class="loading"></span> Creating account...';

            try {
                const { data, error } = await window.USRA.signUpWithEmail(email, password);
                
                if (error) {
                    showStatus(error.message, 'error');
                } else {
                    showStatus('Account created successfully! Check your email to confirm your account.', 'success');
                    
                    // Clear form
                    document.getElementById('email').value = '';
                    document.getElementById('password').value = '';
                }
            } catch (error) {
                console.error('Sign up error:', error);
                showStatus('Account creation failed. Please try again.', 'error');
            } finally {
                // Reset button state
                btnCreateAccount.disabled = false;
                btnCreateAccount.innerHTML = '<i class="fas fa-user-plus"></i> Create Administrator Account';
            }
        });
    }

    // Handle forgot password
    if (forgotPassword) {
        forgotPassword.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            
            if (!email) {
                showStatus('Please enter your email address first', 'error');
                return;
            }

            if (!window.USRA || !window.USRA.supabase) {
                showStatus('Authentication service not available', 'error');
                return;
            }

            try {
                const { error } = await window.USRA.supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password.html'
                });
                
                if (error) {
                    showStatus(error.message, 'error');
                } else {
                    showStatus('Password reset email sent! Check your inbox.', 'success');
                }
            } catch (error) {
                console.error('Password reset error:', error);
                showStatus('Failed to send reset email. Please try again.', 'error');
            }
        });
    }

    // Check if user is already signed in
    checkAuthState();

    // Utility function to show status messages
    function showStatus(message, type) {
        if (signinStatus) {
            signinStatus.style.display = 'block';
            signinStatus.textContent = message;
            signinStatus.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
            signinStatus.style.color = type === 'success' ? '#155724' : '#721c24';
            signinStatus.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
        }
    }

    // Check authentication state
    async function checkAuthState() {
        if (!window.USRA || !window.USRA.supabase) return;

        try {
            const { data: { user } } = await window.USRA.supabase.auth.getUser();
            
            if (user) {
                // User is already signed in, redirect to dashboard
                showStatus('You are already signed in. Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    // Enhanced form interactions
    const formInputs = document.querySelectorAll('input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Mobile navigation (reuse from main script)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    console.log('Sign in page initialized! 🔐');
});
