// Category Page JavaScript - Bulletproof Version
(function() {
    'use strict';
    
    let allProducts = [];
    let filteredProducts = [];
    let currentCategory = '';
    let currentPage = 1;
    const itemsPerPage = 12;

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Get category from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get('cat') || '';
        const searchQuery = urlParams.get('search') || '';
        
        console.log('Category page initialized');
        console.log('Current category:', currentCategory);
        console.log('Search query:', searchQuery);
        
        // Initialize cart count
        updateCartCount();
        
        // Load products
        await loadCategoryProducts(currentCategory, searchQuery);
        
        // Setup event listeners
        setupEventListeners();
    }

    async function loadCategoryProducts(category, search = '') {
        try {
            console.log('Fetching products from API...');
            const response = await fetch('/api/admin/products');
            const data = await response.json();
            
            if (data.success && data.products) {
                allProducts = data.products;
            } else if (Array.isArray(data)) {
                allProducts = data;
            } else {
                console.error('Unexpected API response:', data);
                allProducts = [];
            }
            
            console.log('✅ Total products loaded:', allProducts.length);
            
            // Debug: Show all products with their categories
            allProducts.forEach(p => {
                console.log(`Product: "${p.name}" | Category: "${p.category}" | ID: ${p.id}`);
            });
            
            // Filter by category
            if (category) {
                console.log(`Filtering by category: "${category}"`);
                filteredProducts = allProducts.filter(p => {
                    const matches = p.category === category;
                    if (matches) {
                        console.log(`✅ "${p.name}" matches category "${category}"`);
                    }
                    return matches;
                });
                console.log(`✅ Filtered products count: ${filteredProducts.length}`);
            } else if (search) {
                console.log(`Searching for: "${search}"`);
                filteredProducts = allProducts.filter(p => 
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
                );
            } else {
                filteredProducts = allProducts;
            }
            
            // Update page title
            updateCategoryInfo(category, search);
            
            // Display products
            displayProducts();
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            showEmptyState('Error loading products. Please try again later.');
        }
    }

    function updateCategoryInfo(category, search) {
        const categoryMap = {
            'fragrances': { name: 'Premium Attar & Perfumes', desc: 'Discover our exclusive fragrance collection' },
            'clothes': { name: 'Male & Female Fashion', desc: 'Stylish clothing for everyone' },
            'agricultural': { name: 'Fresh Agricultural Products', desc: 'Quality farm-fresh products' },
            'home-textiles': { name: 'Quality Home Essentials', desc: 'Premium textiles for your home' }
        };
        
        let info;
        if (search) {
            info = { 
                name: 'Search Results', 
                desc: `Results for "${search}"` 
            };
        } else {
            info = categoryMap[category] || { 
                name: 'All Products', 
                desc: 'Discover our premium collection' 
            };
        }
        
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
        
        if (!container) {
            console.error('Product container not found');
            return;
        }
        
        // Update results count
        if (resultsCount) {
            resultsCount.textContent = filteredProducts.length;
        }
        
        // Check if empty
        if (filteredProducts.length === 0) {
            console.log('No products to display');
            showEmptyState();
            return;
        }
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(start, end);
        
        console.log(`Displaying ${paginatedProducts.length} products (page ${currentPage})`);
        
        // Generate product cards
        container.innerHTML = paginatedProducts.map(product => {
            const rating = product.rating || 4.0;
            const stars = generateStars(rating);
            
            return `
                <div class="product-card">
                    ${product.stock <= 5 && product.stock > 0 ? '<div class="product-badge">Low Stock</div>' : ''}
                    ${product.stock === 0 ? '<div class="product-badge" style="background: #dc3545;">Out of Stock</div>' : ''}
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
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
        
        // Setup pagination
        setupPagination();
        
        // No direct add-to-cart or order buttons on category cards anymore.
        // Users should view product details and add to cart from the product page.
    }

    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    function getCategoryName(category) {
        const names = {
            'fragrances': 'Premium Attar & Perfumes',
            'clothes': 'Male & Female Fashion',
            'agricultural': 'Fresh Agricultural Products',
            'home-textiles': 'Quality Home Essentials'
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
        // Sort dropdown
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                sortProducts(this.value);
            });
        }
        
        // View toggle
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
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-bar button');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    function performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        if (query) {
            window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        }
    }

    function sortProducts(sortBy) {
        let sorted = [...filteredProducts];
        
        switch(sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                sorted.sort((a, b) => b.id - a.id);
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                // Featured - keep original order
                break;
        }
        
        filteredProducts = sorted;
        currentPage = 1;
        displayProducts();
    }

    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log(`Updated quantity for "${product.name}": ${existingItem.quantity}`);
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            console.log(`Added "${product.name}" to cart`);
        }
        
        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count in navbar
        updateCartCount();
        
        // Show success message
        showSuccessMessage(`${product.name} added to cart!`);
    }

    function orderNow(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        // Add to cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
    }

    function showSuccessMessage(message) {
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
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
        
        // Hide pagination
        const pagination = document.querySelector('.pagination');
        if (pagination) pagination.style.display = 'none';
    }

    // Add CSS animation for toast
    const style = document.createElement('style');
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
})();