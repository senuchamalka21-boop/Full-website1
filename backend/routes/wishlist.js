const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', wishlistController.getWishlist);
router.post('/items/:productId', wishlistController.addToWishlist);
router.delete('/items/:productId', wishlistController.removeFromWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.get('/check/:productId', wishlistController.checkInWishlist);

module.exports = router;