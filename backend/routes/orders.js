const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, isAdmin } = require('../middleware/auth');

router.use(auth);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

router.get('/', isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;