const { query, insert } = require('../config/database');

class OrderItem {
    static async create(data) {
        const itemId = await insert('order_items', {
            order_id: data.orderId,
            product_id: data.productId,
            product_name: data.productName,
            product_sku: data.productSku || null,
            quantity: data.quantity,
            price: data.price,
            image_url: data.image || null,
            created_at: new Date()
        });
        return itemId;
    }

    static async bulkCreate(orderId, items) {
        const results = [];
        for (const item of items) {
            const id = await this.create({
                orderId,
                productId: item.productId,
                productName: item.name,
                productSku: item.sku,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            });
            results.push(id);
        }
        return results;
    }

    static async getByOrder(orderId) {
        return await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    }
}

module.exports = OrderItem;