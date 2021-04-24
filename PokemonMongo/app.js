const express = require('express');
var cors = require('cors')
const axios = require('axios').default;

const app = express();
const port = 3000;
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

app.use(express.json())
app.use(cors());
app.use(express.static('./client/'));

// SCHEMA
const pokemonSchema = new mongoose.Schema({
    pkmId: {type: Number, unique:true, required: true},
    name: {type: String, required: true},
    weight: {type: Number, required: true}
});

// CONNECT
const uri = "mongodb+srv://webapp:labs@cluster0.ud4pu.mongodb.net/WebClass?retryWrites=true&w=majority";
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true });

var db = mongoose.connection;
const resultCache = new Map();

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to database server');
    initializeModel();
});

function initializeModel(){
    console.log("Initializing the model")
    pkmModel = mongoose.model('Pokemon', pokemonSchema);
}

// Read all
app.route('/cache').get(async function(req, res){    
    let allPkms = await pkmModel.find();
    res.send(allPkms);
});

// Delete all
app.route('/clearCache').get(async function(req, res){    
    await pkmModel.deleteMany({});
    res.send("Cleared");
});

app.get('/queryForm', (req, res) => {
    res.sendFile("queryForm.html", {'root': './client'});
});

app.route('/pokemon').get(async function(req, res) { 
    let pkmName = req.query.name;

    let pkm = await pkmModel.findOne({name: pkmName});
    
    if (pkm) {
        console.log(pkmName + " already saved in cache");
        res.send(pkm);
        return;
    } else {
        let url = "https://pokeapi.co/api/v2/pokemon/" + pkmName;

        axios.get(url)
        .then(response => {
            let pkmData = response.data;
            console.log("Saving new pokemon: " + pkmData.name)
            let pkm = new pkmModel({pkmId: pkmData.id, name: pkmData.name, weight: pkmData.weight});

            pkm.save((err) => {
                if (err) res.status(503).send(`error: ${err}`); 
                else {
                    res.send(pkm);
                }
            });
        }).catch(error => {
            console.log(error);
            res.status(404).send('Pokemon does not exist!');
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});