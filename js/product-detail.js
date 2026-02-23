// Product Detail Page JavaScript - FIXED VERSION

document.addEventListener('DOMContentLoaded', async function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Wait for products to load
    await loadProduct(productId);
    
    // Setup quantity controls
    setupQuantityControls();
    
    // Setup image gallery
    setupImageGallery();
});

async function loadProduct(productId) {
    try {
        const response = await fetch('/api/admin/products');
        const data = await response.json();
        
        let products = [];
        if (data.success && data.products) {
            products = data.products;
        } else if (Array.isArray(data)) {
            products = data;
        }
        
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            alert('Product not found!');
            window.location.href = 'index.html';
            return;
        }
        
        // Update page with product data
        document.getElementById('product-title').textContent = product.name;
        const productNameEl = document.getElementById('product-name');
        if (productNameEl) {
            productNameEl.textContent = product.name;
        }
        document.querySelector('.current-price').textContent = `Rs ${product.price.toFixed(2)}`;
        document.querySelector('.short-description').textContent = product.description || 'Premium quality product';
        
        // Update SKU
        const skuEl = document.querySelector('.sku');
        if (skuEl) {
            skuEl.textContent = `SKU: ${product.sku || 'N/A'}`;
        }
        
        // Update page title
        document.title = `${product.name} - BLOOME BY NAYAB`;
        
        // Update main image
        const mainImage = document.getElementById('main-product-image');
        if (mainImage) {
            mainImage.src = product.image;
            mainImage.alt = product.name;
            mainImage.onerror = function() {
                this.src = 'https://via.placeholder.com/600x600/d4a574/ffffff?text=' + encodeURIComponent(product.name);
            };
        }

        // Render thumbnail gallery from product.gallery if available
        const thumbContainer = document.querySelector('.thumbnail-gallery');
        if (thumbContainer) {
            thumbContainer.innerHTML = '';
            const sources = Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.image];
            sources.forEach((src, idx) => {
                const div = document.createElement('div');
                div.className = 'thumbnail' + (idx === 0 ? ' active' : '');
                div.setAttribute('data-src', src);

                const img = document.createElement('img');
                img.src = src;
                img.alt = `${product.name} ${idx + 1}`;
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/120x120/d4a574/ffffff?text=Image';
                };

                div.appendChild(img);
                thumbContainer.appendChild(div);
            });
        }
        
        // Update stock status
        updateStockStatus(product);
        
        // Update add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.setAttribute('data-id', product.id);
            addToCartBtn.setAttribute('data-name', product.name);
            addToCartBtn.setAttribute('data-price', product.price);
            addToCartBtn.setAttribute('data-image', product.image);
        }

        // Update Order Now button
        const orderNowBtn = document.querySelector('.btn-order-now');
        if (orderNowBtn) {
            orderNowBtn.setAttribute('data-id', product.id);
            orderNowBtn.setAttribute('data-name', product.name);
            orderNowBtn.setAttribute('data-price', product.price);
            orderNowBtn.setAttribute('data-image', product.image);
            
            orderNowBtn.addEventListener('click', function() {
                // Add product to cart
                const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(i => i.id === product.id);
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: quantity
                    });
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                // Redirect to checkout
                window.location.href = 'checkout.html';
            });
        }

        // Setup size/measure options based on category
        const sizeSelector = document.querySelector('.size-selector');
        const sizeOptionWrap = document.querySelector('.size-option-wrap');
        if (sizeSelector && sizeOptionWrap) {
            // Clear existing
            sizeSelector.innerHTML = '';

            if (product.category === 'fragrances' || product.category === 'cosmetics') {
                // show ml options
                const sizes = [30, 50, 100];
                sizes.forEach((s, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'size-option' + (idx === 0 ? ' active' : '');
                    btn.setAttribute('data-value', s);
                    btn.textContent = s + ' ml';
                    btn.style.cssText = 'padding: 10px 20px; margin: 5px; border: 2px solid #d4a574; background: white; border-radius: 25px; cursor: pointer; transition: all 0.3s;';
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.size-option').forEach(b => {
                            b.classList.remove('active');
                            b.style.background = 'white';
                            b.style.color = '#1a1a2e';
                        });
                        this.classList.add('active');
                        this.style.background = '#d4a574';
                        this.style.color = 'white';
                    });
                    sizeSelector.appendChild(btn);
                });
                sizeOptionWrap.style.display = 'block';
            } else {
                // Hide size options for jewellery, skincare, clothes
                sizeOptionWrap.style.display = 'none';
            }
        }

        // Add to Cart with size
        if (addToCartBtn) {
            // Remove existing listeners
            const newBtn = addToCartBtn.cloneNode(true);
            addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
            
            newBtn.addEventListener('click', function() {
                const selectedSizeBtn = document.querySelector('.size-option.active');
                const selectedSize = selectedSizeBtn ? selectedSizeBtn.getAttribute('data-value') : null;
                const quantity = parseInt(document.getElementById('quantity')?.value) || 1;

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(i => i.id === product.id && i.size === selectedSize);
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    const item = {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: quantity
                    };
                    if (selectedSize) item.size = selectedSize;
                    cart.push(item);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count if function available
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }
                
                // Show notification
                showNotification(`✅ ${product.name} added to cart!`);
            });
        }
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product. Please try again.');
    }
}

function updateStockStatus(product) {
    const stockStatusEl = document.querySelector('.in-stock');
    const itemsLeftEl = document.querySelector('.items-left');
    
    if (!stockStatusEl) return;
    
    const stock = product.stock || 0;
    
    if (stock > 0) {
        stockStatusEl.textContent = 'In Stock';
        stockStatusEl.style.color = '#28a745';
        
        if (itemsLeftEl) {
            if (stock < 10) {
                itemsLeftEl.textContent = `Only ${stock} left in stock`;
                itemsLeftEl.style.display = 'inline';
            } else {
                itemsLeftEl.style.display = 'none';
            }
        }
    } else {
        stockStatusEl.textContent = 'Out of Stock';
        stockStatusEl.style.color = '#e74c3c';
        
        if (itemsLeftEl) {
            itemsLeftEl.textContent = '';
        }
        
        // Disable buttons
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.style.opacity = '0.5';
            addToCartBtn.style.cursor = 'not-allowed';
        }
    }
}

function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    if (!quantityInput) return;
    
    if (minusBtn) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value) || 1;
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }
}

function setupImageGallery() {
    // Setup will happen after images are loaded
    setTimeout(() => {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');
        
        if (!mainImage) return;
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const newSrc = this.getAttribute('data-src');
                
                if (newSrc) {
                    mainImage.src = newSrc;
                }
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }, 500);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 8px 25px rgba(40,167,69,0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 600;
        animation: slideIn 0.5s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}