// Checkout Page JavaScript - Complete Version with Quantity Selectors
(function() {
    'use strict';

    // Get cart data from localStorage
    function getCartData() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Use real cart data
    let cart = getCartData();

    // Checkout state
    let checkoutState = {
        step: 1,
        shippingInfo: {},
        paymentMethod: 'cash-on-delivery',
        orderPlaced: false
    };

    // Calculate delivery charges based on order amount
    function calculateDeliveryCharges(subtotal) {
        if (subtotal < 500) {
            return 0; // Below minimum order
        } else if (subtotal >= 500 && subtotal < 2000) {
            return 250; // Rs 250 for Rs 500-1999
        } else if (subtotal >= 2000 && subtotal < 3000) {
            return 350;
        } else if (subtotal >= 3000 && subtotal < 5000) {
            return 500;
        } else {
            return 0; // FREE for orders 5000+
        }
    }

    // Calculate order totals
    function calculateTotals() {
        const subtotal = cart.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);
        
        const deliveryCharges = calculateDeliveryCharges(subtotal);
        const total = subtotal + deliveryCharges;
        
        return { subtotal, deliveryCharges, total };
    }

    // Update product quantity in cart
    window.updateProductQuantity = function(productId, change) {
        const productIndex = cart.findIndex(item => item.id === productId);
        
        if (productIndex !== -1) {
            cart[productIndex].quantity = (cart[productIndex].quantity || 1) + change;
            
            // Remove if quantity becomes 0
            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }
            
            // Save cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Reload page to update everything
            location.reload();
        }
    };

    // Display order summary in sidebar
    function displayOrderSummary() {
        const sidebarItems = document.getElementById('sidebar-order-items');
        const sidebarTotals = document.getElementById('sidebar-order-totals');
        
        if (!sidebarItems || !sidebarTotals) return;
        
        // Display items with quantity selectors
        if (cart.length === 0) {
            sidebarItems.innerHTML = '<p style="text-align: center; color: #999;">Your cart is empty</p>';
            sidebarTotals.innerHTML = '';
            return;
        }
        
        sidebarItems.innerHTML = cart.map(item => `
            <div class="summary-item" style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #eee;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23ddd%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E'">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 5px; font-size: 14px;">${item.name}</h4>
                    <p style="color: #3498db; font-weight: 600; margin-bottom: 8px;">Rs ${item.price.toFixed(2)}</p>
                    <div class="quantity-selector" style="display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 13px; color: #666;">Qty:</label>
                        <button onclick="updateProductQuantity(${item.id}, -1)" 
                                ${(item.quantity || 1) <= 1 ? 'disabled' : ''}
                                style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 16px;">−</button>
                        <input type="number" value="${item.quantity || 1}" readonly 
                               style="width: 50px; height: 28px; text-align: center; border: 1px solid #ddd; border-radius: 4px; font-weight: 600;">
                        <button onclick="updateProductQuantity(${item.id}, 1)" 
                                style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 16px;">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: 600; color: #2c3e50;">Rs ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
        
        // Display totals
        const { subtotal, deliveryCharges, total } = calculateTotals();
        
        let deliveryText = `Rs ${deliveryCharges.toFixed(2)}`;
        if (subtotal >= 5000) {
            deliveryText = '<span style="color: #28a745; font-weight: 600;">FREE 🎉</span>';
        }
        
        sidebarTotals.innerHTML = `
            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 15px;">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">Rs ${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; padding: 10px 15px;">
                <span>Delivery:</span>
                <span style="font-weight: 600;">${deliveryText}</span>
            </div>
            <div class="summary-row total" style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-top: 2px solid #ddd; font-size: 18px; font-weight: 700;">
                <span>Total:</span>
                <span style="color: #3498db;">Rs ${total.toFixed(2)}</span>
            </div>
        `;
    }

    // Switch checkout step
    function switchStep(step) {
        // Update step indicators
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
        
        // Update form sections
        document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');
        
        checkoutState.step = step;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Validate email format (lowercase)
    function validateEmail(email) {
        const emailLower = email.toLowerCase();
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        return emailRegex.test(emailLower);
    }

    // Validate phone number (Pakistani format)
    function validatePhone(phone) {
        // Remove spaces and check if it's 10 digits
        const cleanPhone = phone.replace(/\s/g, '');
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(cleanPhone);
    }

    // Step 1: Shipping Information
    document.getElementById('continue-to-payment')?.addEventListener('click', function() {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value.trim();
        
        // Validate all fields
        if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
            alert('❌ Please fill in all required fields');
            return;
        }
        
        // Validate email
        if (!validateEmail(email)) {
            alert('❌ Please enter a valid email address in lowercase format (e.g., john@example.com)');
            document.getElementById('email').focus();
            return;
        }
        
        // Validate phone
        if (!validatePhone(phone)) {
            alert('❌ Please enter a valid 10-digit phone number (e.g., 3001234567)');
            document.getElementById('phone').focus();
            return;
        }
        
        // Check minimum order
        const { subtotal } = calculateTotals();
        if (subtotal < 500) {
            alert(`❌ Minimum order amount is Rs 500. Your current cart total is Rs ${subtotal.toFixed(2)}. Please add more items to proceed.`);
            return;
        }
        
        // Save shipping info with +92 prefix for phone
        checkoutState.shippingInfo = {
            firstName,
            lastName,
            email,
            phone: '+92' + phone, // Add +92 prefix
            address,
            city,
            state,
            zip,
            country: 'Pakistan'
        };
        
        switchStep(2);
    });

    // Step 2: Payment Method
    document.getElementById('back-to-shipping')?.addEventListener('click', function() {
        switchStep(1);
    });

    document.getElementById('continue-to-review')?.addEventListener('click', function() {
        checkoutState.paymentMethod = 'cash-on-delivery';
        displayReviewOrder();
        switchStep(3);
    });

    // Display review order
    function displayReviewOrder() {
        // Display order items
        const reviewItems = document.getElementById('review-order-items');
        if (reviewItems) {
            reviewItems.innerHTML = cart.map(item => `
                <div style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23ddd%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E'">
                    <div style="flex: 1;">
                        <h4>${item.name}</h4>
                        <p style="color: #666; margin: 5px 0;">Quantity: ${item.quantity || 1}</p>
                        <p style="color: #3498db; font-weight: 600;">Rs ${item.price.toFixed(2)} × ${item.quantity || 1}</p>
                    </div>
                    <div style="text-align: right; font-weight: 600;">
                        Rs ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
        
        // Display shipping address
        const reviewAddress = document.getElementById('review-shipping-address');
        if (reviewAddress && checkoutState.shippingInfo) {
            const info = checkoutState.shippingInfo;
            reviewAddress.innerHTML = `
                <p><strong>${info.firstName} ${info.lastName}</strong></p>
                <p>${info.address}</p>
                <p>${info.city}, ${info.state} ${info.zip}</p>
                <p>${info.country}</p>
                <p>📱 ${info.phone}</p>
                <p>📧 ${info.email}</p>
            `;
        }
        
        // Display payment method
        const reviewPayment = document.getElementById('review-payment-method');
        if (reviewPayment) {
            reviewPayment.innerHTML = `
                <p><i class="fas fa-money-bill-wave"></i> <strong>Cash on Delivery</strong></p>
                <p style="color: #666; margin-top: 5px;">Pay when you receive your order</p>
            `;
        }
        
        // Display order summary
        const reviewSummary = document.getElementById('review-order-summary');
        if (reviewSummary) {
            const { subtotal, deliveryCharges, total } = calculateTotals();
            
            let deliveryText = `Rs ${deliveryCharges.toFixed(2)}`;
            if (subtotal >= 5000) {
                deliveryText = '<span style="color: #28a745; font-weight: 600;">FREE 🎉</span>';
            }
            
            reviewSummary.innerHTML = `
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span>Subtotal:</span>
                    <span style="font-weight: 600;">Rs ${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span>Delivery Charges:</span>
                    <span style="font-weight: 600;">${deliveryText}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 2px solid #ddd; font-size: 20px; font-weight: 700;">
                    <span>Total:</span>
                    <span style="color: #3498db;">Rs ${total.toFixed(2)}</span>
                </div>
            `;
        }
    }

    // Step 3: Review and Place Order
    document.getElementById('back-to-payment')?.addEventListener('click', function() {
        switchStep(2);
    });

    document.getElementById('place-order')?.addEventListener('click', function() {
        const termsChecked = document.getElementById('terms').checked;
        
        if (!termsChecked) {
            alert('❌ Please agree to the Terms & Conditions and Privacy Policy');
            return;
        }
        
        processOrder();
    });

    // Process order
    async function processOrder() {
        const btn = document.getElementById('place-order');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
            
            const { subtotal, deliveryCharges, total } = calculateTotals();
            
            const orderData = {
                orderId: 'ORD-' + Date.now(),
                trackingToken: Math.random().toString(36).substr(2, 9).toUpperCase(),
                customer: {
                    fullName: `${checkoutState.shippingInfo.firstName} ${checkoutState.shippingInfo.lastName}`,
                    email: checkoutState.shippingInfo.email,
                    phone: checkoutState.shippingInfo.phone
                },
                shippingAddress: {
                    address: checkoutState.shippingInfo.address,
                    city: checkoutState.shippingInfo.city,
                    state: checkoutState.shippingInfo.state,
                    zip: checkoutState.shippingInfo.zip,
                    country: checkoutState.shippingInfo.country
                },
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    image: item.image
                })),
                subtotal: subtotal,
                deliveryCharges: deliveryCharges,
                total: total,
                paymentMethod: 'Cash on Delivery',
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            // Submit order to API
            const response = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save order details to localStorage for confirmation page (use 'lastOrder' key to match confirmation page)
                localStorage.setItem('lastOrder', JSON.stringify({
                    orderId: orderData.orderId,
                    total: orderData.total,
                    paymentMethod: 'cash-on-delivery',
                    customer: orderData.customer,
                    shippingAddress: orderData.shippingAddress,
                    items: orderData.items,
                    subtotal: orderData.subtotal,
                    deliveryCharges: orderData.deliveryCharges,
                    createdAt: orderData.createdAt
                }));
                
                // Clear cart
                localStorage.removeItem('cart');
                
                // Redirect to order confirmation
                window.location.href = `order-confirmation.html?order=${orderData.orderId}&total=${total}&payment=cod`;
            } else {
                throw new Error(data.error || 'Failed to place order');
            }
            
        } catch (error) {
            console.error('Order processing error:', error);
            alert('❌ Failed to place order. Please try again.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // Initialize checkout page
    function init() {
        // Check if cart is empty
        if (cart.length === 0) {
            alert('Your cart is empty!');
            window.location.href = 'category.html';
            return;
        }
        
        // Display order summary
        displayOrderSummary();
        
        // Auto-convert email to lowercase as user types
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                this.value = this.value.toLowerCase();
            });
        }
        
        // Phone input - only allow numbers
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();