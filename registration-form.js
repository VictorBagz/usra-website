// Registration Form Multi-Step Functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schoolRegistrationForm');
    if (!form) return;

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

    // Form submission enhancement
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate terms acceptance
        if (!termsCheckbox?.checked) {
            alert('Please accept the terms and conditions to proceed.');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate submission delay and then proceed with normal form submission
        setTimeout(() => {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // The actual form submission will be handled by the existing script.js
            // Just trigger the original form submission logic here if needed
        }, 1000);
    });

    console.log('Registration form enhanced with multi-step functionality! 🎉');
});
