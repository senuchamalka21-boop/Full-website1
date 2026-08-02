const { query, getOne, insert, update } = require('../config/database');

class Order {
    static async findById(id) {
        return await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    }

    static async getByUser(userId) {
        return await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    }

    static async getAll() {
        return await query('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
    }

    static async create(data) {
        const orderNumber = `PT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const orderId = await insert('orders', {
            order_number: orderNumber,
            user_id: data.userId,
            subtotal: data.subtotal,
            tax: data.tax || 0,
            shipping_cost: data.shippingCost || 0,
            discount_amount: data.discount || 0,
            grand_total: data.grandTotal,
            status: 'pending',
            payment_method: data.paymentMethod || 'cash_on_delivery',
            payment_status: 'pending',
            shipping_street: data.shippingAddress?.street,
            shipping_city: data.shippingAddress?.city,
            shipping_state: data.shippingAddress?.state,
            shipping_zip: data.shippingAddress?.zip,
            shipping_country: data.shippingAddress?.country,
            created_at: new Date(),
            updated_at: new Date()
        });
        return await this.findById(orderId);
    }

    static async updateStatus(id, status) {
        await update('orders', { status, updated_at: new Date() }, 'id = ?', [id]);
        return await this.findById(id);
    }
}

module.exports = Order;