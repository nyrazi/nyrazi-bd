import { 
  collection, 
  getDocs, 
  doc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth } from "../firebase/client.js";

let allOrders = [];
let allProducts = [];
let editingProductId = null;

// --- ORDERS LOGIC ---
export async function fetchOrders() {
  const container = document.getElementById("admin-orders-list");
  if (!container) return;

  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderOrders(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    container.innerHTML = `<p class="text-red-500 py-6 text-center">Failed to load orders.</p>`;
  }
}

export function renderOrders(ordersToDisplay) {
  const container = document.getElementById("admin-orders-list");
  const countBadge = document.getElementById("total-orders-count");
  if (!container) return;

  if (countBadge) countBadge.innerText = ordersToDisplay.length;

  if (ordersToDisplay.length === 0) {
    container.innerHTML = `<p class="text-gray-500 py-10 text-center">No orders found.</p>`;
    return;
  }

  container.innerHTML = ordersToDisplay.map((order) => {
    const formattedDate = order.createdAt?.toDate 
      ? order.createdAt.toDate().toLocaleString('en-BD') 
      : 'Just now';

    const itemsSummary = (order.items || []).map(
      i => `<li class="text-xs text-gray-600">${i.name} × ${i.quantity} (৳${i.price * i.quantity})</li>`
    ).join("");

    return `
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">
        <div class="flex flex-wrap justify-between items-start gap-2 border-b pb-3">
          <div>
            <span class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">ID: ${order.id}</span>
            <p class="text-xs text-gray-400 mt-1">${formattedDate}</p>
          </div>
          
          <div class="flex items-center gap-2">
            <select data-id="${order.id}" class="status-select text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}">
              <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
              <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
              <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
            <button data-id="${order.id}" class="delete-order-btn text-red-500 hover:text-red-700 p-1 font-bold text-sm" title="Delete Order">&times;</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-1">
            <p class="font-bold text-gray-800">${order.customer?.name || 'N/A'}</p>
            <p class="text-gray-600 font-medium">${order.customer?.phone || 'N/A'}</p>
            <p class="text-gray-500 text-xs">${order.customer?.address || ''}, ${order.customer?.district || ''}</p>
            <span class="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded mt-1">
              Payment: ${order.paymentMethod || 'COD'}
            </span>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
            <p class="text-xs font-bold text-gray-500 uppercase">Ordered Items</p>
            <ul class="space-y-1">${itemsSummary}</ul>
            <p class="text-sm font-bold text-blue-700 border-t pt-1 mt-2">Total: ৳${order.totalAmount || 0}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getStatusColor(status) {
  switch (status) {
    case "Processing": return "bg-yellow-50 text-yellow-800 border-yellow-300";
    case "Completed":  return "bg-green-50 text-green-800 border-green-300";
    case "Cancelled":  return "bg-red-50 text-red-800 border-red-300";
    default:           return "bg-blue-50 text-blue-800 border-blue-300";
  }
}

// --- PRODUCTS LOGIC ---
export async function fetchProducts() {
  const grid = document.getElementById("admin-products-grid");
  if (!grid) return;

  try {
    const snapshot = await getDocs(collection(db, "products"));
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    grid.innerHTML = `<p class="text-red-500 py-6 text-center col-span-full">Failed to load products.</p>`;
  }
}

export function renderProducts() {
  const grid = document.getElementById("admin-products-grid");
  const countBadge = document.getElementById("total-products-count");
  if (!grid) return;

  if (countBadge) countBadge.innerText = allProducts.length;

  if (allProducts.length === 0) {
    grid.innerHTML = `<p class="text-gray-500 py-10 text-center col-span-full">No products found. Add your first item above.</p>`;
    return;
  }

  grid.innerHTML = allProducts.map(p => `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
      <div>
        <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.name}" class="w-full h-40 object-cover border-b" />
        <div class="p-4 space-y-1">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-bold text-gray-800 text-sm">${p.name}</h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded ${p.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
              ${p.inStock !== false ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <p class="text-blue-600 font-bold text-sm">৳${p.price}</p>
        </div>
      </div>
      <div class="p-4 border-t bg-gray-50 flex gap-2">
        <button data-id="${p.id}" class="edit-product-btn flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-1.5 rounded transition-colors">
          Edit
        </button>
        <button data-id="${p.id}" class="delete-product-btn flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-1.5 rounded transition-colors">
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

// --- INITIALIZATION & EVENT LISTENERS ---
export function initAdmin() {
  const loginSection = document.getElementById("admin-login-section");
  const dashboardSection = document.getElementById("admin-dashboard-section");
  const loginForm = document.getElementById("admin-login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("admin-logout-btn");

  // Tab Navigation
  const tabOrdersBtn = document.getElementById("tab-orders-btn");
  const tabProductsBtn = document.getElementById("tab-products-btn");
  const viewOrders = document.getElementById("view-orders");
  const viewProducts = document.getElementById("view-products");

  function switchTab(target) {
    if (target === "orders") {
      viewOrders?.classList.remove("hidden");
      viewProducts?.classList.add("hidden");
      tabOrdersBtn?.classList.add("border-blue-600", "text-blue-600");
      tabOrdersBtn?.classList.remove("border-transparent", "text-gray-500");
      tabProductsBtn?.classList.remove("border-blue-600", "text-blue-600");
      tabProductsBtn?.classList.add("border-transparent", "text-gray-500");
    } else {
      viewProducts?.classList.remove("hidden");
      viewOrders?.classList.add("hidden");
      tabProductsBtn?.classList.add("border-blue-600", "text-blue-600");
      tabProductsBtn?.classList.remove("border-transparent", "text-gray-500");
      tabOrdersBtn?.classList.remove("border-blue-600", "text-blue-600");
      tabOrdersBtn?.classList.add("border-transparent", "text-gray-500");
    }
  }

  tabOrdersBtn?.addEventListener("click", () => switchTab("orders"));
  tabProductsBtn?.addEventListener("click", () => switchTab("products"));

  // Auth Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginSection?.classList.add("hidden");
      dashboardSection?.classList.remove("hidden");
      fetchOrders();
      fetchProducts();
    } else {
      loginSection?.classList.remove("hidden");
      dashboardSection?.classList.add("hidden");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("admin-email")?.value;
    const password = document.getElementById("admin-password")?.value;
    if (loginError) loginError.innerText = "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (loginError) loginError.innerText = "Invalid credentials.";
    }
  });

  logoutBtn?.addEventListener("click", () => signOut(auth));

  // --- PRODUCT FORM (ADD / EDIT) ---
  const productForm = document.getElementById("product-form");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  productForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("prod-name")?.value.trim();
    const price = Number(document.getElementById("prod-price")?.value);
    const image = document.getElementById("prod-image")?.value.trim();
    const inStock = document.getElementById("prod-stock")?.checked;

    if (!name || isNaN(price)) return;

    try {
      if (editingProductId) {
        // Update product
        const prodRef = doc(db, "products", editingProductId);
        await updateDoc(prodRef, { name, price, image, inStock });
        editingProductId = null;
        if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
        document.getElementById("form-submit-btn").innerText = "Add Product";
      } else {
        // Create new product
        await addDoc(collection(db, "products"), {
          name,
          price,
          image: image || "https://via.placeholder.com/300",
          inStock,
          createdAt: serverTimestamp()
        });
      }

      productForm.reset();
      document.getElementById("prod-stock").checked = true;
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  });

  cancelEditBtn?.addEventListener("click", () => {
    editingProductId = null;
    productForm?.reset();
    document.getElementById("prod-stock").checked = true;
    cancelEditBtn.classList.add("hidden");
    document.getElementById("form-submit-btn").innerText = "Add Product";
  });

  // Product Actions (Edit / Delete)
  document.getElementById("admin-products-grid")?.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-id");
    if (!id) return;

    if (e.target.classList.contains("edit-product-btn")) {
      const prod = allProducts.find(p => p.id === id);
      if (prod) {
        editingProductId = id;
        document.getElementById("prod-name").value = prod.name;
        document.getElementById("prod-price").value = prod.price;
        document.getElementById("prod-image").value = prod.image || "";
        document.getElementById("prod-stock").checked = prod.inStock !== false;
        
        document.getElementById("form-submit-btn").innerText = "Update Product";
        cancelEditBtn?.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (e.target.classList.contains("delete-product-btn")) {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          await deleteDoc(doc(db, "products", id));
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    }
  });

  // Orders Actions (Status & Delete)
  const ordersList = document.getElementById("admin-orders-list");
  const filterSelect = document.getElementById("status-filter");

  filterSelect?.addEventListener("change", (e) => {
    const val = e.target.value;
    renderOrders(val === "ALL" ? allOrders : allOrders.filter(o => o.status === val));
  });

  ordersList?.addEventListener("change", async (e) => {
    if (e.target.classList.contains("status-select")) {
      const orderId = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        const target = allOrders.find(o => o.id === orderId);
        if (target) target.status = newStatus;
        e.target.className = `status-select text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${getStatusColor(newStatus)}`;
      } catch (error) {
        alert("Failed to update status.");
      }
    }
  });

  ordersList?.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-order-btn")) {
      const orderId = e.target.getAttribute("data-id");
      if (confirm("Delete this order permanently?")) {
        try {
          await deleteDoc(doc(db, "orders", orderId));
          allOrders = allOrders.filter(o => o.id !== orderId);
          renderOrders(allOrders);
        } catch (error) {
          alert("Failed to delete order.");
        }
      }
    }
  });
}