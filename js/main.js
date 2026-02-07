// Main JavaScript file for       IBREES-LIL-HUZAIFA

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load products from API
    loadProductsFromAPI();
    
    // Initialize cart count
    updateCartCount();
    
    // Add event listeners
    setupEventListeners();
});

// Load products from API
async function loadProductsFromAPI() {
    try {
        const response = await fetch('/api/admin/products');
        const data = await response.json();
        
        if (data.success && data.products) {
            allProducts = data.products;
        } else if (Array.isArray(data)) {
            allProducts = data;
        }
        
        // Load featured products if on homepage
        loadFeaturedProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load featured products
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products-grid');
    if (!featuredProductsContainer) return;
    
    // Get 4 featured products
    const featuredProducts = allProducts.slice(0, 4);
    
    if (featuredProducts.length === 0) {
        featuredProductsContainer.innerHTML = '<p>No products available</p>';
        return;
    }
    
    const featuredHtml = featuredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            <h3>${product.name}</h3>
            <p class="price">Rs ${product.price.toFixed(2)}</p>
            <a href="product.html?id=${product.id}" class="btn-view">View Details</a>
        </div>
    `).join('');

    // Debug: log featured products and generated HTML
    console.log('loadFeaturedProducts - featuredProducts:', featuredProducts.map(p => ({ id: p.id, name: p.name }))); 
    console.log('loadFeaturedProducts - featuredHtml preview:', featuredHtml.slice(0, 300));

    featuredProductsContainer.innerHTML = featuredHtml;
}

// Get product by ID
function getProductById(id) {
    return allProducts.find(p => p.id === parseInt(id));
}

// Add to cart function
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found!', 'error');
        return;
    }
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

// Update cart count
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation style if not already added
    if (!document.querySelector('#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    // Newsletter form
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            showNotification(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    });
    
    // Add to cart buttons (delegate event)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-id'));
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            addToCart(productId, quantity);
        }
    });
}

// Perform search
function performSearch(query) {
    if (query.trim() === '') return;
    
    // Redirect to category page with search query
    window.location.href = `category.html?search=${encodeURIComponent(query)}`;
}

// Additional utility functions
function formatCurrency(amount) {
    return `Rs ${amount.toFixed(2)}`;
}

// Export functions for use in other scripts
window.getProductById = getProductById;
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.showNotification = showNotification;
window.allProducts = allProducts;