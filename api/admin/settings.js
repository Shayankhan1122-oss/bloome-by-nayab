// API endpoint for store settings
// MongoDB Version - Settings persist permanently

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('bloome_nayab');
        const settingsCollection = db.collection('settings');

        // GET - Retrieve settings
        if (req.method === 'GET') {
            let settings = await settingsCollection.findOne({ _id: 'store_settings' });
            
            // If no settings exist, create defaults
            if (!settings) {
                const defaultSettings = {
                    _id: 'store_settings',
                    storeSettings: {
                        name: 'BLOOME BY NAYAB',
                        email: 'shayanihtiram443@gmail.com',
                        phone: '+92 334 8818200',
                        address: 'Peshawar, Khyber Pakhtunkhwa, Pakistan'
                    },
                    shippingPolicy: `We offer shipping across Pakistan.

Delivery Time: 3-5 business days
Shipping Charges:
• Rs 500-1,999: Rs 250
• Rs 2,000-2,999: Rs 350
• Rs 3,000-4,999: Rs 500
• Rs 5,000+: FREE 🎉

Tracking: Available for all orders

For questions, contact us at shayanihtiram443@gmail.com`,
                    returnsPolicy: `Return & Exchange Policy

We accept returns within 7 days of delivery.

Conditions:
- Product must be unused and in original packaging
- Return shipping costs are borne by the customer
- Refund will be processed within 5-7 business days

To initiate a return, contact us at shayanihtiram443@gmail.com`,
                    faqContent: `Frequently Asked Questions

Q: How do I track my order?
A: You will receive a tracking link via email after your order is confirmed.

Q: What payment methods do you accept?
A: We accept Cash on Delivery (COD) for all orders.

Q: Do you ship internationally?
A: Currently, we only ship within Pakistan.

Q: What is the minimum order amount?
A: Minimum order amount is Rs 500.`,
                    termsConditions: `Terms & Conditions

By using BLOOME BY NAYAB website and services, you agree to these terms.

1. Product Information: We strive for accuracy in all product descriptions.
2. Pricing: All prices are in Pakistani Rupees (PKR) and may change without notice.
3. Orders: All orders are subject to availability and confirmation.
4. Payment: Cash on Delivery only.
5. Delivery: 3-5 business days across Pakistan.

For questions, contact us at shayanihtiram443@gmail.com`,
                    privacyPolicy: `Privacy Policy

BLOOME BY NAYAB respects your privacy and protects your personal information.

Information We Collect:
- Name, email, phone number, and shipping address
- Order history and preferences

How We Use Your Information:
- To process and fulfill your orders
- To send order updates and tracking information
- To improve our products and services

Your Rights:
You can request to view, update, or delete your personal data by contacting us.

Contact: shayanihtiram443@gmail.com`,
                    updatedAt: new Date().toISOString()
                };
                
                await settingsCollection.insertOne(defaultSettings);
                settings = defaultSettings;
                
                console.log('✅ Default settings created in MongoDB');
            }
            
            return res.status(200).json({
                success: true,
                settings: settings
            });
        }

        // POST - Update settings
        if (req.method === 'POST') {
            const updates = req.body;
            
            // Get existing settings
            let settings = await settingsCollection.findOne({ _id: 'store_settings' });
            
            if (!settings) {
                settings = {
                    _id: 'store_settings',
                    storeSettings: {},
                    shippingPolicy: '',
                    returnsPolicy: '',
                    faqContent: '',
                    termsConditions: '',
                    privacyPolicy: ''
                };
            }
            
            // Update fields
            if (updates.storeSettings) {
                settings.storeSettings = {
                    ...settings.storeSettings,
                    ...updates.storeSettings
                };
            }
            
            if (updates.shippingPolicy !== undefined) {
                settings.shippingPolicy = updates.shippingPolicy;
            }
            
            if (updates.returnsPolicy !== undefined) {
                settings.returnsPolicy = updates.returnsPolicy;
            }
            
            if (updates.faqContent !== undefined) {
                settings.faqContent = updates.faqContent;
            }
            
            if (updates.termsConditions !== undefined) {
                settings.termsConditions = updates.termsConditions;
            }
            
            if (updates.privacyPolicy !== undefined) {
                settings.privacyPolicy = updates.privacyPolicy;
            }
            
            settings.updatedAt = new Date().toISOString();
            
            // Upsert to MongoDB
            await settingsCollection.updateOne(
                { _id: 'store_settings' },
                { $set: settings },
                { upsert: true }
            );
            
            console.log('✅ Settings updated in MongoDB');
            
            return res.status(200).json({
                success: true,
                message: 'Settings updated successfully in MongoDB',
                settings: settings
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('❌ MongoDB Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: error.message
        });
    }
}