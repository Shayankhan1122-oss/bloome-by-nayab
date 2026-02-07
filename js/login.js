// Login Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Setup event listeners
    setupLoginEventListeners();
});

// Setup login event listeners
function setupLoginEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Social login buttons
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            handleSocialLogin('google');
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            handleSocialLogin('facebook');
        });
    }
}

// Handle login
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate input
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const loginBtn = document.querySelector('.btn-primary');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    // Simulate login process
    setTimeout(() => {
        // In a real implementation, this would make an API call
        // For demo purposes, we'll just redirect to the account page
        localStorage.setItem('user', JSON.stringify({ email, name: 'John Doe' }));
        window.location.href = 'account.html';
    }, 1500);
}

// Handle social login
function handleSocialLogin(provider) {
    // Show loading state
    const socialBtn = document.querySelector(`.social-btn.${provider}`);
    const originalText = socialBtn.innerHTML;
    socialBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Logging in with ${provider}`;
    socialBtn.disabled = true;
    
    // Simulate social login process
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