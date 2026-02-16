// Database Schema for       BLOOME-BY-NAYAB
// This is a conceptual schema for MongoDB using Mongoose

const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: [{
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: String,
    description: {
        type: String,
        required: true
    },
    shortDescription: String,
    price: {
        type: Number,
        required: true
    },
    salePrice: Number,
    images: [{
        type: String
    }],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    attributes: [{
        name: String,
        value: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String
    }],
    shippingAddress: {
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
        email: String
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    status: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },
    paidAt: Date,
    deliveredAt: Date,
    date: {
        type: Date,
        default: Date.now
    }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: String,
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// Category Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    image: String,
    subcategories: [{
        name: String,
        description: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Export Models
module.exports = {
    User: mongoose.model('User', userSchema),
    Product: mongoose.model('Product', productSchema),
    Order: mongoose.model('Order', orderSchema),
    Review: mongoose.model('Review', reviewSchema),
    Category: mongoose.model('Category', categorySchema),
    Wishlist: mongoose.model('Wishlist', wishlistSchema)
};