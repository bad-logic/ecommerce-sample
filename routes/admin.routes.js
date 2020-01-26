const adminController = require('./../controllers/admin.controller');
const { body, check } = require('express-validator');
const express = require('express');
const router = express.Router();

//  ROUTES

router.get('/products', adminController.getProducts);

router.get('/add-product', adminController.getAddProduct);

router.post('/add-product', [
    body('title').isString().isLength({ min: 3 }).withMessage(`'Title' must be at least 3 characters long.`).trim(),
    body('price').isFloat().withMessage(`'Price' must be a floating number.`).trim(),
    body('description').isLength({ min: 10, max: 250 }).withMessage(`'Description' must be at least 10 characters long.`).trim()
], adminController.postAddProduct);

router.post('/edit-product', [
    body('title').isString().isLength({ min: 3 }).withMessage(`'Title' must be at least 3 characters long.`).trim(),
    body('price').isFloat().withMessage(`'Price' must be a floating number.`).trim(),
    body('description').isLength({ min: 10, max: 250 }).withMessage(`'Description' must be at least 10 characters long.`).trim()
], adminController.postUpdateProduct);

router.get('/edit-product/:id', adminController.getEditProduct);


// router.post('/delete-product', adminController.postDeleteProduct);
// if request is made through js then we have access to other http verbs
router.delete('/product/:id', adminController.deleteProduct);


module.exports = router;