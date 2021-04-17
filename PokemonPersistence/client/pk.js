var cardArea = document.getElementById("card-area");
var temp = document.querySelector("template");
var btnAdd = document.getElementById("add");
var pkmName = document.getElementById("pkmName");
var pkmInfo;
var weightSpan = document.getElementById("weight");
var totalWeight = {"total" : 0};

var alerta = document.getElementById("alerta");

btnAdd.addEventListener('click', (event) => {
    alerta.style.display = 'none';

    let name = pkmName.value.trim().toLowerCase();

    if ( name == "") {
        alerta.innerText="You must write a name";
        alerta.style.display = '';
    } else {
        addPokemon(name);
    }
});

function addPokemon(name) {
    let url = "http://localhost:3000/pokemon?name=" + name;
    // let url = "https://pokeapi.co/api/v2/pokemon/" + name
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function() {
        if(xhr.status == 200) {
            console.log(xhr.responseText);
            pkmInfo = JSON.parse(xhr.responseText);
            addCard();
        } else {
            // alert
            alerta.innerText="That Pokemon does not exist.";
            alerta.style.display = '';
            console.log("Pokemon not found. Error " + xhr.status);
        }
    }
 
    xhr.onerror = function() {
        alerta.innerText="Connection failed. Something is wrong with the server.";
        alerta.style.display = '';
    } 

    xhr.send();
}

function deleteCard(id) {
    let card = document.getElementById(id);
    cardArea.removeChild(card);

    totalWeight["total"] -= totalWeight[id];
    delete totalWeight[id];
    weightSpan.innerText = totalWeight["total"];
}

function addCard() {
    // console.log(pkmInfo);
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

    // Weight
    let w = pkmInfo.weight;
    totalWeight["total"] += w;
    totalWeight[id] = w;
    weightSpan.innerText = totalWeight["total"];

    let weightDiv = document.createElement('div');
    let weigthP = document.createElement('p');
    weigthP.appendChild(document.createTextNode("Weight: " + w));
    weightDiv.appendChild(weigthP);
    cardbody.appendChild(weightDiv);

    pkmName.value ="";
    cardArea.appendChild(clone);
}
