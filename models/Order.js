const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        title: String,
        artist: String,
        price: Number,
        coverImage: String
    }],
    totalAmount: { type: Number, required: true },
    billing: {
        cardName: { type: String, required: true },
        maskedCard: { type: String, required: true }, // Ej: '**** **** **** 4444'
        address: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);