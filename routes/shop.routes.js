const shopController = require('./../controllers/shop.controller');
const { checkAuthorised } = require('./../middleware/Authorise');
const express = require('express');
const router = express.Router();


//  ROUTES

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:id', shopController.getProductDetails);

router.get('/cart', checkAuthorised, shopController.getCart);

router.post('/cart', checkAuthorised, shopController.addToCart);

router.post('/cart-delete-item', checkAuthorised, shopController.postDeleteFromCart);

router.post('/create-order', checkAuthorised, shopController.PostOrder);

router.get('/checkout', shopController.getCheckout);

router.get('/orders', checkAuthorised, shopController.getOrders);

router.get('/orders/:orderId', checkAuthorised, shopController.getInvoice);

module.exports = router;