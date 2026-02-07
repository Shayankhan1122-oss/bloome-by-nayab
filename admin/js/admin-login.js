// Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('error-message');

    // Check if already logged in
    if (isAdminLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Clear previous error
        hideError();
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        try {
            // Make API call to verify credentials
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Check if user is admin
                if (data.user && data.user.isAdmin === true) {
                    // Store admin session
                    localStorage.setItem('admin', JSON.stringify({
                        username: data.user.email,
                        loginTime: new Date().toISOString(),
                        userId: data.user.id,
                        isAdmin: true
                    }));
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    showError('Access denied. Admin privileges required.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                showError(data.error || 'Invalid credentials. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
    
    function isAdminLoggedIn() {
        const adminData = localStorage.getItem('admin');
        if (!adminData) return false;
        
        try {
            const admin = JSON.parse(adminData);
            return admin.userId !== undefined && 
                   admin.username !== undefined && 
                   admin.isAdmin === true;
        } catch (e) {
            return false;
        }
    }
});