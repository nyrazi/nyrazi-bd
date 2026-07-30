import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/client.js";

// Read current cart from local storage
let cart = JSON.parse(localStorage.getItem("nyrazi_cart") || "[]");

export function renderOrderSummary() {
  const summaryContainer = document.getElementById("order-summary-items");
  const totalEl = document.getElementById("checkout-total");
  
  if (!summaryContainer || !totalEl) return;

  if (cart.length === 0) {
    summaryContainer.innerHTML = `<p class="text-gray-500 text-sm">Your cart is empty.</p>`;
    totalEl.innerText = "৳0";
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  summaryContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="flex justify-between items-center text-sm border-b pb-2">
        <div>
          <span class="font-medium text-gray-800">${item.name}</span>
          <span class="text-gray-500 text-xs"> x${item.quantity}</span>
        </div>
        <span class="font-semibold text-gray-700">৳${item.price * item.quantity}</span>
      </div>
    `
    )
    .join("");

  totalEl.innerText = `৳${total}`;
}

export function initCheckout() {
  renderOrderSummary();

  const form = document.getElementById("checkout-form");
  const submitBtn = document.getElementById("submit-order-btn");
  const formError = document.getElementById("form-error");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      if (formError) formError.innerText = "Your cart is empty. Add items before checking out.";
      return;
    }

    // Collect form data
    const name = document.getElementById("cust-name")?.value.trim();
    const phone = document.getElementById("cust-phone")?.value.trim();
    const address = document.getElementById("cust-address")?.value.trim();
    const district = document.getElementById("cust-district")?.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "COD";

    if (!name || !phone || !address || !district) {
      if (formError) formError.innerText = "Please fill in all required delivery fields.";
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing Order...";
      }

      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Create Order Document in Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        customer: {
          name,
          phone,
          address,
          district,
        },
        items: cart,
        totalAmount,
        paymentMethod,
        status: "Pending", // Pending, Processing, Shipped, Delivered
        createdAt: serverTimestamp(),
      });

      // Clear local cart
      localStorage.removeItem("nyrazi_cart");

      // Redirect to success view or show confirmation
      alert(`Order Placed Successfully! Order ID: ${orderRef.id}`);
      window.location.href = "/";
    } catch (error) {
      console.error("Error submitting order: ", error);
      if (formError) formError.innerText = "Failed to place order. Please try again.";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Confirm Order";
      }
    }
  });
}