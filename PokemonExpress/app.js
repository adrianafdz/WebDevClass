const express = require('express');
var cors = require('cors')
const axios = require('axios').default;

const app = express();
const port = 3000;

app.use(cors());

app.get('/pokemon', (req, res) => {
    let pkm = req.query.name;
    let url = "https://pokeapi.co/api/v2/pokemon/" + pkm;

    axios.get(url)
    .then(response => {
        let pkmCompleteData = response.data;
        let pkmData = {
            'id': pkmCompleteData.id,
            'weight': pkmCompleteData.weight,
            'name': pkmCompleteData.name
        };
        res.send(pkmData);
    }).catch(error => {
        res.status(404).send('Pokemon does not exist!')
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});