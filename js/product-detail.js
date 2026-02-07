// Product Detail Page JavaScript

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
    
    // Setup tabs
    setupTabs();
    
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
        document.getElementById('product-name').textContent = product.name;
        document.querySelector('.current-price').textContent = `Rs ${product.price.toFixed(2)}`;
        document.querySelector('.short-description').textContent = product.description || 'Premium quality product';
        
        // Update Description tab with product description from admin
        const descriptionPane = document.getElementById('description');
        if (descriptionPane && product.description) {
            // Replace the static content with dynamic description from admin
            descriptionPane.innerHTML = `
                <h3>Product Description</h3>
                <p style="white-space: pre-line;">${product.description}</p>
            `;
        }
        
        // Update main image
        const mainImage = document.getElementById('main-product-image');
        if (mainImage) {
            mainImage.src = product.image;
            mainImage.alt = product.name;
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
                img.alt = `Thumbnail ${idx + 1}`;
                img.onerror = function() { this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E' };

                div.appendChild(img);
                thumbContainer.appendChild(div);
            });
        }
        
        // Update add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.setAttribute('data-id', product.id);
        }

        // Update Order Now button (add to cart and go to checkout)
        const orderNowBtn = document.querySelector('.btn-order-now');
        if (orderNowBtn) {
            orderNowBtn.setAttribute('data-id', product.id);
            orderNowBtn.addEventListener('click', function() {
                // Add product to cart
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(i => i.id === product.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
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

            if (product.category === 'fragrances') {
                // show ml options
                const sizes = [30, 50, 100];
                sizes.forEach((s, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'size-option' + (idx === 0 ? ' active' : '');
                    btn.setAttribute('data-value', s);
                    btn.textContent = s + ' ml';
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                    });
                    sizeSelector.appendChild(btn);
                });
                sizeOptionWrap.style.display = '';
            } else if (product.category === 'agricultural') {
                // show gram options
                const sizes = [250, 500, 1000];
                sizes.forEach((s, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'size-option' + (idx === 0 ? ' active' : '');
                    btn.setAttribute('data-value', s);
                    btn.textContent = s + ' gm';
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                    });
                    sizeSelector.appendChild(btn);
                });
                sizeOptionWrap.style.display = '';
            } else {
                // clothes or home-textiles: hide entire size option wrapper
                sizeOptionWrap.style.display = 'none';
            }
        }

        // Override Add to Cart on product page to include selected size if any
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const selectedSizeBtn = document.querySelector('.size-option.active');
                const selectedSize = selectedSizeBtn ? selectedSizeBtn.getAttribute('data-value') : null;

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(i => i.id === product.id && i.size === selectedSize);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    const item = {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    };
                    if (selectedSize) item.size = selectedSize;
                    cart.push(item);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                // Update cart count if function available
                if (window.updateCartCount) window.updateCartCount();
                // Show confirmation
                if (window.showNotification) {
                    window.showNotification(`${product.name} added to cart!`, 'success');
                }
            });
        }
        
        // Load related products
        loadRelatedProducts(products, product.category, product.id);
        
        // Load reviews for this product
        loadReviews(product.id);
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product. Please try again.');
    }
}

function loadReviews(productId) {
    // Get reviews from localStorage
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    const productReviews = allReviews[productId] || [];
    
    // Update review count in tab
    const reviewTab = document.querySelector('.tab[data-tab="reviews"]');
    if (reviewTab) {
        reviewTab.textContent = `Reviews (${productReviews.length})`;
    }
    
    // Calculate rating statistics
    if (productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / productReviews.length).toFixed(1);
        
        // Count ratings by stars
        const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
        productReviews.forEach(r => {
            ratingCounts[r.rating]++;
        });
        
        // Update overall rating
        document.getElementById('overall-rating').textContent = avgRating;
        document.getElementById('review-count-text').textContent = `Based on ${productReviews.length} review${productReviews.length > 1 ? 's' : ''}`;
        
        // Update stars display
        updateStarsDisplay(document.getElementById('stars-large'), avgRating);
        
        // Update rating breakdown bars
        const ratingBars = document.querySelectorAll('#rating-breakdown .rating-bar');
        [5, 4, 3, 2, 1].forEach((star, idx) => {
            const count = ratingCounts[star];
            const percentage = (count / productReviews.length * 100).toFixed(0);
            const bar = ratingBars[idx];
            bar.querySelector('.fill').style.width = percentage + '%';
            bar.querySelector('span:last-child').textContent = count;
        });
    }
    
    // Display reviews
    const reviewsList = document.getElementById('reviews-list');
    if (productReviews.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
    } else {
        reviewsList.innerHTML = productReviews.map(review => `
            <div class="review">
                <div class="review-header">
                    <div class="reviewer">${escapeHtml(review.name)}</div>
                    <div class="review-date">${formatDate(review.date)}</div>
                    <div class="review-rating">
                        ${generateStars(review.rating)}
                    </div>
                </div>
                <h4>${escapeHtml(review.title)}</h4>
                <p>${escapeHtml(review.text)}</p>
            </div>
        `).join('');
    }
}

function updateStarsDisplay(container, rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= fullStars) {
            star.className = 'fas fa-star';
        } else if (i === fullStars + 1 && hasHalfStar) {
            star.className = 'fas fa-star-half-alt';
        } else {
            star.className = 'far fa-star';
        }
        star.style.color = '#ffc107';
        container.appendChild(star);
    }
}

function generateStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadRelatedProducts(allProducts, category, currentId) {
    const relatedContainer = document.getElementById('related-products');
    if (!relatedContainer) return;
    
    const related = allProducts
        .filter(p => p.category === category && p.id !== currentId)
        .slice(0, 4);
    
    if (related.length === 0) {
        relatedContainer.innerHTML = '<p>No related products found</p>';
        return;
    }
    
    relatedContainer.innerHTML = related.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
            <h3>${product.name}</h3>
            <p class="price">Rs ${product.price.toFixed(2)}</p>
            <a href="product.html?id=${product.id}" class="btn">View Details</a>
        </div>
    `).join('');
}

function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    if (minusBtn) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Setup rating input stars
    const ratingStars = document.querySelectorAll('.rating-input i');
    const selectedRatingInput = document.getElementById('selected-rating');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRatingInput.value = rating;
            
            // Update star display
            ratingStars.forEach(s => {
                const starValue = parseInt(s.getAttribute('data-rating'));
                if (starValue <= rating) {
                    s.className = 'fas fa-star';
                    s.style.color = '#ffc107';
                } else {
                    s.className = 'far fa-star';
                    s.style.color = '#ddd';
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingStars.forEach(s => {
                const starValue = parseInt(s.getAttribute('data-rating'));
                if (starValue <= rating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Reset on mouse leave
    document.querySelector('.rating-input').addEventListener('mouseleave', function() {
        const currentRating = parseInt(selectedRatingInput.value);
        ratingStars.forEach(s => {
            const starValue = parseInt(s.getAttribute('data-rating'));
            if (starValue <= currentRating) {
                s.className = 'fas fa-star';
                s.style.color = '#ffc107';
            } else {
                s.className = 'far fa-star';
                s.style.color = '#ddd';
            }
        });
    });
    
    // Setup review form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            
            const name = document.getElementById('reviewer-name').value.trim();
            const rating = parseInt(selectedRatingInput.value);
            const title = document.getElementById('review-title').value.trim();
            const text = document.getElementById('review-text').value.trim();
            
            // Validation
            if (!name) {
                alert('Please enter your name');
                return;
            }
            
            if (rating === 0) {
                alert('Please select a rating');
                return;
            }
            
            if (!title) {
                alert('Please enter a review title');
                return;
            }
            
            if (!text) {
                alert('Please write your review');
                return;
            }
            
            // Create review object
            const review = {
                name: name,
                rating: rating,
                title: title,
                text: text,
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
            if (!allReviews[productId]) {
                allReviews[productId] = [];
            }
            allReviews[productId].push(review);
            localStorage.setItem('productReviews', JSON.stringify(allReviews));
            
            // Show success message
            alert('Thank you for your review! It has been submitted successfully.');
            
            // Reset form
            reviewForm.reset();
            selectedRatingInput.value = 0;
            ratingStars.forEach(s => {
                s.className = 'far fa-star';
                s.style.color = '#ddd';
            });
            
            // Reload reviews
            loadReviews(productId);
        });
    }
}

function setupImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const newSrc = this.getAttribute('data-src');
            
            if (mainImage && newSrc) {
                mainImage.src = newSrc;
            }
            
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}