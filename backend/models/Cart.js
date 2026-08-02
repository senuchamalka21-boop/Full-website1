const { query, getOne, insert, update, deleteRows } = require('../config/database');

class Cart {
    static async getByUser(userId) {
        const items = await query(
            `SELECT c.*, p.name as product_name, p.price as product_price, p.stock,
                    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image
             FROM cart c
             LEFT JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );

        let subtotal = 0;
        for (const item of items) {
            item.total_price = item.quantity * item.product_price;
            subtotal += item.total_price;
        }

        return { items, subtotal };
    }

    static async addItem(userId, productId, quantity = 1) {
        const existing = await getOne(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing) {
            await update('cart', { quantity: existing.quantity + quantity, updated_at: new Date() }, 'id = ?', [existing.id]);
        } else {
            await insert('cart', {
                user_id: userId,
                product_id: productId,
                quantity,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        return await this.getByUser(userId);
    }

    static async updateQuantity(userId, cartId, quantity) {
        if (quantity <= 0) {
            await deleteRows('cart', 'id = ? AND user_id = ?', [cartId, userId]);
        } else {
            await update('cart', { quantity, updated_at: new Date() }, 'id = ? AND user_id = ?', [cartId, userId]);
        }
        return await this.getByUser(userId);
    }

    static async removeItem(userId, cartId) {
        await deleteRows('cart', 'id = ? AND user_id = ?', [cartId, userId]);
        return await this.getByUser(userId);
    }

    static async clear(userId) {
        await deleteRows('cart', 'user_id = ?', [userId]);
        return { items: [], subtotal: 0 };
    }
}

module.exports = Cart;