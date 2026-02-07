// Add this at the very top of your admin-dashboard.js file
// This runs immediately when the page loads

(function() {
    // Check authentication before anything else loads
    function checkAdminAuth() {
        const adminData = localStorage.getItem('admin');
        
        if (!adminData) {
            // No admin data, redirect to login
            window.location.href = 'login.html';
            return false;
        }
        
        try {
            const admin = JSON.parse(adminData);
            
            // Check if user has admin privileges
            if (!admin.isAdmin || admin.isAdmin !== true) {
                // Not an admin, clear storage and redirect
                localStorage.removeItem('admin');
                window.location.href = 'login.html';
                return false;
            }
            
            // Check if user data is valid
            if (!admin.userId || !admin.username) {
                localStorage.removeItem('admin');
                window.location.href = 'login.html';
                return false;
            }
            
            return true;
        } catch (e) {
            // Invalid data, clear and redirect
            localStorage.removeItem('admin');
            window.location.href = 'login.html';
            return false;
        }
    }
    
    // Run check immediately
    if (!checkAdminAuth()) {
        // Stop script execution if not authenticated
        throw new Error('Unauthorized access');
    }
})();

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'login.html';
    }
}

// Rest of your admin dashboard code goes below this...