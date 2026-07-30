import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/client.js";

// --- CART STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem("nyrazi_cart") || "[]");

export function saveCart() {
  localStorage.setItem("nyrazi_cart", JSON.stringify(cart));
  updateCartUI();
}

export function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  //openCart();
}

export function updateQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    saveCart();
  }
}

export function updateCartUI() {
  const badge = document.getElementById("cart-count-badge");
  const container = document.getElementById("cart-items-container");
  const totalEl = document.getElementById("cart-total-price");

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (badge) badge.innerText = totalCount;
  if (totalEl) totalEl.innerText = `৳${totalPrice}`;

  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 py-10">Your cart is empty.</p>`;
    } else {
      container.innerHTML = cart
        .map(
          (item) => `
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-3">
            <img src="${item.image || 'https://via.placeholder.com/60'}" class="w-12 h-12 object-cover rounded" />
            <div>
              <h4 class="font-semibold text-sm">${item.name}</h4>
              <p class="text-blue-600 text-xs font-bold">৳${item.price}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button data-id="${item.id}" data-action="minus" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold">-</button>
            <span class="text-sm font-semibold">${item.quantity}</span>
            <button data-id="${item.id}" data-action="plus" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold">+</button>
          </div>
        </div>
      `
        )
        .join("");
    }
  }
}

// --- DRAWER CONTROLS ---
const drawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("cart-overlay");
const panel = drawer?.querySelector(".absolute.right-0");

export function openCart() {
  drawer?.classList.remove("invisible");
  overlay?.classList.remove("opacity-0");
  panel?.classList.remove("translate-x-full");
}

export function closeCart() {
  panel?.classList.add("translate-x-full");
  overlay?.classList.add("opacity-0");
  setTimeout(() => drawer?.classList.add("invisible"), 300);
}

// --- FIRESTORE PRODUCT FETCH ---
export async function loadProducts() {
  const grid = document.getElementById("product-grid");
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    if (!grid) return;
    grid.innerHTML = "";

    if (querySnapshot.empty) {
      grid.innerHTML = "<p class='col-span-full text-center'>No products found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow";
      card.innerHTML = `
        <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="w-full h-48 object-cover border-b border-gray-100" />
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">${product.name}</h3>
          <p class="text-blue-600 font-bold mb-4">৳${product.price}</p>
          <button class="add-btn w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      `;

      card.querySelector(".add-btn")?.addEventListener("click", () => addToCart(product));
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}

// --- INITIALIZE LISTENERS ---
export function initStore() {
  document.getElementById("open-cart-btn")?.addEventListener("click", openCart);
  document.getElementById("close-cart-btn")?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);

  document.getElementById("cart-items-container")?.addEventListener("click", (e) => {
    const target = e.target;
    if (target.tagName === "BUTTON") {
      const id = target.getAttribute("data-id");
      const action = target.getAttribute("data-action");
      if (id && action) {
        updateQuantity(id, action === "plus" ? 1 : -1);
      }
    }
  });

  updateCartUI();
  loadProducts();
}