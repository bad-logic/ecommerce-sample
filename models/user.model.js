// WITH ODM=> MONGOOSE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Order = require('./order.model');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    cart: {
        items: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    const user = this;
    // console.log("user>>", user);
    if (user.isModified('password')) {
        bcrypt.hash(user.password, 12).then(hashedPassword => {
            user.password = hashedPassword;
            // console.log("user>>", user);
            next();
        })
    } else {
        next();
    }
});


userSchema.statics.confirmCredentials = function(email, password) {
    let user = this;
    return new Promise((resolve, reject) => {
        this.findOne({ email: email }).then(user => {
            if (!user) {
                reject({ msg: 'no such email' });
            } else {
                bcrypt.compare(password, user.password)
                    // comparision succesfull , enter then block with boolean value
                    .then(doMatch => {
                        if (doMatch) {
                            resolve(user);
                        } else {
                            reject({ msg: 'Incorrect password' });
                        }
                    })
                    // comparision could not be done due to some error
                    .catch(err => {
                        // console.log("error>>", err);
                        reject({
                            status: 500,
                            msg: 'Internal server error'
                        });
                    });
            }
        });
    });

}


userSchema.methods.addToCart = function(product) {
    let updatedCart;
    // copying items of the  users cart to new variable 
    updatedCart = {...this.cart };
    // Returns >= 0 which is the index where the product is present in cart.items array
    //  and -1 if the Product is not available in the cart
    const available = updatedCart.items.findIndex(prod => {
        return prod.product.toString() == product._id.toString();
    });
    // console.log("available at index>>", available);
    // Product already exists increase quantity
    if (available >= 0) {
        updatedCart.items[available].quantity += 1;
    }
    // Product is new to the cart 
    else {
        updatedCart.items.push({ product: product._id, quantity: 1 });
    }
    this.cart = updatedCart;
    // console.log("Cart>>", updatedCart);
    return this.save();
}

userSchema.methods.deleteCartItem = function(id) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.product.toString() !== id.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.addOrder = function() {
    return this.populate('cart.items.product')
        .execPopulate()
        .then(user => {
            const orderItems = user.cart.items.map(item => {
                return {
                    product: {...item.product._doc },
                    quantity: item.quantity
                }
            });
            // console.log("items to be ordered>>", orderItems);
            const order = new Order({
                items: orderItems,
                user: {
                    userId: this._id,
                    userEmail: this.email
                }
            });
            // console.log("order created>>", order);
            return order.save();
        })
        .then(order => {
            return this.clearCart();
        })
}

userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
}

userSchema.methods.getOrder = function() {
    return Order.find({ 'user.userId': this._id });
}

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;





// WITHOUT USING ODM=> MONGOOSE
// const { getDb } = require('./../util/db_conn');
// const mongodb = require('mongodb');

// const User = class {
//     constructor(user) {
//         this.name = user.name;
//         this.email = user.email;
//         this.cart = user.cart;
//         this._id = user._id ? new mongodb.ObjectID(user._id) : user._id;
//     }

//     save() {
//         const dbConn = getDb();
//         return dbConn.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const dbConn = getDb();
//         let updatedCart;
//         // cart not created
//         if (!this.cart || !this.cart.items) {
//             updatedCart = { items: [{ productId: new mongodb.ObjectID(product._id), quantity: 1 }] };
//         }
//         // cart already exists 
//         else {

//             // copying items of the  users cart to new variable 
//             updatedCart = {...this.cart };

//             // Returns >= 0 which is the index where the product is present in cart.items array
//             //  and -1 if the Product is not available in the cart
//             const available = updatedCart.items.findIndex(prod => {
//                 return prod.productId.toString() == product._id.toString();
//             });
//             console.log("available at index>>", available);
//             // Product already exists increase quantity
//             if (available >= 0) {
//                 updatedCart.items[available].quantity += 1;
//             }
//             // Product is new to the cart 
//             else {
//                 updatedCart.items.push({ productId: new mongodb.ObjectID(product._id), quantity: 1 });
//             }
//         }
//         console.log("Cart>>", updatedCart);
//         return dbConn.collection('users').updateOne({ _id: this._id }, {
//             $set: {
//                 cart: updatedCart
//             }
//         });
//     }

//     getCart() {
//         const dbConn = getDb();
//         const prodIds = this.cart.items.map(p => p.productId);
//         console.log("product ids>>", prodIds);
//         return dbConn.collection('products').find({ _id: { $in: prodIds } }).toArray().then(products => {
//             return products.map(p => {
//                 return {...p,
//                     quantity: this.cart.items.find(i => {
//                         return p._id.toString() === i.productId.toString();
//                     }).quantity
//                 };
//             });
//         });
//     }

//     deleteCartItem(id) {
//         const dbConn = getDb();
//         const updatedCart = this.cart.items.filter(item => {
//             return item.productId.toString() !== id.toString();
//         });
//         console.log("cart item deleted>>", updatedCart);
//         return dbConn.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: updatedCart } } });

//     }

//     addOrder() {
//         const dbConn = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectID(this._id)
//                     }
//                 }
//                 return dbConn.collection('orders').insertOne(order)
//             })
//             .then(result => {
//                 // clearing the cart after order has been placed
//                 return dbConn.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
//             });
//     }

//     getOrder() {
//         const dbConn = getDb();
//         return dbConn
//             .collection('orders')
//             .find({ 'user._id': new mongodb.ObjectID(this._id) })
//             .toArray();
//     }

//     static findById(id) {
//         const dbConn = getDb();
//         return dbConn.collection('users').findOne({ _id: new mongodb.ObjectID(id) });
//     }
// }

// module.exports = User;