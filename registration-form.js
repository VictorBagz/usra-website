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


// Initialize Supabase - Fixed to ensure single instance
if (!window.supabaseClient) {
    const supabaseUrl = 'https://ycdsyaenakevtozcomgk.supabase.co'; // Fixed: Removed trailing spaces
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHN5YWVuYWtldnRvemNvbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzczMjAsImV4cCI6MjA3MjA1MzMyMH0.BxT4n22lnBEDL0TA7LNqIyti0LJ4dxGMgx5tOZiqQzE';
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

const supabase = window.supabaseClient;

// Add form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schoolRegistrationForm');
    if (!form) return;

    // Handler function to prevent duplicates
    const submitHandler = async function(e) {
        e.preventDefault();
        
        // Validate the current step before submission
        if (!validateCurrentStep()) {
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'success-message';
        loadingMessage.style.display = 'block';
        loadingMessage.textContent = 'Processing your registration...';
        form.prepend(loadingMessage);

        try {
            console.log('Starting registration process...');
            
            // Collect all form data
            const formData = new FormData(form);
            
            // Get form values
            const schoolData = {
                school_name: formData.get('schoolName'),
                center_number: formData.get('centerNumber'),
                school_email: formData.get('schoolEmail'),
                school_phone1: formData.get('schoolPhone1'),
                school_phone2: formData.get('schoolPhone2') || null,
                address: formData.get('address'),
                region: formData.get('region'),
                district: formData.get('district'),
                admin_full_name: formData.get('adminFullName'),
                nin: formData.get('nin'),
                role: formData.get('role'),
                sex: formData.get('sex'),
                qualification: formData.get('qualification'),
                contact1: formData.get('contact1'),
                contact2: formData.get('contact2') || null,
                created_at: new Date().toISOString(),
                status: 'pending',
                registration_date: new Date().toISOString().split('T')[0]
            };
            
            console.log('Form data collected:', schoolData);
            
            // Create auth user with Supabase
            console.log('Attempting to create auth user...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: schoolData.school_email,
                password: formData.get('adminPassword'),
                options: {
                    data: {
                        full_name: schoolData.admin_full_name,
                        role: 'school_admin'
                    }
                }
            });
            
            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }
            
            if (!authData.user) {
                console.error('Authentication failed - no user returned');
                throw new Error('Authentication failed');
            }
            
            console.log('Auth user created successfully:', authData.user.id);
            
            // Upload files if any
            // School badge
            const schoolBadgeFile = formData.get('schoolBadge');
            if (schoolBadgeFile && schoolBadgeFile.size > 0) {
                console.log('Uploading school badge...');
                const fileExt = schoolBadgeFile.name.split('.').pop();
                const fileName = `${authData.user.id}/badge_${Date.now()}.${fileExt}`;
                const { data: badgeData, error: badgeError } = await supabase.storage
                    .from('school_badges')
                    .upload(fileName, schoolBadgeFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (badgeError) {
                    console.error('Badge upload error:', badgeError);
                    throw badgeError;
                }
                
                // Get public URL
                const { data: badgeUrlData } = supabase.storage
                    .from('school_badges')
                    .getPublicUrl(fileName);
                
                schoolData.school_badge_url = badgeUrlData.publicUrl;
                console.log('Badge uploaded successfully');
            }
            
            // Profile photo
            const profilePhotoFile = formData.get('profilePhoto');
            if (profilePhotoFile && profilePhotoFile.size > 0) {
                console.log('Uploading profile photo...');
                const fileExt = profilePhotoFile.name.split('.').pop();
                const fileName = `${authData.user.id}/profile_${Date.now()}.${fileExt}`;
                const { data: photoData, error: photoError } = await supabase.storage
                    .from('profile_photos')
                    .upload(fileName, profilePhotoFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (photoError) {
                    console.error('Profile photo upload error:', photoError);
                    throw photoError;
                }
                
                // Get public URL
                const { data: photoUrlData } = supabase.storage
                    .from('profile_photos')
                    .getPublicUrl(fileName);
                
                schoolData.profile_photo_url = photoUrlData.publicUrl;
                console.log('Profile photo uploaded successfully');
            }
            
            // Supporting documents (TMIS Certificate)
            const supportingDocsFile = formData.get('supportingDocs');
            if (supportingDocsFile && supportingDocsFile.size > 0) {
                console.log('Uploading supporting documents...');
                const fileExt = supportingDocsFile.name.split('.').pop();
                const fileName = `${authData.user.id}/tmis_${Date.now()}.${fileExt}`;
                const { data: docsData, error: docsError } = await supabase.storage
                    .from('supporting_documents')
                    .upload(fileName, supportingDocsFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (docsError) {
                    console.error('Document upload error:', docsError);
                    throw docsError;
                }
                
                // Get public URL
                const { data: docsUrlData } = supabase.storage
                    .from('supporting_documents')
                    .getPublicUrl(fileName);
                
                schoolData.supporting_docs_url = docsUrlData.publicUrl;
                console.log('Documents uploaded successfully');
            }
            
            // Add user ID to school data
            schoolData.user_id = authData.user.id;
            
            // Save to schools table in Supabase
            console.log('Saving to schools table...');
            const { data: schoolRecord, error: insertError } = await supabase
                .from('schools')
                .insert([schoolData])
                .select();
            
            if (insertError) {
                console.error('Database insert error:', insertError);
                throw insertError;
            }
            
            console.log('Registration completed successfully!');
            
            // Hide loading message
            loadingMessage.style.display = 'none';
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.display = 'block';
            successMessage.innerHTML = 'Registration successful! Redirecting to your profile...';
            form.prepend(successMessage);
            
            // Save data to session for profile page
            const registrationData = {
                ...schoolData,
                admin_password: '********', // Don't store actual password
                user_id: authData.user.id
            };
            sessionStorage.setItem('registrationData', JSON.stringify(registrationData));
            
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = `profile.html?schoolId=${authData.user.id}`;
            }, 3000);
            
        } catch (error) {
            console.error('Complete registration error:', error);
            
            // Hide loading message
            loadingMessage.style.display = 'none';
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = `Error: ${error.message || 'There was an error processing your registration. Please try again.'}`;
            form.prepend(errorMessage);
            
            // Re-enable submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Remove error message after 5 seconds
            setTimeout(() => {
                if (errorMessage.parentNode) {
                    errorMessage.remove();
                }
            }, 5000);
        }
    };
    
    // Remove existing listeners if any and add new one
    form.removeEventListener('submit', submitHandler);
    form.addEventListener('submit', submitHandler);

    // Add helper function to validate current step (if not already defined)
    if (typeof validateCurrentStep !== 'function') {
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
    }
    
    console.log('Supabase registration handler initialized!');
});

// Helper functions (add these if they don't exist)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Ensure these functions exist for error handling
if (typeof showFieldError !== 'function') {
    function showFieldError(field, message) {
        clearFieldError(field);
        
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 0.3rem;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }
}

if (typeof clearFieldError !== 'function') {
    function clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Add this diagnostic code at the end of your JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schoolRegistrationForm');
    if (!form) return;

    // Diagnostic submission handler
    const diagnosticSubmitHandler = async function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Diagnosing...';
        submitBtn.disabled = true;
        
        // Create diagnostic panel
        const diagnosticPanel = document.createElement('div');
        diagnosticPanel.style.cssText = `
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 14px;
            max-height: 400px;
            overflow-y: auto;
        `;
        diagnosticPanel.innerHTML = '<h4 style="margin-top: 0; color: #007bff;">Registration Diagnostic Log:</h4>';
        form.prepend(diagnosticPanel);
        
        const logMessage = (message, type = 'info') => {
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                padding: 5px 0;
                border-bottom: 1px solid #eee;
                color: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#666'};
                font-weight: ${type === 'error' ? 'bold' : 'normal'};
            `;
            logEntry.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
            diagnosticPanel.appendChild(logEntry);
            diagnosticPanel.scrollTop = diagnosticPanel.scrollHeight;
            console.log(message);
        };

        try {
            logMessage('🚀 Starting registration diagnostic...', 'info');
            
            // Test 1: Check Supabase connection
            logMessage('🔍 Testing Supabase connection...', 'info');
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }
            logMessage('✅ Supabase client initialized', 'success');
            
            // Test 2: Test network connectivity to Supabase
            logMessage('🌐 Testing network connectivity...', 'info');
            try {
                const testResponse = await fetch('https://ycdsyaenakevtozcomgk.supabase.co/rest/v1/', {
                    method: 'HEAD',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHN5YWVuYWtldnRvemNvbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzczMjAsImV4cCI6MjA3MjA1MzMyMH0.BxT4n22lnBEDL0TA7LNqIyti0LJ4dxGMgx5tOZiqQzE',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHN5YWVuYWtldnRvemNvbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzczMjAsImV4cCI6MjA3MjA1MzMyMH0.BxT4n22lnBEDL0TA7LNqIyti0LJ4dxGMgx5tOZiqQzE'
                    }
                });
                if (testResponse.ok) {
                    logMessage('✅ Network connectivity to Supabase OK', 'success');
                } else {
                    throw new Error(`Network test failed with status: ${testResponse.status}`);
                }
            } catch (networkError) {
                logMessage(`❌ Network connectivity test failed: ${networkError.message}`, 'error');
                throw networkError;
            }
            
            // Collect form data
            const formData = new FormData(form);
            const schoolData = {
                school_name: formData.get('schoolName'),
                center_number: formData.get('centerNumber'),
                school_email: formData.get('schoolEmail'),
                school_phone1: formData.get('schoolPhone1'),
                admin_full_name: formData.get('adminFullName'),
                created_at: new Date().toISOString(),
                status: 'pending',
                registration_date: new Date().toISOString().split('T')[0]
            };
            
            logMessage('📋 Form data collected successfully', 'success');
            logMessage(`📧 Email to be used: ${schoolData.school_email}`, 'info');
            
            // Test 3: Try authentication with minimal data
            logMessage('🔐 Attempting authentication...', 'info');
            const authStartTime = Date.now();
            
            const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
                email: schoolData.school_email,
                password: formData.get('adminPassword'),
                options: {
                    data: {
                        full_name: schoolData.admin_full_name,
                        role: 'school_admin'
                    }
                }
            });
            
            const authDuration = Date.now() - authStartTime;
            logMessage(`⏱️ Authentication attempt took ${authDuration}ms`, 'info');
            
            if (authError) {
                logMessage(`❌ Authentication failed: ${authError.message}`, 'error');
                logMessage(`📝 Error details: ${JSON.stringify(authError)}`, 'error');
                throw authError;
            }
            
            if (!authData || !authData.user) {
                logMessage('❌ Authentication returned no user data', 'error');
                throw new Error('Authentication failed - no user returned');
            }
            
            logMessage(`✅ Authentication successful! User ID: ${authData.user.id}`, 'success');
            
            // Test 4: Try database insert with minimal data
            logMessage('💾 Attempting database insert...', 'info');
            const dbStartTime = Date.now();
            
            const { error: dbError } = await window.supabaseClient
                .from('schools')
                .insert([{
                    school_name: schoolData.school_name,
                    school_email: schoolData.school_email,
                    admin_full_name: schoolData.admin_full_name,
                    user_id: authData.user.id,
                    status: 'pending'
                }]);
            
            const dbDuration = Date.now() - dbStartTime;
            logMessage(`⏱️ Database insert took ${dbDuration}ms`, 'info');
            
            if (dbError) {
                logMessage(`❌ Database insert failed: ${dbError.message}`, 'error');
                logMessage(`📝 Error details: ${JSON.stringify(dbError)}`, 'error');
                throw dbError;
            }
            
            logMessage('✅ Database insert successful!', 'success');
            
            // Test 5: Try to read back the data
            logMessage('🔍 Verifying data was saved...', 'info');
            const { data: verifyData, error: verifyError } = await window.supabaseClient
                .from('schools')
                .select('*')
                .eq('user_id', authData.user.id)
                .single();
            
            if (verifyError) {
                logMessage(`⚠️ Could not verify saved data: ${verifyError.message}`, 'error');
            } else {
                logMessage('✅ Data verification successful!', 'success');
            }
            
            // Success! Save data and redirect
            logMessage('🎉 Registration completed successfully!', 'success');
            
            // Hide diagnostic panel after 3 seconds
            setTimeout(() => {
                if (diagnosticPanel.parentNode) {
                    diagnosticPanel.remove();
                }
            }, 3000);
            
            // Save data for profile page
            const registrationData = {
                ...schoolData,
                user_id: authData.user.id,
                admin_password: '********'
            };
            sessionStorage.setItem('registrationData', JSON.stringify(registrationData));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.display = 'block';
            successMessage.innerHTML = 'Registration successful! Redirecting to your profile...';
            form.prepend(successMessage);
            
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = `profile.html?schoolId=${authData.user.id}`;
            }, 3000);
            
        } catch (error) {
            logMessage(`🚨 REGISTRATION FAILED: ${error.message}`, 'error');
            logMessage(`📝 Full error: ${error.stack || error}`, 'error');
            
            // Show user-friendly error
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = `
                <strong>Registration Failed</strong><br>
                Error: ${error.message}<br>
                Please check the diagnostic log above for details.<br>
                If problems persist, contact support.
            `;
            form.prepend(errorMessage);
            
            // Re-enable submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Remove error message after 10 seconds
            setTimeout(() => {
                if (errorMessage.parentNode) {
                    errorMessage.remove();
                }
            }, 10000);
        }
    };

    // Remove any existing listeners and add our diagnostic handler
    form.removeEventListener('submit', diagnosticSubmitHandler);
    form.addEventListener('submit', diagnosticSubmitHandler);
    
    console.log('Diagnostic registration handler installed!');
});


// Fallback registration system - use if Supabase fails
document.addEventListener('DOMContentLoaded', function() {
    const useFallback = false; // Set to true if you want to force fallback mode
    
    if (useFallback) {
        const form = document.getElementById('schoolRegistrationForm');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = document.querySelector('.submit-form');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            try {
                // Collect form data
                const formData = new FormData(form);
                const schoolData = {
                    school_name: formData.get('schoolName'),
                    center_number: formData.get('centerNumber'),
                    school_email: formData.get('schoolEmail'),
                    admin_full_name: formData.get('adminFullName'),
                    created_at: new Date().toISOString(),
                    status: 'pending',
                    registration_date: new Date().toISOString().split('T')[0],
                    user_id: 'fallback_' + Date.now()
                };
                
                // Save to session storage
                sessionStorage.setItem('registrationData', JSON.stringify(schoolData));
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.style.display = 'block';
                successMessage.innerHTML = 'Registration successful! Redirecting to your profile...';
                form.prepend(successMessage);
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = `profile.html?schoolId=${schoolData.user_id}`;
                }, 2000);
                
            } catch (error) {
                console.error('Fallback registration failed:', error);
                
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = `Error: ${error.message || 'Registration failed. Please try again.'}`;
                form.prepend(errorMessage);
                
                // Re-enable submit button
                submitBtn.innerHTML = 'Submit Registration';
                submitBtn.disabled = false;
            }
        });
        
        console.log('Fallback registration system available (set useFallback = true to activate)');
    }
});