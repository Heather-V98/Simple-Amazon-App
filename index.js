// ---------- Classes ----------
class Product {
    constructor(id, name, price) {
      this.id = id;
      this.name = name;
      this.price = price;
    }
  }
  
  class Cart {
    constructor() {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
    }
  
    addItem(product) {
      const existing = this.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.save();
    }
  
    getTotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  
    save() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    }
  }
  
  class Header {
    constructor(cart) {
      this.cart = cart;
    }
  
    render() {
      return `
        <header>
          <a id="logo">Amazon Clone</a>
          <nav>
            <a id="nav-products">Products</a>
            <a id="nav-checkout">Cart 
              <span class="cart-count">${this.cart.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </a>
          </nav>
        </header>
      `;
    }
  }
  
  class Checkout {
    constructor(cart) {
      this.cart = cart;
    }
  
    render() {
      const container = document.getElementById("cart-items");
      if (!container) return;
  
      container.innerHTML = this.cart.items.map(item => `
        <div class="cart-item">
          <span>${item.name} (x${item.quantity})</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join("");
  
      document.getElementById("total-price").textContent = this.cart.getTotal().toFixed(2);
    }
  }
  
  // ---------- Data ----------
  const products = [
    new Product(1, "Laptop", 999.99),
    new Product(2, "Smartphone", 699.99),
    new Product(3, "Headphones", 199.99),
    new Product(4, "Smartwatch", 149.99),
    new Product(5, "Backpack", 79.99),
    new Product(6, "Bluetooth Speaker", 49.99)
  ];
  
  // ---------- Main App Logic ----------
  const cart = new Cart();
  
  // Render Header
  document.getElementById("header").innerHTML = new Header(cart).render();
  
  // Handle Navigation
  function showPage(page) {
    document.getElementById("products-page").style.display = page === "products" ? "block" : "none";
    document.getElementById("checkout-page").style.display = page === "checkout" ? "block" : "none";
    if (page === "checkout") {
      const checkout = new Checkout(cart);
      checkout.render();
    }
  }
  
  document.getElementById("header").addEventListener("click", e => {
    if (e.target.id === "nav-products" || e.target.id === "logo") {
      showPage("products");
    }
    if (e.target.id === "nav-checkout") {
      showPage("checkout");
    }
  });
  
  // Products Page Logic
  const list = document.getElementById("product-list");
  
  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button data-id="${product.id}">Add to Cart</button>
    `;
    list.appendChild(div);
  });
  
  list.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      const id = parseInt(e.target.dataset.id);
      const product = products.find(p => p.id === id);
      cart.addItem(product);
      document.getElementById("header").innerHTML = new Header(cart).render();
    }
  });
  
  // Default to Products Page
  showPage("products");
  
  