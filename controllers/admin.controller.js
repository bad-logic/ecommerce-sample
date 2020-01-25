const Product = require('./../models/product.model');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: 'add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });

};


exports.postAddProduct = (req, res, next) => {

    let errorMessage = '';
    const errors = validationResult(req);
    errors.array().forEach(err => {
        errorMessage = errorMessage + err.msg;
    });

    // validation 
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: 'add-product',
            editing: false,
            hasError: true,
            errorMessage: errorMessage,
            validationErrors: errors.array(),
            product: {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description
            }
        });
    }

    const image = req.file;
    console.log("image", image);
    // checking if image is valid/supported file types
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: 'add-product',
            editing: false,
            hasError: true,
            errorMessage: 'Attached fileType is not supported.',
            validationErrors: [],
            product: {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description
            }
        });
    }

    let product = new Product({});
    product.title = req.body.title;
    product.price = req.body.price;
    product.imageUrl = '/' + image.path;
    product.description = req.body.description;
    product.userId = req.user;
    // console.log("product to add>>>", product);
    product.save()
        .then(data => {
            // console.log("result>>", data);
            res.redirect('/admin/products');
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }).populate('userId')
        .then(data => {
            // console.log("data>>>", data);
            res.render('admin/products', {
                products: data,
                path: 'admin-product',
                pageTitle: 'Admin Products',
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.id;
    Product.findById(prodId)
        .then(data => {
            if (!data) {
                return res.redirect("/");
            }
            // console.log("data to edit>>", data);
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: 'edit-product',
                product: data,
                editing: editMode,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


exports.postUpdateProduct = (req, res, next) => {

    let errorMessage = '';
    const errors = validationResult(req);
    errors.array().forEach(err => {
        errorMessage = errorMessage + err.msg;
    });
    // validation 
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: 'edit-product',
            hasError: true,
            editing: true,
            errorMessage: errorMessage,
            validationErrors: [],
            product: {
                _id: req.body.id,
                title: req.body.title,
                price: req.body.price,
                description: req.body.description
            }
        });
    }

    // checking if the image is sent in the request
    // undefined if no image is uploaded
    const image = req.file;

    Product.findById(req.body.id)
        .then(product => {
            // console.log("product userId and req.user._id", product.userId, req.user._id);
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            if (image) {
                product.imageUrl = '/' + image.path;
            }
            // console.log("product to update>>>", product);
            return product.save()
                .then(result => {
                    res.redirect("/admin/products");
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


exports.postDeleteProduct = (req, res, next) => {

    const id = req.body.id;
    Product.deleteOne({ _id: id, userId: req.user._id })
        .then(response => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};