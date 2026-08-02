const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get products' });
    }
};

exports.getFeatured = async (req, res) => {
    try {
        const products = await Product.getFeatured();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get featured products' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get product' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, sku, stock, brand } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const product = await Product.create({
            name,
            slug,
            description,
            price,
            category,
            sku,
            stock: stock || 0,
            brand: brand || null,
            is_active: 1
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updated = await Product.update(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Product.delete(req.params.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};