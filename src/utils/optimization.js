// Performance Optimization for       BLOOME-BY-NAYAB
// This file contains optimization techniques for the e-commerce website

// 1. Image optimization functions
const imageOptimizer = {
    // Lazy loading for images
    lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    },
    
    // Preload critical images
    preloadCriticalImages: (imageUrls) => {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
};

// 2. DOM optimization functions
const domOptimizer = {
    // Debounce function for events
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 3. Caching functions
const cacheManager = {
    // Simple in-memory cache
    cache: new Map(),
    
    set: (key, value, ttl = 60000) => { // Default TTL: 60 seconds
        cacheManager.cache.set(key, { value, timestamp: Date.now(), ttl });
    },
    
    get: (key) => {
        const item = cacheManager.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
            cacheManager.cache.delete(key);
            return null;
        }
        
        return item.value;
    },
    
    clear: () => {
        cacheManager.cache.clear();
    }
};

// 4. API optimization functions
const apiOptimizer = {
    // API request caching
    cachedFetch: async (url, options = {}) => {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            cacheManager.set(cacheKey, data, 300000); // Cache for 5 minutes
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // Batch API requests
    batchRequests: async (requests) => {
        const results = await Promise.allSettled(
            requests.map(req => fetch(req.url, req.options).then(res => res.json()))
        );
        
        return results.map(result => 
            result.status === 'fulfilled' ? result.value : null
        );
    }
};

// 5. Cart optimization
const cartOptimizer = {
    // Optimize cart operations
    addToCart: (productId, quantity = 1) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // In a real app, you would fetch product details
            cart.push({
                id: productId,
                quantity: quantity,
                timestamp: Date.now()
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return cart;
    },
    
    // Get cart with optimized structure
    getCart: () => {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },
    
    // Update cart efficiently
    updateCart: (productId, newQuantity) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (newQuantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
            }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return cart;
    }
};

// 6. Product filtering optimization
const productOptimizer = {
    // Optimized search with indexing
    searchProducts: (products, query) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return products;
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm)
        );
    },
    
    // Optimized filtering
    filterProducts: (products, filters) => {
        return products.filter(product => {
            // Category filter
            if (filters.category && product.category !== filters.category) {
                return false;
            }
            
            // Price filter
            if (filters.minPrice !== undefined && product.price < filters.minPrice) {
                return false;
            }
            
            if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
                return false;
            }
            
            // In stock filter
            if (filters.inStock && product.stock <= 0) {
                return false;
            }
            
            return true;
        });
    }
};

// 7. Performance monitoring
const performanceMonitor = {
    // Measure function execution time
    measure: (fn, name) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },
    
    // Monitor page load time
    monitorPageLoad: () => {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime} milliseconds`);
            
            // Log performance metrics
            if (performance.getEntriesByType('navigation').length > 0) {
                const navEntry = performance.getEntriesByType('navigation')[0];
                console.log('DNS lookup time:', navEntry.domainLookupEnd - navEntry.domainLookupStart);
                console.log('TCP connection time:', navEntry.connectEnd - navEntry.connectStart);
                console.log('Request time:', navEntry.responseEnd - navEntry.requestStart);
                console.log('DOM processing time:', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            }
        });
    }
};

// 8. Memory optimization
const memoryOptimizer = {
    // Clean up event listeners
    cleanupEventListeners: (element, eventType, handler) => {
        element.removeEventListener(eventType, handler);
    },
    
    // Optimize object creation
    createOptimizedObject: (data) => {
        // Use Object.freeze for constant data
        return Object.freeze({ ...data });
    }
};

// 9. Initialize optimizations
const initializeOptimizations = () => {
    console.log('Initializing performance optimizations...');
    
    // Lazy load images
    if ('IntersectionObserver' in window) {
        imageOptimizer.lazyLoadImages();
    }
    
    // Monitor page load
    performanceMonitor.monitorPageLoad();
    
    // Preload critical resources
    const criticalImages = [
        'images/hero/hero-bg.jpg',
        'images/products/perfume1.jpg',
        'images/products/kurta1.jpg'
    ];
    imageOptimizer.preloadCriticalImages(criticalImages);
    
    console.log('Performance optimizations initialized!');
};

// 10. Export optimization functions
const optimizationSuite = {
    imageOptimizer,
    domOptimizer,
    cacheManager,
    apiOptimizer,
    cartOptimizer,
    productOptimizer,
    performanceMonitor,
    memoryOptimizer,
    initializeOptimizations
};

// Initialize optimizations when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOptimizations);
} else {
    initializeOptimizations();
}

// Additional performance tips as comments:

/*
PERFORMANCE OPTIMIZATION TIPS FOR       BLOOME-BY-NAYAB:

1. IMAGE OPTIMIZATION:
   - Use WebP format for images (with fallbacks)
   - Implement lazy loading for product images
   - Compress images before uploading
   - Use appropriate image dimensions

2. CSS OPTIMIZATION:
   - Minify CSS files
   - Remove unused CSS
   - Use CSS sprites for icons
   - Implement critical CSS inlining

3. JAVASCRIPT OPTIMIZATION:
   - Minify JavaScript files
   - Use tree shaking to remove unused code
   - Implement code splitting
   - Use efficient algorithms and data structures

4. SERVER-LEVEL OPTIMIZATIONS:
   - Enable Gzip compression
   - Use a CDN for static assets
   - Implement server-side caching
   - Optimize database queries

5. DATABASE OPTIMIZATIONS:
   - Add indexes to frequently queried fields
   - Use pagination for large datasets
   - Implement database connection pooling
   - Optimize queries with proper indexing

6. MOBILE OPTIMIZATIONS:
   - Implement responsive design
   - Optimize for touch interactions
   - Reduce payload sizes
   - Use service workers for offline functionality

7. THIRD-PARTY SCRIPTS:
   - Load third-party scripts asynchronously
   - Audit and remove unnecessary scripts
   - Use lazy loading for non-critical scripts
   - Monitor third-party script performance
*/

// Example usage of optimization functions
console.log('Optimization suite ready:', Object.keys(optimizationSuite));

// Example: Using the cache
cacheManager.set('test-key', { data: 'test-value' });
console.log('Cached value:', cacheManager.get('test-key'));

// Example: Debounced search
const debouncedSearch = domOptimizer.debounce((query) => {
    console.log('Searching for:', query);
}, 300);

// Example: Throttled scroll handler
const throttledScroll = domOptimizer.throttle(() => {
    console.log('Scroll event handled');
}, 100);

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = optimizationSuite;
}

// Performance optimization complete
console.log('All optimizations loaded and ready!');