const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const userId = req.user.id;

        const cart = await Cart.getByUser(userId);
        if (cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(400).json({ success: false, message: `Product not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            subtotal += product.price * item.quantity;
            orderItems.push({
                productId: product.id,
                name: product.name,
                sku: product.sku,
                quantity: item.quantity,
                price: product.price,
                image: item.product_image
            });

            await Product.decreaseStock(product.id, item.quantity);
        }

        const tax = subtotal * 0.1;
        const shipping = subtotal > 100 ? 0 : 10;
        const grandTotal = subtotal + tax + shipping;

        const order = await Order.create({
            userId,
            subtotal,
            tax,
            shippingCost: shipping,
            grandTotal,
            paymentMethod: paymentMethod || 'cash_on_delivery',
            shippingAddress
        });

        await OrderItem.bulkCreate(order.id, orderItems);
        await Cart.clear(userId);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.getByUser(req.user.id);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get orders' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const items = await OrderItem.getByOrder(order.id);
        res.json({ success: true, data: { ...order, items } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get order' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.updateStatus(req.params.id, status);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order status updated', data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
};