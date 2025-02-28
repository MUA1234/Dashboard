document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem("loggedIn") === "true") {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }
    loadStock();
    updateDashboard();
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

document.getElementById("product-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let stock = JSON.parse(localStorage.getItem("stock")) || [];

    const name = document.getElementById("product-name").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const quantity = parseInt(document.getElementById("product-quantity").value);
    const image = document.getElementById("product-image").files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        stock.push({
            name: name,
            price: price,
            quantity: quantity,
            previousQuantity: quantity,
            sales: 0,
            image: e.target.result
        });

        localStorage.setItem("stock", JSON.stringify(stock));
        loadProducts();
        updateDashboard();
        document.getElementById("product-form").reset();
    };

    if (image) {
        reader.readAsDataURL(image);
    } else {
        stock.push({ name, price, quantity, previousQuantity: quantity, sales: 0, image: "" });
        localStorage.setItem("stock", JSON.stringify(stock));
        loadProducts();
        updateDashboard();
        document.getElementById("product-form").reset();
    }
});


function loadStock() {
    const stockList = document.getElementById("stock-list");
    stockList.innerHTML = "";
    let stock = JSON.parse(localStorage.getItem("stock")) || [];

    stock.forEach((product, index) => {
        const stockItem = document.createElement("div");
        stockItem.classList.add("stock-item");
        stockItem.innerHTML = `
            <span>${product.name} - $${product.price}</span>
            <button class="stock-btn" onclick="updateQuantity(${index}, -1)">-</button>
            <span class="stock-count">${product.quantity}</span>
            <button class="stock-btn" onclick="updateQuantity(${index}, 1)">+</button>
            <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
        `;
        stockList.appendChild(stockItem);
    });

    const updateButton = document.createElement("button");
    updateButton.textContent = "Update Stock";
    updateButton.onclick = updateStock;
    updateButton.classList.add("update-btn");
    stockList.appendChild(updateButton);
}


function updateQuantity(index, amount) {
    let stock = JSON.parse(localStorage.getItem("stock"));
    if (amount < 0 && stock[index].quantity + amount >= 0) {
        stock[index].quantity += amount;
    } else if (amount > 0) {
        stock[index].quantity += amount; // Plus button changes should not affect final update
    }
    localStorage.setItem("stock", JSON.stringify(stock));
    loadStock();
}

function updateStock() {
    if (confirm("Are you sure you want to update stock and calculate sales?")) {
        let stock = JSON.parse(localStorage.getItem("stock")) || [];
        let totalSalesToday = 0;
        let itemsSoldToday = 0;

        stock.forEach(product => {
            let soldAmount = product.previousQuantity - product.quantity;
            if (soldAmount > 0) {
                product.sales += product.price * soldAmount;
                totalSalesToday += product.price * soldAmount;
                itemsSoldToday += soldAmount;
            }
            product.previousQuantity = product.quantity;
        });

        localStorage.setItem("stock", JSON.stringify(stock));
        localStorage.setItem("lastStockUpdate", new Date().toLocaleString());
        localStorage.setItem("salesToday", totalSalesToday);
        localStorage.setItem("itemsSoldToday", itemsSoldToday);

        loadStock();
        updateDashboard();
    }
}


function updateDashboard() {
    let stock = JSON.parse(localStorage.getItem("stock")) || [];
    let totalSales = stock.reduce((sum, product) => sum + product.sales, 0);
    let totalProducts = stock.length;
    let totalStock = stock.reduce((sum, product) => sum + product.quantity, 0);
    let lastUpdated = localStorage.getItem("lastStockUpdate") || "N/A";
    let totalSalesToday = localStorage.getItem("salesToday") || 0;
    let itemsSoldToday = localStorage.getItem("itemsSoldToday") || 0;

    document.getElementById("total-sales").textContent = `$${totalSales}`;
    document.getElementById("total-products").textContent = totalProducts;
    document.getElementById("total-stock").textContent = totalStock;
    document.getElementById("last-stock-update").textContent = lastUpdated;
    document.getElementById("total-sales-today").textContent = `$${totalSalesToday}`;
    document.getElementById("items-sold-today").textContent = itemsSoldToday;
}



function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        let stock = JSON.parse(localStorage.getItem("stock")) || [];
        stock.splice(index, 1);
        localStorage.setItem("stock", JSON.stringify(stock));
        loadProducts();
        updateDashboard();
    }
}


function loadSales() {
    const salesList = document.getElementById("sales-list");
    salesList.innerHTML = "";
    let stock = JSON.parse(localStorage.getItem("stock")) || [];

    stock.forEach((product, index) => {
        if (product.sales > 0) {
            const salesItem = document.createElement("div");
            salesItem.classList.add("sales-item");
            salesItem.innerHTML = `
                <img src="${product.image || 'placeholder.jpg'}" class="product-img">
                <span>${product.name} - Sold: ${product.previousQuantity - product.quantity} - Revenue: $${product.sales}</span>
                <button class="reset-btn" onclick="resetSales(${index})">Reset</button>
            `;
            salesList.appendChild(salesItem);
        }
    });
}

function resetSales(index) {
    let stock = JSON.parse(localStorage.getItem("stock")) || [];
    stock[index].sales = 0;
    localStorage.setItem("stock", JSON.stringify(stock));
    loadSales();
    updateDashboard();
}

function loadProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    let stock = JSON.parse(localStorage.getItem("stock")) || [];

    stock.forEach((product, index) => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");
        productItem.innerHTML = `
            <img src="${product.image || 'placeholder.jpg'}" class="product-img">
            <span>${product.name} - $${product.price} - Stock: ${product.quantity}</span>
            <button class="update-btn" onclick="editProduct(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
        `;
        productList.appendChild(productItem);
    });
}

function editProduct(index) {
    let stock = JSON.parse(localStorage.getItem("stock")) || [];
    let product = stock[index];

    document.getElementById("product-name").value = product.name;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-quantity").value = product.quantity;

    document.getElementById("product-form").onsubmit = function(event) {
        event.preventDefault();
        product.name = document.getElementById("product-name").value;
        product.price = parseFloat(document.getElementById("product-price").value);
        product.quantity = parseInt(document.getElementById("product-quantity").value);
        
        localStorage.setItem("stock", JSON.stringify(stock));
        loadProducts();
        updateDashboard();
        document.getElementById("product-form").reset();
        document.getElementById("product-form").onsubmit = addProduct;
    };
}



