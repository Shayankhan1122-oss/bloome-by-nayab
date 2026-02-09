// Category Page JavaScript - BLOOME BY NAYAB Edition
(function() {
    'use strict';
    
    let allProducts = [];
    let filteredProducts = [];
    let currentCategory = '';
    let currentPage = 1;
    const itemsPerPage = 12;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get('cat') || '';
        const searchQuery = urlParams.get('search') || '';
        
        updateCartCount();
        await loadCategoryProducts(currentCategory, searchQuery);
        setupEventListeners();
    }

    async function loadCategoryProducts(category, search = '') {
        try {
            const response = await fetch('/api/admin/products');
            const data = await response.json();
            
            if (data.success && data.products) {
                allProducts = data.products;
            } else if (Array.isArray(data)) {
                allProducts = data;
            } else {
                allProducts = [];
            }
            
            if (category) {
                filteredProducts = allProducts.filter(p => p.category === category);
            } else if (search) {
                filteredProducts = allProducts.filter(p => 
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
                );
            } else {
                filteredProducts = allProducts;
            }
            
            updateCategoryInfo(category, search);
            displayProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            showEmptyState('Error loading products. Please try again later.');
        }
    }

    function updateCategoryInfo(category, search) {
        const categoryMap = {
            'jewellery': { name: 'Exquisite Jewellery Collection', desc: 'Timeless pieces that sparkle your elegance' },
            'cosmetics': { name: 'Premium Beauty & Cosmetics', desc: 'Enhance your natural radiance' },
            'skincare': { name: 'Luxury Skincare Essentials', desc: 'Nourish your skin with botanical care' },
            'clothes': { name: 'Elegant Fashion & Apparel', desc: 'Sophisticated styles for every occasion' }
        };
        
        let info = search ? { name: 'Search Results', desc: `Results for "${search}"` } : 
                   (categoryMap[category] || { name: 'All Products', desc: 'Discover our premium collection' });
        
        const titleEl = document.getElementById('category-title');
        const nameEl = document.getElementById('category-name');
        const descEl = document.getElementById('category-description');
        
        if (titleEl) titleEl.textContent = info.name;
        if (nameEl) nameEl.textContent = info.name;
        if (descEl) descEl.textContent = info.desc;
    }

    function displayProducts() {
        const container = document.getElementById('category-products');
        const resultsCount = document.getElementById('results-count');
        
        if (!container) return;
        if (resultsCount) resultsCount.textContent = filteredProducts.length;
        if (filteredProducts.length === 0) { showEmptyState(); return; }
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(start, end);
        
        container.innerHTML = paginatedProducts.map(product => {
            const rating = product.rating || 4.0;
            const stars = generateStars(rating);
            
            return `
                <div class="product-card">
                    ${product.stock <= 5 && product.stock > 0 ? '<div class="product-badge">Low Stock</div>' : ''}
                    ${product.stock === 0 ? '<div class="product-badge" style="background: #dc3545;">Out of Stock</div>' : ''}
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/%3E%3C/svg%3E'">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${getCategoryName(product.category)}</div>
                        <h3>${product.name}</h3>
                        <div class="product-rating">
                            <div class="stars">${stars}</div>
                            <span class="rating-count">(${rating.toFixed(1)})</span>
                        </div>
                        <p class="product-price">Rs ${product.price.toLocaleString('en-PK', {minimumFractionDigits: 2})}</p>
                        <div class="product-actions">
                            <a href="product.html?id=${product.id}" class="btn btn-secondary btn-view-details">
                                <i class="fas fa-eye"></i> View Details
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        setupPagination();
    }

    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    function getCategoryName(category) {
        const names = {
            'jewellery': 'Exquisite Jewellery',
            'cosmetics': 'Beauty & Cosmetics',
            'skincare': 'Luxury Skincare',
            'clothes': 'Elegant Fashion'
        };
        return names[category] || 'Products';
    }

    function setupPagination() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        const pageNumbersContainer = document.querySelector('.page-numbers');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }
        
        paginationContainer.style.display = 'flex';
        
        // Generate page numbers
        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => goToPage(i));
            pageNumbersContainer.appendChild(pageBtn);
        }
        
        // Previous button
        const prevBtn = document.querySelector('.prev-page');
        if (prevBtn) {
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => goToPage(currentPage - 1);
        }
        
        // Next button
        const nextBtn = document.querySelector('.next-page');
        if (nextBtn) {
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => goToPage(currentPage + 1);
        }
    }

    function goToPage(page) {
        currentPage = page;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setupEventListeners() {
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) sortSelect.addEventListener('change', function() { sortProducts(this.value); });
        
        const gridViewBtn = document.querySelector('.view-grid');
        const listViewBtn = document.querySelector('.view-list');
        const productsGrid = document.getElementById('category-products');
        
        if (gridViewBtn && listViewBtn && productsGrid) {
            gridViewBtn.addEventListener('click', function() {
                productsGrid.classList.remove('list-view');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            });
            listViewBtn.addEventListener('click', function() {
                productsGrid.classList.add('list-view');
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
            });
        }
    }

    function sortProducts(sortBy) {
        let sorted = [...filteredProducts];
        switch(sortBy) {
            case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
            case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
            case 'newest': sorted.sort((a, b) => b.id - a.id); break;
            case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        }
        filteredProducts = sorted;
        currentPage = 1;
        displayProducts();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
    }

    function showEmptyState(message = 'No products found in this category') {
        const container = document.getElementById('category-products');
        if (!container) return;
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>${message}</h3>
                <p>Try browsing other categories or check back later</p>
                <a href="index.html" class="btn btn-primary">Back to Home</a>
            </div>
        `;
        const pagination = document.querySelector('.pagination');
        if (pagination) pagination.style.display = 'none';
    }
})();