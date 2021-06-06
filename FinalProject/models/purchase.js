const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);

var purchaseSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    },
    products: [{
        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'products'
        },
        quantity: Number,
        price: Number,
    }]
});

module.exports = new mongoose.model('Purchase', purchaseSchema);