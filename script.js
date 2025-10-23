// === Data Classes ===
class Product {
  constructor(id, name, price, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
  }
}

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("cart")) || [];
  }

  save() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
  }

  updateQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.qty = qty;
      if (qty <= 0) this.items = this.items.filter(i => i.id !== id);
      this.save();
    }
  }

  get totalItems() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }

  get totalPrice() {
    return this.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  }
}

class Header {
  constructor(cart) {
    this.cart = cart;
  }

  render(onNavigate) {
    return `
      <header class="app-header">
        <div class="brand" id="home-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" height="30" />
          <h1>Mini Amazon</h1>
        </div>
        <div class="cart-btn" id="cart-btn">
          🛒 Cart 
          <div class="cart-count">${this.cart.totalItems}</div>
        </div>
      </header>
    `;
  }

  attach(onNavigate) {
    document.getElementById("cart-btn").addEventListener("click", () => onNavigate("checkout"));
    document.getElementById("home-btn").addEventListener("click", () => onNavigate("products"));
  }

  updateCount() {
    document.querySelector(".cart-count").textContent = this.cart.totalItems;
  }
}

// === Pages ===
class ProductPage {
  constructor(cart, header) {
    this.cart = cart;
    this.header = header;
    this.products = [
        new Product(1, "Wireless Mouse", 14.99, "https://m.media-amazon.com/images/I/61LtuGzXeaL._AC_SL1500_.jpg"),
        new Product(2, "Bluetooth Headphones", 39.99, "https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg"),
        new Product(3, "Mechanical Keyboard", 59.99, "./images/mechanicalkeyboard.jpg"),
        new Product(4, "Smartwatch",         89.99, "./images/smartwatch.jpg")        
      ];
  }

  render() {
    const container = document.getElementById("view");
    container.innerHTML = `
      <div class="products-grid">
        ${this.products.map(p => `
          <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-info">
              <h3>${p.name}</h3>
              <p>$${p.price.toFixed(2)}</p>
              <button data-id="${p.id}">Add to Cart</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    container.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = parseInt(e.target.dataset.id);
        const product = this.products.find(p => p.id === id);
        this.cart.add(product);
        this.header.updateCount();
      });
    });
  }
}

class CheckoutPage {
  constructor(cart, header) {
    this.cart = cart;
    this.header = header;
  }

  render() {
    const container = document.getElementById("view");

    if (this.cart.items.length === 0) {
      container.innerHTML = `<div class="checkout-container empty-cart">Your cart is empty.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="checkout-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${this.cart.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                  <input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="qty-input" style="width:50px;">
                </td>
                <td>$${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="total">Total: $${this.cart.totalPrice.toFixed(2)}</div>
      </div>
    `;

    // quantity change
    container.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("change", e => {
        const id = parseInt(e.target.dataset.id);
        const newQty = parseInt(e.target.value);
        this.cart.updateQty(id, newQty);
        this.header.updateCount();
        this.render();
      });
    });
  }
}

// === App Setup ===
const cart = new Cart();
const header = new Header(cart);

function navigate(page) {
  document.getElementById("app-header").innerHTML = header.render(navigate);
  header.attach(navigate);
  if (page === "checkout") new CheckoutPage(cart, header).render();
  else new ProductPage(cart, header).render();
}

navigate("products");

  
  