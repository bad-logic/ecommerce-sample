const Product = require('../models/product.model');


exports.getIndex = (req, res, next) => {

    Product.find()
        .then((data) => {
            // console.log("data>>", data);
            res.render("shop/index", {
                pageTitle: 'My First Shop',
                path: 'index',
                products: data
                    // isAuthenticated: req.session.isLoggedIn,
                    // csrfToken: req.csrfToken()
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.getProducts = (req, res, next) => {

    Product.find()
        .then(data => {
            // console.log("data>>>", data);
            res.render("shop/product-list", {
                pageTitle: 'All products',
                path: 'product-list',
                products: data
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getProductDetails = (req, res, next) => {

    const prod_id = req.params.id;
    Product.findById(prod_id)
        .then(data => {
            // console.log("data>>>", data)
            res.render("shop/product-detail", {
                pageTitle: data.title,
                path: 'product-list',
                product: data
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.addToCart = (req, res, next) => {

    const prod_id = req.body.productId;

    // console.log("product id>>>", prod_id);

    Product.findById(prod_id)
        .then(product => {
            // console.log("product to add to cart>>>", product);
            // console.log("user>>", req.user);
            return req.user.addToCart(product);
        })
        .then(response => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getCart = (req, res, next) => {

    req.user // req.user is a user model object can call the populate method
        .populate('cart.items.product') //does not return promise
        .execPopulate()
        .then(user => {
            // console.log("user>>", user.cart.items);
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: 'cart',
                products: user.cart.items
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.postDeleteFromCart = (req, res, next) => {

    const prod_id = req.body.id;
    req.user.deleteCartItem(prod_id)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.PostOrder = (req, res, next) => {
    if (!req.user.cart.items.length) {
        // console.log("cart>>", req.user.cart.items);
        return res.redirect('/cart');
    }
    req.user.addOrder()
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {

    req.user.getOrder()
        .then(orders => {
            // console.log("orders>>", orders);
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: 'orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getCheckout = (req, res, next) => {

    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: 'checkout'
    });

}