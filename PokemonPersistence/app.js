const express = require('express');
var cors = require('cors')
const axios = require('axios').default;

const app = express();
const port = 3000;

app.use(express.json())
app.use(cors());

app.use(express.static('./client/'))
const resultCache = new Map();

app.get('/queryForm', (req, res) => {
    res.sendFile("queryForm.html", {'root': './client'});
});

app.get('/cache', (req, res) => {
    console.log(resultCache);
    res.send("Cache");
});

app.get('/clearCache', (req, res) => {
    resultCache.clear();
    res.send("Cache cleared");
});

app.get('/pokemon', (req, res) => {
    let pkm = req.query.name;
    
    if (resultCache.has(pkm)) {
        console.log(pkm + " already saved in cache");
        res.send(resultCache.get(pkm));
        return;
    }

    let url = "https://pokeapi.co/api/v2/pokemon/" + pkm;

    axios.get(url)
    .then(response => {
        let pkmCompleteData = response.data;
        let pkmData = {
            'id': pkmCompleteData.id,
            'weight': pkmCompleteData.weight,
            'name': pkmCompleteData.name
        };
        resultCache.set(pkm, pkmData);
        console.log("New pokemon saved to cache: " + pkm);
        res.send(pkmData);
    }).catch(error => {
        res.status(404).send('Pokemon does not exist!')
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});