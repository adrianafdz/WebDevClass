var btnAdd = document.getElementById('add');
var tblProducts = document.getElementById('productlist').tBodies[0];
var product = document.getElementById('product');
var price = document.getElementById('price');
var tdTotal = document.getElementById('total');
var trTotal = document.getElementById('totalrow');
var cart = {"total" : 0};


function addRow(prod, pr) {

    if ( !isNaN(pr) ) {
        let row = document.createElement("tr");

        let tdProduct = document.createElement("td");
        tdProduct.appendChild(document.createTextNode(prod));

        let tdPrice = document.createElement("td");
        tdPrice.appendChild(document.createTextNode(pr.toFixed(2)));

        let tdDelBtn = document.createElement("button");
        tdDelBtn.appendChild(document.createTextNode("Delete"));
        tdDelBtn.className = "btn";
        tdDelBtn.className += " btn-outline-danger";
        tdDelBtn.className += " btnDelete";
        tdDelBtn.addEventListener("click", deleteProduct);

        row.appendChild(tdProduct);
        row.appendChild(tdPrice);
        row.appendChild(tdDelBtn);

        tblProducts.insertBefore(row, trTotal);
        tdTotal.innerText = "$ " + cart["total"].toFixed(2);
    } else {
        alert("Could not add element");
    }

}

btnAdd.addEventListener("click", (event)=>{
    if ( product.value == "" || price.value == "" ) {
        alert("All fields should be filled.");
    } else if ( isNaN(price.value) ) {
        alert("Price must be a number.");
    } else {
        let p = parseFloat(price.value);
        cart["total"] += p;
        cart[product.value] = parseFloat(price.value);

        addRow(product.value, p);

        product.value="";
        price.value="";
    }
});

function deleteProduct(event) {
    let row = event.target.closest("tr");
    let name = row.childNodes[0].innerText;
    if ( confirm(`Are you sure you want to delete ${name}?`) ) {
        tblProducts.removeChild(row);
        cart["total"] -= parseFloat(row.childNodes[1].innerText);
        tdTotal.innerText = "$ " + cart["total"].toFixed(2);

        delete cart[name];
    }
}