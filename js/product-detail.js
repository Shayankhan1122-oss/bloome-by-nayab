// Product Detail Page JavaScript - WITH BETTER ERROR HANDLING

document.addEventListener('DOMContentLoaded', async function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId || isNaN(productId)) {
        showProductNotFound('Invalid product ID');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Wait for products to load
        await loadProduct(productId);
        
        // Setup quantity controls
        setupQuantityControls();
        
        // Setup image gallery
        setupImageGallery();
    } catch (error) {
        console.error('Error initializing product page:', error);
        showProductNotFound(error.message);
    }
});

function showLoading() {
    const productInfo = document.querySelector('.product-info');
    if (productInfo) {
        productInfo.innerHTML = `
            <div style="padding: 60px; text-align: center;">
                <div style="display: inline-block; width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #d4a574; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 20px; color: #666;">Loading product...</p>
            </div>
        `;
    }
}

function showProductNotFound(message) {
    const productInfo = document.querySelector('.product-info');
    if (productInfo) {
        productInfo.innerHTML = `
            <div style="padding: 60px 40px; text-align: center;">
                <div style="font-size: 80px; margin-bottom: 20px;">🔍</div>
                <h2 style="font-family: 'Bodoni Moda', serif; font-size: 32px; color: #1a1a2e; margin-bottom: 15px;">Product Not Found</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                    ${message || 'The product you\'re looking for doesn\'t exist or has been removed.'}
                </p>
                <a href="index.html" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; text-decoration: none; border-radius: 50px; font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s;">
                    ← Back to Home
                </a>
            </div>
        `;
    }
    
    // Hide main image section
    const productImages = document.querySelector('.product-images');
    if (productImages) {
        productImages.style.display = 'none';
    }
}

async function loadProduct(productId) {
    try {
        const response = await fetch('/api/admin/products');
        
        if (!response.ok) {
            throw new Error('Failed to load products from server');
        }
        
        const data = await response.json();
        
        let products = [];
        if (data.success && data.products) {
            products = data.products;
        } else if (Array.isArray(data)) {
            products = data;
        }
        
        console.log('📦 Available products:', products.length);
        console.log('🔍 Looking for product ID:', productId);
        
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            const availableIds = products.map(p => p.id).join(', ');
            throw new Error(`Product ID ${productId} not found. Available IDs: ${availableIds || 'none'}`);
        }
        
        console.log('✅ Product found:', product.name);
        
        // Update page with product data
        updateProductPage(product);
        
    } catch (error) {
        console.error('❌ Error loading product:', error);
        throw error;
    }
}

function updateProductPage(product) {
    // Title
    const titleEl = document.getElementById('product-title');
    if (titleEl) {
        titleEl.textContent = product.name;
    } else {
        console.warn('⚠️ product-title element not found');
    }
    
    // Breadcrumb name
    const productNameEl = document.getElementById('product-name');
    if (productNameEl) {
        productNameEl.textContent = product.name;
    }
    
    // Price
    const priceEl = document.querySelector('.current-price');
    if (priceEl) {
        priceEl.textContent = `Rs ${product.price.toFixed(2)}`;
    } else {
        console.warn('⚠️ current-price element not found');
    }
    
    // Description
    const descEl = document.querySelector('.short-description');
    if (descEl) {
        descEl.textContent = product.description || 'Premium quality product';
    }
    
    // SKU
    const skuEl = document.querySelector('.sku');
    if (skuEl) {
        skuEl.textContent = `SKU: ${product.sku || 'N/A'}`;
    }
    
    // Page title
    document.title = `${product.name} - BLOOME BY NAYAB`;
    
    // Update images
    updateProductImages(product);
    
    // Update stock status
    updateStockStatus(product);
    
    // Update cart buttons
    updateCartButtons(product);
    
    // Setup size options
    setupSizeOptions(product);
}

function updateProductImages(product) {
    // Main image
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.name;
        mainImage.onerror = function() {
            this.src = 'https://via.placeholder.com/600x600/d4a574/ffffff?text=' + encodeURIComponent(product.name);
        };
    }

    // Thumbnail gallery
    const thumbContainer = document.querySelector('.thumbnail-gallery');
    if (thumbContainer) {
        thumbContainer.innerHTML = '';
        const sources = Array.isArray(product.gallery) && product.gallery.length > 0 
            ? product.gallery 
            : [product.image];
            
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

function updateCartButtons(product) {
    // Add to Cart button
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-id', product.id);
        addToCartBtn.setAttribute('data-name', product.name);
        addToCartBtn.setAttribute('data-price', product.price);
        addToCartBtn.setAttribute('data-image', product.image);
        
        // Remove old listeners and add new one
        const newBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
        
        newBtn.addEventListener('click', function() {
            addToCart(product);
        });
    }

    // Order Now button
    const orderNowBtn = document.querySelector('.btn-order-now');
    if (orderNowBtn) {
        orderNowBtn.setAttribute('data-id', product.id);
        
        // Remove old listeners and add new one
        const newOrderBtn = orderNowBtn.cloneNode(true);
        orderNowBtn.parentNode.replaceChild(newOrderBtn, orderNowBtn);
        
        newOrderBtn.addEventListener('click', function() {
            addToCart(product);
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 500);
        });
    }
}

function setupSizeOptions(product) {
    const sizeSelector = document.querySelector('.size-selector');
    const sizeOptionWrap = document.querySelector('.size-option-wrap');
    
    if (!sizeSelector || !sizeOptionWrap) return;
    
    // Clear existing
    sizeSelector.innerHTML = '';

    if (product.category === 'fragrances' || product.category === 'cosmetics') {
        // Show ml options
        const sizes = [30, 50, 100];
        sizes.forEach((s, idx) => {
            const btn = document.createElement('button');
            btn.className = 'size-option' + (idx === 0 ? ' active' : '');
            btn.setAttribute('data-value', s);
            btn.textContent = s + ' ml';
            btn.style.cssText = 'padding: 10px 20px; margin: 5px; border: 2px solid #d4a574; background: white; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-family: Inter, sans-serif; font-weight: 500;';
            
            if (idx === 0) {
                btn.style.background = '#d4a574';
                btn.style.color = 'white';
            }
            
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
        // Hide for other categories
        sizeOptionWrap.style.display = 'none';
    }
}

function addToCart(product) {
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
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Show notification
    showNotification(`✅ ${product.name} added to cart!`);
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
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
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