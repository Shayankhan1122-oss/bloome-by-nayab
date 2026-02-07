// API endpoint for categories
// This works with Vercel Serverless Functions

const categories = [
    { id: 'fragrances', name: 'Fragrances', description: 'Attar & Perfumes' },
    { id: 'clothes', name: 'Clothes', description: 'Male & Female' },
    { id: 'agricultural', name: 'Agricultural Products', description: 'Desi Ghee, Honey, Eggs' },
    { id: 'home-textiles', name: 'Home Textiles', description: 'Blankets, Prayer Mats' }
];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.status(200).json(categories);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}