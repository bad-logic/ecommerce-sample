const Product = require('../models/product.model');
const Order = require('../models/order.model');

// check documentation of pdfkit for more info
const PDFDocument = require('pdfkit'); // written in coffeeScript
const fs = require('fs');
const path = require('path');

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {

    let totalProds;
    let lastPage;
    const page = parseInt(req.query.page, 10) || 1; //undefined in case page is not provided eg: when index page is loaded
    Product.find()
        .countDocuments()
        .then(count => {
            totalProds = count;
            lastPage = Math.ceil(totalProds / ITEMS_PER_PAGE);
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE) // NaN in case page = undefined in such case it will not skip any data
                .limit(ITEMS_PER_PAGE)
        })
        .then((data) => {
            res.render("shop/index", {
                pageTitle: 'My First Shop',
                path: 'index',
                products: data,
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage,
                previousPage: page - 1,
                currentPage: page,
                nextPage: page + 1,
                lastPage: lastPage
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.getProducts = (req, res, next) => {

    let totalProds;
    let lastPage;
    const page = parseInt(req.query.page, 10) || 1; //undefined in case page is not provided eg: when index page is loaded

    Product.find()
        .countDocuments()
        .then(count => {
            totalProds = count;
            lastPage = Math.ceil(totalProds / ITEMS_PER_PAGE);
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE) // NaN in case page = undefined in such case it will not skip any data
                .limit(ITEMS_PER_PAGE)
        })
        .then(data => {
            res.render("shop/product-list", {
                pageTitle: 'All products',
                path: 'product-list',
                products: data,
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage,
                previousPage: page - 1,
                currentPage: page,
                nextPage: page + 1,
                lastPage: lastPage
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

    Product.findById(prod_id)
        .then(product => {
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
            // just in case product is deleted and user.cart.items returns output as below when populted from 
            // products collections since no product with such id exists:

            // [ { _id: 5e25689845011059b81cfd2d, product: null, quantity: 2 },
            //     { _id: 5e27d31d8f783a4a04343672, product: null, quantity: 1 },
            //     { _id: 5e27d788ac9e1952f0726d4a, product: null, quantity: 1 },
            //     { _id: 5e2aef52fdf2703308c35d1b,
            //       product:
            //        { _id: 5e2a744668d0a32105acd509,
            //          title: 'hello',
            //          price: 33.33,
            //          imageUrl: '/images/2020-01-24T05:18:33.126Z-ohone.jpg',
            //          description: 'nice inroduction book',
            //          userId: 5e23dc51f8cda420c5e68f80,
            //          createdAt: 2020-01-24T04:36:22.038Z,
            //          updatedAt: 2020-01-24T05:18:33.175Z,
            //          __v: 0 },
            //       quantity: 2 } ]

            //  this was one error occurred, in such cases ejs can't find products info which are
            // displayed in frontend so error occurs 
            // solution is to filter out the products before passing them to frontends



            const cartItems = user.cart.items.filter(item => {
                if (item.product) {
                    return item;
                }
            });

            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: 'cart',
                products: cartItems
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


exports.getCheckout = (req, res, next) => {

    req.user // req.user is a user model object can call the populate method
        .populate('cart.items.product') //does not return promise
        .execPopulate()
        .then(user => {
            let totalAmount = 0;
            const cartItems = user.cart.items.filter(item => {
                if (item.product) {
                    totalAmount += item.product.price * item.quantity;
                    return item;
                }
            });
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: 'checkout',
                products: cartItems,
                totalSum: totalAmount
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.PostOrder = (req, res, next) => {

    if (!req.user.cart.items.length) {
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

exports.getInvoice = (req, res, next) => {

    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('no order found.'));
        }
        if (req.user._id.toString() !== order.user.userId.toString()) {
            return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        // READING THE FILE, SUITABLE FOR SMALL FILES ONLY
        // fs.readFile(invoicePath, "utf8", (err, data) => {
        //     if (err) {
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf'); // providing info to the browser to handle the file
        //     res.setHeader('content-Disposition', 'inline; filename="' + invoiceName + '"'); // defines how the content should be served to the client
        //     // res.setHeader('content-Disposition', 'attachment; filename="' + invoiceName + '"'); // defines how the content should be served to the client
        //     res.send(data)
        // });

        // FOR BIGGER FILES YOU NEED TO STREAM THE DATA
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('content-Disposition', 'inline; filename="' + invoiceName + '"');
        // file.pipe(res); // forward the data read in stream to the response. response is a writable stream

        // CREATING THE INVOICE/ PDF GENEREATION USING PDFKIT AND SENDING TO CLIENT + WRITING TO THE SERVER AT ONCE
        const pdf = new PDFDocument(); // is a readable stream

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('content-Disposition', 'inline; filename="' + invoiceName + '"');

        pdf.pipe(fs.createWriteStream(invoicePath)) // creating write stream and writing in the server side in invoicePath
        pdf.pipe(res) // forward the data read from readable stream 'pdf' to the response. response is a writable stream

        pdf.fontSize(26).text('Invoice:', {
            underline: true
        });
        pdf.fontSize(14).text(`id: # ${order._id}`);
        pdf.fontSize(16);
        pdf.text('------------------------------------------------------------------------------------');
        pdf.text('Particulars' + '              ' + 'Unit Price($)' + '             ' + 'Qty' + '             ' + 'Total($)');
        pdf.text('------------------------------------------------------------------------------------');
        let totalPrice = 0;
        order.items.forEach(item => {
            const itemPrice = item.product.price * item.quantity;
            totalPrice += itemPrice;
            pdf.text(item.product.title + '                 ' + item.product.price + '                     ' + item.quantity + '            ' + itemPrice);
            pdf.text('------------------------------------------------------------------------------------');
        });
        pdf.text('------------------------------------------------------------------------------------');
        pdf.text(`Grand Total : $ ${totalPrice}`);
        pdf.text('------------------------------------------------------------------------------------');
        pdf.end(); // writable stream to write file in server and send response will be closed


    }).catch(err => {
        next(err);
    });

}