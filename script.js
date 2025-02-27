document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem("loggedIn") === "true") {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }
    loadStock();
});

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "MUA" && password === "MUA1234") {
        sessionStorage.setItem("loggedIn", "true");
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        alert("Invalid Credentials");
    }
}

function logout() {
    sessionStorage.removeItem("loggedIn");
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-container").style.display = "block";
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(div => div.style.display = "none");
    document.getElementById(page).style.display = "block";
}

function addProductForm() {
    const formHtml = `
        <div id="product-form" class="popup-form">
            <h3>Add New Product</h3>
            <input type="text" id="product-name" placeholder="Product Name">
            <input type="number" id="product-price" placeholder="Product Price">
            <button onclick="addProduct()">OK</button>
            <button onclick="closeProductForm()">Cancel</button>
        </div>`;
    document.body.insertAdjacentHTML("beforeend", formHtml);
}

function closeProductForm() {
    document.getElementById("product-form").remove();
}

function addProduct() {
    const name = document.getElementById("product-name").value;
    const price = document.getElementById("product-price").value;
    if (name && price) {
        const product = { name, price, quantity: 0, sales: 0, previousQuantity: 0 };
        let stock = JSON.parse(localStorage.getItem("stock")) || [];
        stock.push(product);
        localStorage.setItem("stock", JSON.stringify(stock));
        closeProductForm();
        loadStock();
    } else {
        alert("Please enter both product name and price.");
    }
}

function loadStock() {
    const stockList = document.getElementById("stock-list");
    const salesList = document.getElementById("sales-list");
    const itemsList = document.getElementById("items-list");
    stockList.innerHTML = "";
    salesList.innerHTML = "";
    itemsList.innerHTML = "";
    let stock = JSON.parse(localStorage.getItem("stock")) || [];
    stock.forEach((product, index) => {
        const stockItem = document.createElement("li");
        stockItem.innerHTML = `
            ${product.name} - $${product.price} 
            <button onclick="updateQuantity(${index}, -1)">-</button>
            <span>${product.quantity}</span>
            <button onclick="updateQuantity(${index}, 1)">+</button>
            <button onclick="deleteProduct(${index})">Delete</button>
        `;
        stockList.appendChild(stockItem);

        const salesItem = document.createElement("li");
        salesItem.innerHTML = `
            ${product.name} - Sales: $${product.sales}
            <button onclick="resetSales(${index})">Reset</button>
        `;
        salesList.appendChild(salesItem);

        const itemItem = document.createElement("li");
        itemItem.innerHTML = `
            ${product.name} - $${product.price} 
            <button onclick="deleteProduct(${index})">Delete</button>
        `;
        itemsList.appendChild(itemItem);
    });
    
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update Stock";
    updateButton.onclick = updateStock;
    stockList.appendChild(updateButton);
}

function updateQuantity(index, amount) {
    let stock = JSON.parse(localStorage.getItem("stock"));
    if (stock[index].quantity + amount >= 0) {
        stock[index].quantity += amount;
    }
    localStorage.setItem("stock", JSON.stringify(stock));
    loadStock();
}

function updateStock() {
    if (confirm("Are you sure you want to update stock and calculate sales?")) {
        let stock = JSON.parse(localStorage.getItem("stock"));
        stock.forEach(product => {
            if (product.quantity < product.previousQuantity) {
                let soldAmount = product.previousQuantity - product.quantity;
                product.sales += product.price * soldAmount;
            }
            product.previousQuantity = product.quantity;
        });
        localStorage.setItem("stock", JSON.stringify(stock));
        loadStock();
    }
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        let stock = JSON.parse(localStorage.getItem("stock"));
        stock.splice(index, 1);
        localStorage.setItem("stock", JSON.stringify(stock));
        loadStock();
    }
}

function resetSales(index) {
    if (confirm("Are you sure you want to reset sales for this product?")) {
        let stock = JSON.parse(localStorage.getItem("stock"));
        stock[index].sales = 0;
        localStorage.setItem("stock", JSON.stringify(stock));
        loadStock();
    }
}