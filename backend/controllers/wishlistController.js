const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.getByUser(req.user.id);
        res.json({ success: true, data: wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get wishlist' });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.add(req.user.id, req.params.productId);
        res.json({ success: true, message: 'Added to wishlist', data: wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.remove(req.user.id, req.params.productId);
        res.json({ success: true, message: 'Removed from wishlist', data: wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
    }
};

exports.clearWishlist = async (req, res) => {
    try {
        await Wishlist.clear(req.user.id);
        res.json({ success: true, message: 'Wishlist cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
    }
};

exports.checkInWishlist = async (req, res) => {
    try {
        const exists = await Wishlist.exists(req.user.id, req.params.productId);
        res.json({ success: true, data: { exists } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to check wishlist' });
    }
};