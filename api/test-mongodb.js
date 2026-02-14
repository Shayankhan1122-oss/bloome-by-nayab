// Test MongoDB connection
// File: api/test-mongodb.js
// Use this to diagnose connection issues

import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {},
        connectionTest: {},
        errors: []
    };

    try {
        // Check environment variable
        diagnostics.environment.hasMongoURI = !!process.env.MONGODB_URI;
        
        if (process.env.MONGODB_URI) {
            diagnostics.environment.uriStart = process.env.MONGODB_URI.substring(0, 30) + '...';
            diagnostics.environment.uriLength = process.env.MONGODB_URI.length;
            
            // Check for common issues
            if (process.env.MONGODB_URI.includes('@@')) {
                diagnostics.errors.push('❌ Connection string contains double @@ - should be single @');
            }
            if (!process.env.MONGODB_URI.includes('/bloome_nayab')) {
                diagnostics.errors.push('⚠️ Missing database name /bloome_nayab in connection string');
            }
            if (!process.env.MONGODB_URI.includes('retryWrites')) {
                diagnostics.errors.push('⚠️ Missing query parameters ?retryWrites=true&w=majority');
            }
        } else {
            diagnostics.errors.push('❌ MONGODB_URI environment variable not set');
            return res.status(500).json({
                success: false,
                error: 'MONGODB_URI not configured',
                diagnostics
            });
        }

        // Try to connect
        diagnostics.connectionTest.attempting = true;
        const uri = process.env.MONGODB_URI;
        
        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        try {
            await client.connect();
            diagnostics.connectionTest.connected = true;
            diagnostics.connectionTest.status = '✅ Connection successful';

            // Try to access database
            const db = client.db('bloome_nayab');
            diagnostics.connectionTest.database = db.databaseName;

            // Try to list collections
            const collections = await db.listCollections().toArray();
            diagnostics.connectionTest.collections = collections.map(c => c.name);
            diagnostics.connectionTest.collectionsCount = collections.length;

            // Try to count documents in products collection
            const productsCollection = db.collection('products');
            const productCount = await productsCollection.countDocuments();
            diagnostics.connectionTest.productsCount = productCount;

            await client.close();

            return res.status(200).json({
                success: true,
                message: '✅ MongoDB connection is working!',
                diagnostics
            });

        } catch (connError) {
            diagnostics.connectionTest.connected = false;
            diagnostics.connectionTest.status = '❌ Connection failed';
            diagnostics.connectionTest.error = connError.message;
            diagnostics.errors.push(`Connection error: ${connError.message}`);

            // Specific error checks
            if (connError.message.includes('authentication failed')) {
                diagnostics.errors.push('❌ Authentication failed - Check username/password');
            }
            if (connError.message.includes('ENOTFOUND')) {
                diagnostics.errors.push('❌ Cluster not found - Check cluster URL');
            }
            if (connError.message.includes('IP')) {
                diagnostics.errors.push('❌ IP not whitelisted - Add 0.0.0.0/0 to Network Access');
            }

            throw connError;
        }

    } catch (error) {
        diagnostics.errors.push(`Fatal error: ${error.message}`);
        
        return res.status(500).json({
            success: false,
            error: error.message,
            diagnostics,
            solution: getSolution(error.message)
        });
    }
}

function getSolution(errorMessage) {
    if (errorMessage.includes('authentication')) {
        return '1. Go to MongoDB → Database Access\n2. Edit user bloome_admin\n3. Reset password\n4. Update MONGODB_URI in Vercel';
    }
    if (errorMessage.includes('ENOTFOUND')) {
        return '1. Check cluster URL in connection string\n2. Verify cluster is running in MongoDB dashboard';
    }
    if (errorMessage.includes('IP')) {
        return '1. Go to MongoDB → Network Access\n2. Add IP Address\n3. Select "Allow Access from Anywhere"';
    }
    if (errorMessage.includes('@@')) {
        return '1. Fix connection string - use single @ not @@\n2. Update in Vercel environment variables\n3. Redeploy';
    }
    return 'Check Vercel logs and MongoDB dashboard for more details';
}

export const config = {
    maxDuration: 10,
};