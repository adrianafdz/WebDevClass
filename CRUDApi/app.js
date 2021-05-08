const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const ejs = require('ejs');
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.static('./views'));

const uri = "mongodb+srv://webapp:labs@cluster0.ud4pu.mongodb.net/WebClass?retryWrites=true&w=majority";
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to database server');
});

const productModel = require("./models");

// SHOW VIEW PAGES
app.route('/products/all').get((req, res) => {
    res.sendFile('products.html', {root: './views/'});
});

app.route('/products/add').get((req, res) => {
    res.sendFile('insert.html', {root: './views/'});
});

app.route('/products/:id/edit').get((req, res) => {
    let id = req.params.id;
    ejs.renderFile("./views/edit.html", {productId: id}, null, function(error, str){
        if (error) res.status(503).send(`error when rendering the view: ${error}`); 
        else {
            res.end(str);
        }
    });
});

// READ ALL PRODUCTS
app.route('/products').get(async (req, res) => {
    let allProducts = await productModel.find({});
    res.send(allProducts);
});

// READ ONE PRODUCT
app.route('/products/:id').get(async (req, res) => {
    let id = req.params.id;
    let product = await productModel.findOne({_id: id});
    
    if (product) {
        res.send(product);
    } else {
        res.status(404).end(`Product with id ${id} does not exist`)
    }
});

// CREATE PRODUCT
app.post('/products', (req, res) => {
    let name = req.body.name;
    let brand = req.body.brand;
    let price = req.body.price;

    let product = new productModel();

    if (brand) {
        product.name = name;
        product.brand = brand;
        product.price = price;
    } else {
        product.name = name;
        product.price = price;
    }

    product.save((error) => {
        if (error) {
            res.status(503).send(`Could not save: ${error}`);
        } 
        else {
            res.send(product);
        }
    });
});

// UPDATE PRODUCT
app.put('/products/:id', async (req, res) => {
    let id = req.params.id;
    let product = await productModel.findOne({_id: id});

    product.name = req.body.name;
    product.brand = req.body.brand;
    product.price = req.body.price;

    product.save()
    .then(product => {
        res.send(product);
    })
    .catch((error) => {
        console.log(error);
        res.status(503).end(`Could not edit product.`);
    });
});

// DELETE PRODUCT
app.route('/products/:id').delete(async (req, res) => {
    let id = req.params.id;

    productModel.findOneAndDelete({_id: id})
    .then(product => {
        res.send(product);
    })
    .catch(error => {
        console.log(error);
        res.status(503).end(`Could not delete product.`);
    })
});


app.listen(port, () => {
    console.log('Server up and running');
});