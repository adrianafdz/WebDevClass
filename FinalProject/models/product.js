const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);

var productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    brand: String
});

module.exports = new mongoose.model('Product', productSchema);