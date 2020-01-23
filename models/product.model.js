// WITH ODM => MONGOOSE

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

const ProductModel = mongoose.model('product', productSchema);
module.exports = ProductModel;



// WITHOUT ODM=>MONGOOSE

// const mongodb = require('mongodb');
// const { getDb } = require('./../util/db_conn');

// const Product = class {
//     constructor(body) {
//         this.title = body.title;
//         this.price = body.price;
//         this.description = body.description;
//         this.imageUrl = body.imageUrl;
//         this.userId = new mongodb.ObjectID(body.userId);
//         // if no id in body new data so id = undefined and mongo db will autogenerate it
//         // if (body.id) {
//         //     this._id = new mongodb.ObjectID(body.id);
//         // } else {
//         //     this._id = body.id;
//         // }
//         this._id = body.id ? new mongodb.ObjectID(body.id) : body.id;
//     }

//     save() {
//         const db = getDb();
//         if (this._id) {
//             // update the data
//             return db.collection('products')
//                 .updateOne({ _id: this._id }, { $set: this });
//         } else {
//             return db.collection('products')
//                 .insertOne(this);
//         }
//     }

//     static findAll() {
//         const db = getDb();
//         return db.collection('products').find().toArray();
//     }

//     static deleteById(id) {
//         const db = getDb();
//         return db.collection('products').deleteOne({ _id: new mongodb.ObjectID(id) });
//     }

//     static findById(id) {
//         const db = getDb();
//         return db.collection('products').find({ _id: new mongodb.ObjectID(id) }).next();
//     }
// }

// module.exports = Product;