// Order Confirmation Page JavaScript

// Sample order data
const orderData = {
    orderNumber: "#QWS-2025-001234",
    expectedDelivery: "Jan 10, 2025",
    email: "customer@example.com",
    items: [
        {
            id: 1,
            name: "Premium Perfume",
            price: 49.99,
            quantity: 1,
            image: "images/products/perfume1.jpg"
        },
        {
            id: 2,
            name: "Cotton Kurta",
            price: 29.99,
            quantity: 2,
            image: "images/products/kurta1.jpg"
        }
    ],
    shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
        phone: "+1 (555) 123-4567",
        email: "customer@example.com"
    },
    paymentMethod: "Credit/Debit Card",
    subtotal: 109.97,
    shipping: 0, // Free shipping since order > $50
    tax: 8.80, // 8% tax
    total: 118.77
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load order data
    loadOrderData();
    
    // Initialize cart count
    updateCartCount();
});

// Load order data
function loadOrderData() {
    // Update order number
    document.querySelector('.order-number h2').textContent = orderData.orderNumber;
    
    // Update expected delivery
    document.querySelector('.expected-delivery strong').textContent = orderData.expectedDelivery;
    
    // Update email confirmation
    document.querySelector('.email-confirmation strong').textContent = orderData.email;
    
    // Load order items
    loadOrderItems();
    
    // Load shipping address
    loadShippingAddress();
    
    // Load payment method
    loadPaymentMethod();
    
    // Load order summary
    loadOrderSummary();
}

// Load order items
function loadOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = orderData.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">$${item.price.toFixed(2)}</div>
                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            </div>
        </div>
    `).join('');
}

// Load shipping address
function loadShippingAddress() {
    const shippingAddressContainer = document.getElementById('shipping-address');
    if (!shippingAddressContainer) return;
    
    const addr = orderData.shippingAddress;
    shippingAddressContainer.innerHTML = `
        <p>${addr.firstName} ${addr.lastName}</p>
        <p>${addr.address}</p>
        <p>${addr.city}, ${addr.state} ${addr.zip}</p>
        <p>${addr.country}</p>
        <p>Phone: ${addr.phone}</p>
        <p>Email: ${addr.email}</p>
    `;
}

// Load payment method
function loadPaymentMethod() {
    const paymentMethodContainer = document.getElementById('payment-method');
    if (!paymentMethodContainer) return;
    
    paymentMethodContainer.innerHTML = `<p>${orderData.paymentMethod}</p>`;
}

// Load order summary
function loadOrderSummary() {
    const orderSummaryContainer = document.getElementById('order-summary');
    if (!orderSummaryContainer) return;
    
    orderSummaryContainer.innerHTML = `
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${orderData.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>$${orderData.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax</span>
            <span>$${orderData.tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${orderData.total.toFixed(2)}</span>
        </div>
    `;
}

// Update cart count (inherited from main.js)
function updateCartCount() {
    // This function would be implemented in main.js
}