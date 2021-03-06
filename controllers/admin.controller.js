const Product = require('./../models/product.model');
const { validationResult } = require('express-validator');
const { deleteFile } = require('./../util/file');
const ITEMS_PER_PAGE = 3;

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
        errorMessage = errorMessage + ' ' + err.msg;
    });
    const image = req.file;
    // validation 
    if (!errors.isEmpty()) {
        if (image) {
            // since error in validation occurs
            // and if we have uploaded the image
            // except for the case of unsupported file types
            // the image gets saved in the server even though we may have errors
            // in other input fields
            // so we delete such files
            deleteFile(image.path);
        }
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
    product.save()
        .then(data => {
            res.redirect('/admin/products');
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getProducts = (req, res, next) => {

    let totalProds;
    let lastPage;
    const page = parseInt(req.query.page, 10) || 1; //undefined in case page is not provided eg: when index page is loaded
    Product.find({ userId: req.user._id })
        .countDocuments()
        .then(count => {
            totalProds = count;
            lastPage = Math.ceil(totalProds / ITEMS_PER_PAGE);
            return Product.find({ userId: req.user._id })
                .skip((page - 1) * ITEMS_PER_PAGE) // NaN in case page = undefined in such case it will not skip any data
                .limit(ITEMS_PER_PAGE)
                .populate('userId');
        })
        .then(data => {
            res.render('admin/products', {
                products: data,
                path: 'admin-product',
                pageTitle: 'Admin Products',
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage,
                previousPage: page - 1,
                currentPage: page,
                nextPage: page + 1,
                lastPage: lastPage
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
        errorMessage = errorMessage + ' ' + err.msg;
    });

    // checking if the image is sent in the request
    // undefined if no image is uploaded
    const image = req.file;
    // validation 
    if (!errors.isEmpty()) {
        if (image) {
            // since error in validation occurs
            // and if we have uploaded the image
            // except for the case of unsupported file types
            // the image gets saved in the server even though we may have errors
            // in other input fields
            // so we delete such files
            deleteFile(image.path);
        }
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

    Product.findById(req.body.id)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            if (image) {
                // we got an image in the request body so
                //  we are sure that we want to replace the file
                // so we first delete the file
                deleteFile(product.imageUrl.slice(1));
                // set the image path in database
                product.imageUrl = '/' + image.path;
            }
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

exports.deleteProduct = (req, res, next) => {

    const id = req.params.id;
    Product.findById(id).then(product => {
            if (!product) {
                return next(new Error('Product not found'));
            }
            deleteFile(product.imageUrl.slice(1));
            return Product.deleteOne({ _id: id, userId: req.user._id })
        })
        .then(response => {
            res.status(200).json({ msg: 'delete successfull!!!' });
        })
        .catch(err => {
            res.status(500).json({ msg: 'delete Failed' });
        });

};