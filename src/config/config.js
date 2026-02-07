// Configuration for       IBREES-LIL-HUZAIFA

// Environment variables
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'qari_webstore',
    url: process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'qari_webstore'}`
};

// JWT configuration
const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
};

// Stripe configuration
const stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
};

// PayPal configuration
const paypalConfig = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox' // 'sandbox' or 'live'
};

// Email configuration
const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@qariwebstore.com'
};

// Cloudinary configuration for image uploads
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

// Server configuration
const serverConfig = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:5000'
};

// Export all configurations
module.exports = {
    dbConfig,
    jwtConfig,
    stripeConfig,
    paypalConfig,
    emailConfig,
    cloudinaryConfig,
    serverConfig
};