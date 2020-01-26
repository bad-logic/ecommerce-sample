const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({

    items: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        userEmail: {
            type: String,
            required: true
        }
    }

}, { timestamps: true });

const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;