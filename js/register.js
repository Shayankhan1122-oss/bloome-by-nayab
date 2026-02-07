// Registration Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Setup event listeners
    setupRegisterEventListeners();
});

// Setup register event listeners
function setupRegisterEventListeners() {
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
    
    // Social login buttons
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            handleSocialRegistration('google');
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            handleSocialRegistration('facebook');
        });
    }
}

// Handle registration
function handleRegistration() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Validate input
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!terms) {
        alert('Please agree to the Terms & Conditions');
        return;
    }
    
    // Validate password strength
    if (getPasswordStrength(password) < 3) {
        alert('Password is too weak. Please use a stronger password.');
        return;
    }
    
    // Show loading state
    const registerBtn = document.querySelector('.btn-primary');
    const originalText = registerBtn.textContent;
    registerBtn.textContent = 'Creating account...';
    registerBtn.disabled = true;
    
    // Simulate registration process
    setTimeout(() => {
        // In a real implementation, this would make an API call
        // For demo purposes, we'll just redirect to the account page
        localStorage.setItem('user', JSON.stringify({ 
            email, 
            name: `${firstName} ${lastName}`,
            phone
        }));
        window.location.href = 'account.html';
    }, 1500);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthMeter = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    
    const strength = getPasswordStrength(password);
    
    // Update meter width and color
    const width = strength * 25;
    strengthMeter.style.width = `${width}%`;
    
    if (strength === 0) {
        strengthMeter.style.background = '#dc3545';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#dc3545';
    } else if (strength === 1) {
        strengthMeter.style.background = '#ffc107';
        strengthText.textContent = 'Fair';
        strengthText.style.color = '#ffc107';
    } else if (strength === 2) {
        strengthMeter.style.background = '#17a2b8';
        strengthText.textContent = 'Good';
        strengthText.style.color = '#17a2b8';
    } else {
        strengthMeter.style.background = '#28a745';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#28a745';
    }
}

// Get password strength (0-3)
function getPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength++;
    
    // Number check
    if (/\d/.test(password)) strength++;
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    // Cap at 3 for display purposes
    return Math.min(strength, 3);
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
        confirmPasswordInput.setCustomValidity('');
    }
}

// Handle social registration
function handleSocialRegistration(provider) {
    // Show loading state
    const socialBtn = document.querySelector(`.social-btn.${provider}`);
    const originalText = socialBtn.innerHTML;
    socialBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Registering with ${provider}`;
    socialBtn.disabled = true;
    
    // Simulate social registration process
    setTimeout(() => {
        // In a real implementation, this would redirect to the social provider's OAuth
        // For demo purposes, we'll just redirect to the account page
        localStorage.setItem('user', JSON.stringify({ 
            email: `${provider}@example.com`, 
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` 
        }));
        window.location.href = 'account.html';
    }, 2000);
}

// Update cart count (inherited from main.js)
function updateCartCount() {
    // This function would be implemented in main.js
}