// Payment Integration for       BLOOME-BY-NAYAB
// This is a simplified version for demonstration purposes

// Stripe payment integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// PayPal payment integration
const paypal = require('@paypal/checkout-server-sdk')(
    process.env.PAYPAL_ENVIRONMENT === 'sandbox' 
        ? new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        )
        : new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        )
);

// Process payment with Stripe
const processStripePayment = async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Process payment with PayPal
const processPayPalPayment = async (req, res) => {
    try {
        const { amount, currency = 'USD' } = req.body;

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: amount,
                    },
                },
            ],
        });

        const order = await paypalClient.execute(request);
        res.json({
            id: order.result.id,
            status: order.result.status,
            links: order.result.links
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { paymentId, paymentMethod } = req.body;

        if (paymentMethod === 'stripe') {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
            res.json({
                status: paymentIntent.status,
                payment_method: paymentIntent.payment_method,
                amount: paymentIntent.amount / 100 // Convert from cents to dollars
            });
        } else if (paymentMethod === 'paypal') {
            const request = new paypal.orders.OrdersGetRequest(paymentId);
            const order = await paypalClient.execute(request);
            res.json({
                status: order.result.status,
                payment_method: order.result.purchase_units[0].payments.captures[0].payment_source,
                amount: order.result.purchase_units[0].amount.value
            });
        } else {
            res.status(400).json({ error: 'Invalid payment method' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Refund payment
const refundPayment = async (req, res) => {
    try {
        const { paymentId, paymentMethod, amount } = req.body;

        if (paymentMethod === 'stripe') {
            const refund = await stripe.refunds.create({
                payment_intent: paymentId,
                amount: Math.round(amount * 100), // Stripe uses cents
            });
            res.json({
                id: refund.id,
                status: refund.status,
                amount: refund.amount / 100 // Convert from cents to dollars
            });
        } else if (paymentMethod === 'paypal') {
            // PayPal refund implementation would go here
            res.status(501).json({ error: 'PayPal refund not implemented' });
        } else {
            res.status(400).json({ error: 'Invalid payment method' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    processStripePayment,
    processPayPalPayment,
    verifyPayment,
    refundPayment
};