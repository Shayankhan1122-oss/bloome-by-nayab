// API endpoint for store settings
// Stores settings in-memory (will reset on redeploy like orders)
// For production, use a database

let settings = {
    storeSettings: {
        name: 'BLOOME BY NAYAB',
        email: 'huzaifamadani95@gmail.com',
        phone: '+92 334 8818200',
        address: 'Peshawar Pakistan'
    },
    shippingPolicy: `We offer shipping across Pakistan.

Delivery Time: 3-5 business days
Shipping Charges: Variable based on order value
Tracking: Available for all orders

For questions, contact us at huzaifamadani95@gmail.com`,
    returnsPolicy: `Return & Exchange Policy

We accept returns within 7 days of delivery.

Conditions:
- Product must be unused and in original packaging
- Return shipping costs are borne by the customer
- Refund will be processed within 5-7 business days

To initiate a return, contact us.`,
    faqContent: `Frequently Asked Questions

Q: How do I track my order?
A: You will receive a tracking link via email after your order is confirmed.

Q: What payment methods do you accept?
A: We accept Cash on Delivery (COD).

Q: Do you ship internationally?
A: Currently, we only ship within Pakistan.`,
    termsConditions: `Terms & Conditions

By using our website and services, you agree to these terms.

1. Product Information: We strive for accuracy.
2. Pricing: All prices are in Pakistani Rupees (PKR).
3. Orders: All orders are subject to availability.
4. Payment: Payment must be completed before delivery.

For questions, contact us.`,
    privacyPolicy: `Privacy Policy

We respect your privacy and protect your personal information.

Information We Collect:
- Name, email, phone number, and shipping address
- Order history

How We Use Your Information:
- To process and fulfill your orders
- To send order updates

Your Rights:
You can request to view, update, or delete your personal data.`
};

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // GET - Retrieve settings
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            settings: settings
        });
    }

    // POST - Update settings
    if (req.method === 'POST') {
        try {
            const updates = req.body;
            
            // Update settings object
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
            
            console.log('Settings updated successfully:', {
                storeSettings: settings.storeSettings
            });
            
            return res.status(200).json({
                success: true,
                message: 'Settings updated successfully',
                settings: settings
            });
            
        } catch (error) {
            console.error('Settings update error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update settings',
                message: error.message
            });
        }
    }

    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}