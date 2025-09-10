// Profile Page JavaScript
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

    const loadingOverlay = document.getElementById('loadingOverlay');
    const printButton = document.getElementById('printProfile');

    // Load profile data from URL parameters or localStorage
    loadProfileData();

    // Set up print functionality
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

    // Hide loading overlay after content loads
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 1000);

    function loadProfileData() {
        try {
            // Try to get data from URL parameters first
            const urlParams = new URLSearchParams(window.location.search);
            const registrationData = urlParams.get('data');
            
            let data = null;
            
            if (registrationData) {
                // Decode data from URL parameter
                data = JSON.parse(decodeURIComponent(registrationData));
            } else {
                // Fallback to localStorage
                const storedData = localStorage.getItem('registrationData');
                if (storedData) {
                    data = JSON.parse(storedData);
                }
            }

            if (data) {
                populateProfileData(data);
                // Clear localStorage after use for security
                localStorage.removeItem('registrationData');
            } else {
                // No data available, redirect to registration
                showNoDataMessage();
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            showNoDataMessage();
        }
    }

    function populateProfileData(data) {
        // School Information
        setElementText('schoolName', data.schoolName);
        setElementText('centerNumber', data.centerNumber);
        setElementText('schoolEmail', data.schoolEmail);
        setElementText('contact1', data.schoolPhone1);
        setElementText('region', data.region);
        setElementText('district', data.district);
        setElementText('address', data.address);

        // Representative Information
        setElementText('adminFullName', data.adminFullName);
        setElementText('nin', data.nin);
        setElementText('role', data.role);
        setElementText('sex', data.sex);
        setElementText('qualification', data.qualification);
        setElementText('adminContact1', data.contact1);

        // Display school badge if available
        displaySchoolBadge(data);

        // Handle uploaded files
        handleUploadedFiles(data);

        // Update page title with school name
        if (data.schoolName) {
            document.title = `${data.schoolName} - Registration Profile - USRA`;
        }

        // Display registration date if available
        if (data.registrationDate) {
            const registrationDate = new Date(data.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Add registration date to the status section
            const statusSection = document.querySelector('.sidebar-card');
            if (statusSection) {
                const dateInfo = document.createElement('p');
                dateInfo.style.cssText = 'margin-top: 10px; color: #666; font-size: 0.85rem;';
                dateInfo.innerHTML = `<i class="fas fa-calendar"></i> Registered: ${registrationDate}`;
                statusSection.appendChild(dateInfo);
            }
        }
    }

    function displaySchoolBadge(data) {
        const fileUrls = data.fileUrls || {};
        const schoolBadgeUrl = fileUrls.schoolBadge || data.schoolBadge;
        
        if (schoolBadgeUrl) {
            // Find a good place to display the school badge
            const schoolInfoSection = document.querySelector('.info-section');
            if (schoolInfoSection) {
                // Create a badge display element
                const badgeContainer = document.createElement('div');
                badgeContainer.style.cssText = `
                    text-align: center;
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 2px dashed #ddd;
                `;
                
                badgeContainer.innerHTML = `
                    <h4 style="margin-bottom: 15px; color: var(--primary-red);">
                        <i class="fas fa-image"></i> School Badge
                    </h4>
                    <img src="${schoolBadgeUrl}" alt="School Badge" 
                         style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                `;
                
                // Insert after the school information grid
                const infoGrid = schoolInfoSection.querySelector('.info-grid');
                if (infoGrid) {
                    schoolInfoSection.insertBefore(badgeContainer, infoGrid.nextSibling);
                }
            }
        }
    }

    function setElementText(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value || '-';
        }
    }

    function handleUploadedFiles(data) {
        const fileDownloads = document.getElementById('fileDownloads');
        const documentsSection = document.getElementById('documentsSection');
        
        if (!fileDownloads || !documentsSection) return;

        const files = [];
        
        // Check for uploaded files from fileUrls object or direct file references
        const fileUrls = data.fileUrls || {};
        
        if (fileUrls.schoolBadge || data.schoolBadge) {
            files.push({
                name: 'School Badge',
                type: 'image',
                icon: 'fas fa-image',
                url: fileUrls.schoolBadge || data.schoolBadge
            });
        }
        
        if (fileUrls.profilePhoto || data.profilePhoto) {
            files.push({
                name: 'Profile Photo',
                type: 'image',
                icon: 'fas fa-camera',
                url: fileUrls.profilePhoto || data.profilePhoto
            });
        }
        
        if (fileUrls.supportingDocs || data.supportingDocs) {
            files.push({
                name: 'TMIS Certificate',
                type: 'document',
                icon: 'fas fa-file-pdf',
                url: fileUrls.supportingDocs || data.supportingDocs
            });
        }

        if (files.length > 0) {
            fileDownloads.innerHTML = '';
            files.forEach(file => {
                const fileItem = createFileItem(file);
                fileDownloads.appendChild(fileItem);
            });
        } else {
            documentsSection.style.display = 'none';
        }
    }

    function createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="${file.icon}"></i>
                </div>
                <div>
                    <div style="font-weight: 500;">${file.name}</div>
                    <div style="font-size: 0.8rem; color: #666;">${file.type.toUpperCase()}</div>
                </div>
            </div>
            <a href="${file.url}" target="_blank" class="btn btn-outline" style="padding: 8px 12px; font-size: 0.8rem;">
                <i class="fas fa-download"></i>
                View
            </a>
        `;
        
        return fileItem;
    }

    function showNoDataMessage() {
        // Show message when no registration data is available
        const profileMain = document.querySelector('.profile-main');
        if (profileMain) {
            profileMain.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3>No Registration Data Found</h3>
                    <p style="color: #666; margin-bottom: 30px;">
                        We couldn't find your registration information. This might happen if you accessed this page directly.
                    </p>
                    <a href="registration.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Start New Registration
                    </a>
                </div>
            `;
        }

        // Update hero section
        const profileHeader = document.querySelector('.profile-header');
        if (profileHeader) {
            profileHeader.innerHTML = `
                <div class="success-icon" style="color: #ff6b6b;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1>Registration Not Found</h1>
                <p>Please complete the registration process to view your profile</p>
            `;
        }
    }

    // Enhanced mobile navigation
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

    // Add smooth scroll behavior
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

    // Add interactive button effects
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

    // Auto-hide loading overlay on page interactions
    document.addEventListener('click', function() {
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            loadingOverlay.style.display = 'none';
        }
    });

    // Handle browser back button
    window.addEventListener('popstate', function(event) {
        // Clear any stored registration data when navigating away
        localStorage.removeItem('registrationData');
    });

    console.log('Profile page initialized! 👤');
});
