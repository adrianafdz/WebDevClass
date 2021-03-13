var cardArea = document.getElementById("card-area");
var temp = document.querySelector("template");
var btnAdd = document.getElementById("add");
var pkmName = document.getElementById("pkmName");
var pkmInfo;

var alerta = document.getElementById("alerta");

btnAdd.addEventListener('click', (event) => {
    alerta.style.display = 'none';

    let name = pkmName.value.trim();

    if ( name == "") {
        alerta.innerText="You must write a name";
        alerta.style.display = '';
    } else {
        addPokemon(name);
    }
});

function addPokemon(name) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + name
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function() {
        if(xhr.status == 200) {
            pkmInfo = JSON.parse(xhr.responseText);
            addCard();
        } else {
            // alert
            alerta.innerText="That Pokemon does not exist.";
            alerta.style.display = '';
            console.log("Something went wrong. Error " + xhr.status);
        }
    }

    xhr.send();
}

function deleteCard(id) {
    let card = document.getElementById(id);
    cardArea.removeChild(card);
}

function addCard() {
    let id = pkmInfo.id;
    let clone = temp.content.cloneNode(true);
    clone.querySelector('div').id = id;

    // delete button
    let card = clone.querySelector('.card');
    
    // Card Image
    let imgurl = "https://pokeres.bastionbot.org/images/pokemon/" + id + ".png";
    let img = card.querySelector('img');
    img.src = imgurl;

    // Card heading (pokemon name)
    let cardbody = card.querySelector('.card-body');
    let name = card.querySelector('.card-header');
    name.innerText = pkmInfo.name;

    name.addEventListener('click', (event) => {
        deleteCard(id);
    })

    // Abilities
    let abilitiesDiv = document.createElement('div');
    let abilitiesHead = document.createElement('h6').appendChild(document.createTextNode('Abilities'));
    abilitiesDiv.appendChild(abilitiesHead);
    cardbody.appendChild(abilitiesDiv);

    let abilitiesList = document.createElement('ul');
    cardbody.appendChild(abilitiesList);

    let abilities = pkmInfo.abilities;

    for (let i = 0; i < abilities.length && i <= 3; i++) {

        let item = document.createElement('li');
        item.appendChild(document.createTextNode(abilities[i].ability.name));
        abilitiesList.appendChild(item);

    } 

    // Moves
    let movesDiv = document.createElement('div');
    let movesHead = document.createElement('h6').appendChild(document.createTextNode('Moves'));
    movesDiv.appendChild(movesHead);
    cardbody.appendChild(movesDiv);

    let movesList = document.createElement('ul');
    cardbody.appendChild(movesList);

    var moves = pkmInfo.moves;

    for (let i = 0; i < moves.length && i <= 3; i++) {

        let item = document.createElement('li');
        item.appendChild(document.createTextNode(moves[i].move.name));
        movesList.appendChild(item);

    }

    pkmName.value ="";
    cardArea.appendChild(clone);
}
