const { query, getOne, insert, update } = require('../config/database');

class Product {
    static async getAll() {
        return await query('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
    }

    static async getFeatured(limit = 4) {
        return await query('SELECT * FROM products WHERE is_active = 1 AND is_featured = 1 ORDER BY created_at DESC LIMIT ?', [limit]);
    }

    static async findById(id) {
        return await getOne('SELECT * FROM products WHERE id = ? AND is_active = 1', [id]);
    }

    static async create(data) {
        const productId = await insert('products', {
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
        return await this.findById(productId);
    }

    static async update(id, data) {
        await update('products', { ...data, updated_at: new Date() }, 'id = ?', [id]);
        return await this.findById(id);
    }

    static async delete(id) {
        await update('products', { is_active: 0, updated_at: new Date() }, 'id = ?', [id]);
        return true;
    }

    static async decreaseStock(id, quantity) {
        const product = await this.findById(id);
        if (!product) return null;
        const newStock = Math.max(0, product.stock - quantity);
        await update('products', { stock: newStock, updated_at: new Date() }, 'id = ?', [id]);
        return await this.findById(id);
    }
}

module.exports = Product;