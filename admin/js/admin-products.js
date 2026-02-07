// Admin Products JavaScript

// Sample product data
let products = [
    {
        id: 1,
        name: "Premium Perfume",
        sku: "PR-001",
        category: "fragrances",
        price: 49.99,
        stock: 25,
        status: "active",
        image: "images/products/perfume1.jpg",
        description: "Luxury perfume with long-lasting fragrance"
    },
    {
        id: 2,
        name: "Cotton Kurta",
        sku: "CL-001",
        category: "clothes",
        price: 29.99,
        stock: 15,
        status: "active",
        image: "images/products/kurta1.jpg",
        description: "Comfortable cotton kurta for daily wear"
    },
    {
        id: 3,
        name: "Pure Desi Ghee",
        sku: "AG-001",
        category: "agricultural",
        price: 19.99,
        stock: 40,
        status: "active",
        image: "images/products/ghee1.jpg",
        description: "Pure desi ghee made from cow milk"
    },
    {
        id: 4,
        name: "Prayer Mat",
        sku: "HT-001",
        category: "home-textiles",
        price: 39.99,
        stock: 8,
        status: "active",
        image: "images/products/mat1.jpg",
        description: "Soft and comfortable prayer mat"
    },
    {
        id: 5,
        name: "Attar Oil",
        sku: "PR-002",
        category: "fragrances",
        price: 24.99,
        stock: 30,
        status: "active",
        image: "images/products/attar1.jpg",
        description: "Natural attar oil with pure ingredients"
    }
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as admin
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load products
    loadProducts();
    
    // Setup event listeners
    setupAdminProductsEventListeners();
});

// Check if admin is logged in
function isAdminLoggedIn() {
    const admin = localStorage.getItem('admin');
    return admin !== null;
}

// Load products
function loadProducts() {
    const productsTableBody = document.getElementById('products-table-body');
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = products.map(product => `
        <tr data-id="${product.id}">
            <td>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${formatCategory(product.category)}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <select class="status-select" data-id="${product.id}">
                    <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to the new elements
    addProductActionListeners();
}

// Format category for display
function formatCategory(category) {
    const categories = {
        'fragrances': 'Fragrances',
        'clothes': 'Clothes',
        'agricultural': 'Agricultural Products',
        'home-textiles': 'Home Textiles'
    };
    return categories[category] || category;
}

// Add product action listeners
function addProductActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
    
    // Status select
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const newStatus = this.value;
            updateProductStatus(productId, newStatus);
        });
    });
}

// Setup admin products event listeners
function setupAdminProductsEventListeners() {
    // Admin logout
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutAdmin();
        });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
    
    // Modal close button
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const modal = document.getElementById('product-modal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Search and filter
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
}

// Open product modal
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    
    if (product) {
        // Editing existing product
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-status').value = product.status;
        document.getElementById('product-description').value = product.description || '';
        
        // Store product ID for update
        productForm.setAttribute('data-id', product.id);
    } else {
        // Adding new product
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        productForm.removeAttribute('data-id');
    }
    
    modal.style.display = 'block';
}

// Close product modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

// Save product (add or update)
function saveProduct() {
    const productForm = document.getElementById('product-form');
    const productId = productForm.getAttribute('data-id');
    
    const productData = {
        name: document.getElementById('product-name').value,
        sku: document.getElementById('product-sku').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        status: document.getElementById('product-status').value,
        description: document.getElementById('product-description').value,
        image: 'images/products/default.jpg' // Default image for now
    };
    
    if (productId) {
        // Update existing product
        updateProduct(parseInt(productId), productData);
    } else {
        // Add new product
        addProduct(productData);
    }
    
    closeModal();
}

// Add new product
function addProduct(productData) {
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...productData
    };
    
    products.push(newProduct);
    loadProducts();
    
    // Show success message
    alert('Product added successfully!');
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

// Update product
function updateProduct(productId, productData) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            ...productData
        };
        loadProducts();
        
        // Show success message
        alert('Product updated successfully!');
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        loadProducts();
        
        // Show success message
        alert('Product deleted successfully!');
    }
}

// Update product status
function updateProductStatus(productId, newStatus) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.status = newStatus;
        
        // In a real implementation, this would update the database
        // For now, we'll just update the UI
        alert(`Product status updated to ${newStatus}`);
    }
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.sku.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    if (statusFilter) {
        filteredProducts = filteredProducts.filter(p => p.status === statusFilter);
    }
    
    // Update table with filtered products
    const productsTableBody = document.getElementById('products-table-body');
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = filteredProducts.map(product => `
        <tr data-id="${product.id}">
            <td>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${formatCategory(product.category)}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <select class="status-select" data-id="${product.id}">
                    <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to the new elements
    addProductActionListeners();
}

// Logout admin
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear admin session
        localStorage.removeItem('admin');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}