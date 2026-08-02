const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.getByUser(req.user.id);
        res.json({ success: true, data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get cart' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.addItem(req.user.id, productId, quantity || 1);
        res.json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to add to cart' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.updateQuantity(req.user.id, req.params.id, quantity);
        res.json({ success: true, message: 'Cart updated', data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.removeItem(req.user.id, req.params.id);
        res.json({ success: true, message: 'Item removed from cart', data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to remove from cart' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.clear(req.user.id);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to clear cart' });
    }
};