const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors());
const fs = require('fs');
const path = require('path');
const multer = require('multer')
app.use(express.static('./views'));

const uri = "mongodb+srv://webapp:labs@cluster0.ud4pu.mongodb.net/WebClass?retryWrites=true&w=majority";
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to database server');
});

const productModel = require("./models/product");
const userModel = require("./models/user");
const purchaseModel = require("./models/purchase");

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage});

function generateToken(user) {
    let payload = {
     name: user.name,
     id: user._id,
     role: user.role,
     email: user.email
    };
    let oneDay = 60 * 60 * 24;
    return token = jwt.sign(payload, secret, { expiresIn: oneDay });
}

const secret = "5tr0n6P@55W0rD";

// middleware that add the user
function requireLogin(req, res, next){
    let accessToken = req.cookies.authorization;

    if (!accessToken){ 
        console.log('Unauthorized user, redirecting to login'); 
        return res.redirect('/login'); 
    }

    try{
        payload = jwt.verify(accessToken, secret);
        req.user = payload;
        next()
    }
    catch(e){
        res.redirect(403, '/login');
    }
}

/**************** VIEWS ****************/
// SHOW SIGN UP PAGE
app.route('/signup').get((req,res) => {
    res.sendFile('signup.html', {root: './views/'});
});

// SHOW LOG IN PAGE
app.get('/login', function (req, res) {
    res.sendFile('login.html', {root: './views/'});
});

// SHOW EDIT USER PAGE
app.get('/user/:id/edit', requireLogin, function (req, res) {
    let id = req.params.id;

    if (req.user.id == id) {
        ejs.renderFile("./views/edit-user.html", {user: req.user}, null, function(error, str){
            if (error) res.status(503).send(`error when rendering the view: ${error}`); 
            else {
                res.end(str);
            }
        });
    } else {
        res.status(503).end("Cannot access page.");
    }
});

// SHOW PRODUCTS PAGE
app.get('/products/all', requireLogin, function (req, res) {
    res.sendFile('products.html', {root: './views/'});
});

// SHOW MAIN PAGE
app.get('/', requireLogin, function (req, res) {
    if (req.user.role == "client") {
        ejs.renderFile('./views/cart.html', {user: req.user}, null, function(err, str){
            if (err) res.status(503).send(`error when rendering the view: ${err}`); 
            else {
                res.end(str);
            }
        });
    } else if (req.user.role == "admin") {
        ejs.renderFile('./views/products.html', {user: req.user}, null, function(err, str){
            if (err) res.status(503).send(`error when rendering the view: ${err}`); 
            else {
                res.end(str);
            }
        });
    }
});

// SHOW ADD PRODUCT PAGE
app.get('/products/add', requireLogin, function (req, res) {
    ejs.renderFile('./views/insert.html', {user: req.user}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });
});

// SHOW EDIT PRODUCT PAGE
app.get('/products/:id/edit', requireLogin, function (req, res) {
    let id = req.params.id;
    ejs.renderFile("./views/edit.html", {productId: id, user: req.user}, null, function(error, str){
        if (error) res.status(503).send(`error when rendering the view: ${error}`); 
        else {
            res.end(str);
        }
    });
});

/*********** USERS  ************/
// LOG IN
app.route('/login').post(async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email: email
    });
    
    if (user) {
        bcrypt.compare(password, user.password, function(err, success) {
            if (success) {
                const accessToken = generateToken(user);
                res.cookie("authorization", accessToken, {secure: true, httpOnly: true});
                res.status(200).json(accessToken);
            } else {
                res.status(403).send('Invalid credentials');
            }
        });
    } else {
        res.status(403).send('Invalid credentials');
    }
});

// REGISTRATION / CREATE USER
app.post('/signup', upload.single('avatar'), (req, res) => {
    let name = req.body.name;
    let pswd = req.body.password;
    let mail = req.body.email;

    let avatarObject = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: 'image/jpg'
    };

    let u = new userModel({
        name: name,
        avatar: avatarObject,
        email: mail,
        password: pswd
    });

    u.save((error) => {
        if (error) {
            console.log(error);
            res.status(503).send(`Could not create account: ${error}`);
        } 
        else {
            res.send(u);
        }
    });
});

// LOG OUT
app.post('/logout', requireLogin, function(req, res){
    console.log(`Logging out ${req.user.name}`)
    res.clearCookie('authorization');
    res.send('User logged out');
});

// GET ONE USER
app.get('/user/:id', requireLogin, async function(req, res){
    let id = req.params.id;
    let profile = await userModel.findOne({_id: id});

    if (profile) {
        let user = {
            id: profile._id,
            name: profile.name,
            avatar: {
                contentType: profile.avatar.contentType,
                data: profile.avatar.data.toString('base64')
            },
            email: profile.email
        }
        res.send(user);
    } else {
        res.status(404).end("Cannot find user");
    }
});

// EDIT USER
app.put('/user/:id', requireLogin, upload.single('avatar'), async function (req, res) {
    let id = req.params.id;

    if (id !== req.user.id) {
        res.status(503).end(`Access denied`); 
    } else {
        let profile = await userModel.findOne({_id: id});

        if (profile) {
            profile.name = req.body.name;
            profile.email = req.body.email;

            if (req.file) {
                let avatarObject = {
                    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                    contentType: 'image/jpg'
                };
                profile.avatar = avatarObject;
            }

            if (req.body.password) {
                profile.password = req.body.password;
            }

            profile.save()
                .then(u => {
                    res.clearCookie('authorization');
                    const accessToken = generateToken(profile);
                    res.cookie("authorization", accessToken, {secure: true, httpOnly: true});
                    res.send(u);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(503).send(`Could not edit profile: ${error}`);
                });
        } else {
            res.status(404).send(`Could not find user: ${error}`);
        }
    }
});

// DELETE USER
app.delete('/user/:id', requireLogin, function(req, res) {
    let id = req.params.id;

    if (id !== req.user.id) {
        res.status(503).end(`Access denied.`); 
    } else {
        userModel.findOneAndDelete({_id: id})
        .then(u => {
            res.send(u);
        })
        .catch(error => {
            console.log(error)
            res.status(503).end(`Could not delete profile.`);
        })
    }
});

// GET AVATAR
app.get('/avatar/:id', requireLogin, async function(req, res) {
    let id = req.params.id;
    let profile = await userModel.findOne({_id: id});

    if (profile) {
        let avatar = {
                contentType: profile.avatar.contentType,
                data: profile.avatar.data.toString('base64')
            };
        res.send(avatar);
    } else {
        res.status(404).end("Cannot find user");
    }
})

/*********** PRODUCTS  ************/
// READ ALL PRODUCTS
app.get('/allproducts', requireLogin, async (req, res) => {
    let allProducts = await productModel.find({});
    res.send(allProducts);
});

// READ MANY PRODUCTS (SEARCH) 
app.get('/search', requireLogin, async (req, res) => {
    let name = req.query.name;
    let allProducts = await productModel.find({name: { $regex: '.*' + name + '.*' } });
    res.send(allProducts);
});

// READ ONE PRODUCT
app.get('/products/:id', requireLogin, async (req, res) => {
    let id = req.params.id;
    let product = await productModel.findOne({_id: id});
    
    if (product) {
        res.send(product);
    } else {
        res.status(404).end(`Product with id ${id} does not exist`)
    }
});

// CREATE PRODUCT
app.post('/products', requireLogin, (req, res) => {
    let name = req.body.name;
    let brand = req.body.brand;
    let price = req.body.price;

    let product = new productModel();

    product.name = name;
    product.price = price;

    if (brand) {
        product.brand = brand;
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
app.put('/products/:id', requireLogin, async (req, res) => {
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
app.delete('/products/:id', requireLogin, async (req, res) => {
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

/************** PURCHASE ***********/
app.post('/cart', requireLogin, function (req, res) {
    let purchase = new purchaseModel({
        client_id: req.body.client,
        products: req.body.products
    });

    purchase.save((error) => {
        if (error) {
            res.status(503).send("Could not save. Error: " + error);
        } else {
            res.status(200).send("Purchase successfull");
        }
    });
});

app.listen(port, () => {
    console.log('Server up and running on http://127.0.0.1:3000/');
});