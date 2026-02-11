// API endpoint for admin products management
// MongoDB Version - Data persists permanently

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
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('bloome_nayab');
        const productsCollection = db.collection('products');

        // GET - Fetch all products
        if (req.method === 'GET') {
            const products = await productsCollection.find({}).toArray();
            
            // If no products, seed with default data
            if (products.length === 0) {
                const defaultProducts = [
                    {
                        id: 1,
                        name: "Diamond Necklace",
                        price: 15000,
                        category: "jewellery",
                        image: "https://placehold.co/300x300/d4a574/ffffff/png?text=Diamond+Necklace",
                        gallery: ["https://placehold.co/300x300/d4a574/ffffff/png?text=Diamond+Necklace"],
                        rating: 4.8,
                        description: "Exquisite diamond necklace with premium quality stones",
                        stock: 5,
                        sku: "JW-001",
                        status: "active"
                    },
                    {
                        id: 2,
                        name: "Premium Lipstick Set",
                        price: 2500,
                        category: "cosmetics",
                        image: "https://placehold.co/300x300/c9ada7/ffffff/png?text=Lipstick+Set",
                        gallery: ["https://placehold.co/300x300/c9ada7/ffffff/png?text=Lipstick+Set"],
                        rating: 4.5,
                        description: "Long-lasting premium lipstick collection",
                        stock: 25,
                        sku: "CS-001",
                        status: "active"
                    },
                    {
                        id: 3,
                        name: "Luxury Face Serum",
                        price: 3500,
                        category: "skincare",
                        image: "https://placehold.co/300x300/1a1a2e/ffffff/png?text=Face+Serum",
                        gallery: ["https://placehold.co/300x300/1a1a2e/ffffff/png?text=Face+Serum"],
                        rating: 4.9,
                        description: "Anti-aging face serum with natural ingredients",
                        stock: 15,
                        sku: "SK-001",
                        status: "active"
                    },
                    {
                        id: 4,
                        name: "Elegant Party Dress",
                        price: 8500,
                        category: "clothes",
                        image: "https://placehold.co/300x300/16213e/ffffff/png?text=Party+Dress",
                        gallery: ["https://placehold.co/300x300/16213e/ffffff/png?text=Party+Dress"],
                        rating: 4.6,
                        description: "Sophisticated party dress for special occasions",
                        stock: 10,
                        sku: "CL-001",
                        status: "active"
                    }
                ];
                
                await productsCollection.insertMany(defaultProducts);
                return res.status(200).json({
                    success: true,
                    products: defaultProducts
                });
            }
            
            return res.status(200).json({
                success: true,
                products: products
            });
        }

        // POST - Add new product
        if (req.method === 'POST') {
            const newProduct = req.body;
            
            // Get last product ID
            const lastProduct = await productsCollection.find({}).sort({ id: -1 }).limit(1).toArray();
            const newId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;
            
            const product = {
                id: newId,
                name: newProduct.name,
                sku: newProduct.sku,
                category: newProduct.category,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                status: newProduct.status || 'active',
                description: newProduct.description || '',
                image: newProduct.image || 'https://placehold.co/300x300/d4a574/ffffff/png?text=Product',
                gallery: Array.isArray(newProduct.gallery) ? newProduct.gallery : [newProduct.image],
                rating: 4.5,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await productsCollection.insertOne(product);
            
            console.log('✅ Product saved to MongoDB:', product.name);
            
            return res.status(201).json({
                success: true,
                message: 'Product added successfully to MongoDB',
                product: product
            });
        }

        // PUT - Update existing product
        if (req.method === 'PUT') {
            const { id } = req.query;
            const updates = req.body;
            
            const existingProduct = await productsCollection.findOne({ id: parseInt(id) });
            
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            
            const updatedProduct = {
                name: updates.name,
                sku: updates.sku,
                category: updates.category,
                price: parseFloat(updates.price),
                stock: parseInt(updates.stock),
                status: updates.status,
                description: updates.description || '',
                image: updates.image || existingProduct.image,
                gallery: Array.isArray(updates.gallery) ? updates.gallery : existingProduct.gallery,
                updatedAt: new Date()
            };

            await productsCollection.updateOne(
                { id: parseInt(id) },
                { $set: updatedProduct }
            );
            
            console.log('✅ Product updated in MongoDB:', updates.name);
            
            return res.status(200).json({
                success: true,
                message: 'Product updated successfully in MongoDB',
                product: { id: parseInt(id), ...updatedProduct }
            });
        }

        // DELETE - Remove product
        if (req.method === 'DELETE') {
            const { id } = req.query;
            
            const result = await productsCollection.deleteOne({ id: parseInt(id) });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            
            console.log('✅ Product deleted from MongoDB, ID:', id);
            
            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully from MongoDB'
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