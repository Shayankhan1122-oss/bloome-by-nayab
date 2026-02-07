// Cart Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Initialize cart count
    updateCartCount();
    
    // Setup event listeners
    setupCartEventListeners();
});

// Load cart items
function loadCartItems() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartContainer = document.getElementById('empty-cart');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        // Show empty cart message
        emptyCartContainer.style.display = 'flex';
        cartItemsContainer.style.display = 'none';
        cartSummaryContainer.style.display = 'none';
        return;
    }
    
    // Hide empty cart message
    emptyCartContainer.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    cartSummaryContainer.style.display = 'block';
    
    // Render cart items
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Rs. ${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    // Update cart summary
    updateCartSummary(cart);
}

// Update cart summary
function updateCartSummary(cart) {
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Update summary elements
    document.getElementById('subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `Rs. ${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `Rs. ${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `Rs. ${total.toFixed(2)}`;
}

// Setup cart event listeners
function setupCartEventListeners() {
    // Quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const isPlus = e.target.classList.contains('plus');
            
            updateQuantity(productId, isPlus);
        }
    });
    
    // Quantity input change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity > 0) {
                updateQuantity(productId, null, newQuantity);
            }
        }
    });
    
    // Remove item
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
            const productId = parseInt(button.getAttribute('data-id'));
            
            removeFromCart(productId);
        }
    });
    
    // Apply discount code
    document.getElementById('apply-discount').addEventListener('click', function() {
        const code = document.getElementById('discount-code').value;
        if (code.trim() !== '') {
            applyDiscountCode(code);
        }
    });
    
    // Discount code input enter key
    document.getElementById('discount-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const code = this.value;
            if (code.trim() !== '') {
                applyDiscountCode(code);
            }
        }
    });
}

// Update quantity
function updateQuantity(productId, isPlus, newQuantity = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    if (newQuantity !== null) {
        cart[itemIndex].quantity = newQuantity;
    } else {
        if (isPlus) {
            cart[itemIndex].quantity += 1;
        } else {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // If quantity would be 0, remove item
                cart.splice(itemIndex, 1);
            }
        }
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    loadCartItems();
    updateCartCount();
}

// Remove from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(item => item.id !== productId);
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    loadCartItems();
    updateCartCount();
    
    // Show notification
    showNotification('Item removed from cart');
}

// Apply discount code
function applyDiscountCode(code) {
    // For demo purposes, just show a notification
    // In a real implementation, this would validate the code and apply discounts
    if (code.toUpperCase() === 'SAVE10') {
        showNotification('10% discount applied!');
        // In a real implementation, you would update the cart totals here
    } else {
        showNotification('Invalid discount code');
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
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
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update cart count (inherited from main.js)
function updateCartCount() {
    // This function would be implemented in main.js
}