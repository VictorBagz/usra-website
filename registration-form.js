// Registration Form Multi-Step Functionality - Enhanced version now in script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schoolRegistrationForm');
    if (!form) return;
    
    // Check if new RegistrationSystem is already handling this form
    if (window.RegistrationSystem) {
        console.log('Enhanced RegistrationSystem is active');
        return; // Let the new system handle everything
    }

    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    // Initialize form
    showStep(currentStep);
    updateProgressBar();

    // Next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateCurrentStep()) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    showStep(currentStep);
                    updateProgressBar();
                    updateSummary();
                }
            }
        });
    });

    // Previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                updateProgressBar();
            }
        });
    });

    // Show specific step
    function showStep(step) {
        steps.forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 === step);
        });
        
        // Scroll to top of form
        const formContainer = document.querySelector('.registration-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Update progress bar
    function updateProgressBar() {
        progressSteps.forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 <= currentStep);
        });
    }

    // Validate current step
    function validateCurrentStep() {
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const requiredFields = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                clearFieldError(field);
                
                // Additional validation
                if (field.type === 'email' && !isValidEmail(field.value)) {
                    showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                } else if (field.type === 'tel' && !isValidPhone(field.value)) {
                    showFieldError(field, 'Please enter a valid phone number');
                    isValid = false;
                } else if (field.type === 'password' && field.value.length < 6) {
                    showFieldError(field, 'Password must be at least 6 characters long');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Update summary on step 3
    function updateSummary() {
        if (currentStep === 3) {
            const summaryElements = document.querySelectorAll('[data-field]');
            summaryElements.forEach(element => {
                const fieldName = element.getAttribute('data-field');
                const field = document.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    element.textContent = field.value || '-';
                }
            });
        }
    }

    // Show field error
    function showFieldError(field, message) {
        clearFieldError(field);
        
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

    // Clear field error
    function clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    // File upload enhancements
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const uploadArea = this.parentNode.querySelector('.file-upload-area');
            const fileName = this.files[0]?.name;
            
            if (fileName) {
                const span = uploadArea.querySelector('span');
                span.textContent = `Selected: ${fileName}`;
                uploadArea.style.borderColor = 'var(--primary-red)';
                uploadArea.style.background = 'rgba(255, 0, 0, 0.05)';
            }
        });
    });

    // Terms checkbox enhancement
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

    // Add smooth transitions and animations
    function addFormAnimations() {
        // Animate form fields on focus
        const formInputs = document.querySelectorAll('.form-group input, .form-group select');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentNode.style.transform = 'translateY(-2px)';
                this.parentNode.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentNode.style.transform = 'translateY(0)';
            });
        });

        // Animate buttons on hover
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'all 0.3s ease';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // Initialize animations
    addFormAnimations();

    // Progress step click navigation
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            const targetStep = index + 1;
            
            // Only allow navigation to previous steps or current step
            if (targetStep <= currentStep) {
                currentStep = targetStep;
                showStep(currentStep);
                updateProgressBar();
            }
        });
        
        // Add cursor pointer for clickable steps
        step.style.cursor = 'pointer';
    });

    // Auto-save functionality enhancement
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('input', debounce(function() {
            // Visual indication of auto-save
            const indicator = document.createElement('div');
            indicator.textContent = 'Saved';
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
        }, 2000));
    });

    // Debounce utility
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

    // Enhanced form validation only - submission handled by script.js
    // Note: Removing this event listener to prevent conflicts with script.js
    // All validation will be handled in script.js for better control

    // Password strength and visibility functionality
    const adminPasswordField = document.getElementById('adminPassword');
    const passwordStrengthDiv = document.getElementById('passwordStrength');
    
    if (adminPasswordField && passwordStrengthDiv) {
        adminPasswordField.addEventListener('input', function() {
            const password = this.value;
            updatePasswordStrength(password);
        });

        adminPasswordField.addEventListener('focus', function() {
            passwordStrengthDiv.style.display = 'block';
        });
    }

    function updatePasswordStrength(password) {
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

    console.log('Registration form enhanced with multi-step functionality! 🎉');
});

// Global function for password toggle
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
