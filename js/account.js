// Account Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Setup event listeners
    setupAccountEventListeners();
});

// Setup account event listeners
function setupAccountEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Dashboard navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
        });
    });
}

// Logout function
function logout() {
    // In a real implementation, this would make an API call to log out
    // For now, just show a confirmation and redirect to home
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored user data
        // localStorage.removeItem('user');
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Update cart count (inherited from main.js)
function updateCartCount() {
    // This function would be implemented in main.js
}