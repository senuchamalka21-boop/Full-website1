const { query, insert, deleteRows } = require('../config/database');

class Wishlist {
    static async getByUser(userId) {
        return await query(
            `SELECT w.*, p.name, p.price, p.slug,
                    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
             FROM wishlist w
             LEFT JOIN products p ON w.product_id = p.id
             WHERE w.user_id = ?`,
            [userId]
        );
    }

    static async add(userId, productId) {
        const existing = await this.exists(userId, productId);
        if (!existing) {
            await insert('wishlist', {
                user_id: userId,
                product_id: productId,
                created_at: new Date()
            });
        }
        return await this.getByUser(userId);
    }

    static async remove(userId, productId) {
        await deleteRows('wishlist', 'user_id = ? AND product_id = ?', [userId, productId]);
        return await this.getByUser(userId);
    }

    static async exists(userId, productId) {
        const result = await query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.length > 0;
    }

    static async clear(userId) {
        await deleteRows('wishlist', 'user_id = ?', [userId]);
        return [];
    }
}

module.exports = Wishlist;