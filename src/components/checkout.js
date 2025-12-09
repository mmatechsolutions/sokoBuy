import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import { CartContext } from "../context/cartContext";
import { counties } from "../data/counties";
import { getDeliveryFee } from "./utils/deliveryFee";
import "./checkout.css";

export default function Checkout() {
  const { token, user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);

  const navigate = useNavigate();
  const location = useLocation();

  const cart = location.state?.cart || [];
  const total = location.state?.total || 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    county: "",
    localTown: "",
  });

  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState(""); // for editable phone in popup

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.firstName || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
      setPaymentPhone(user.phone || ""); // prefill payment phone
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitOrder = async () => {
    if (!token) return navigate("/login");

    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.county ||
      !form.localTown
    ) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setShowPaymentPopup(true); // open the M-Pesa phone popup
  };

  const handlePayment = async () => {
    const deliveryFee = getDeliveryFee(form.county);
    const grandTotal = total + deliveryFee;

    setLoading(true);
    setError("");

    try {
      // 1. Create order
      const orderRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart,
            total,
            deliveryFee,
            grandTotal,
            customer: form,
          }),
        }
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.message || "Failed to create order");

      const orderId = orderData.orderId;

      // 2. Trigger M-Pesa STK Push
      const mpesaRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/mpesa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: paymentPhone, // editable phone from popup
            amount: grandTotal,
            orderId,
          }),
        }
      );

      const mpesaData = await mpesaRes.json();
      if (!mpesaRes.ok)
        throw new Error(mpesaData.message || "M-Pesa request failed");

      alert("Check your phone to complete M-Pesa payment.");

      clearCart();
      navigate("/order-summary", {
        state: { order: { ...orderData.order, orderId } },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
    }

    setLoading(false);
    setShowPaymentPopup(false);
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="cart-summary">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>KES {item.price * item.quantity}</span>
          </div>
        ))}
        <h3>Total: KES {total}</h3>
      </div>

      <div className="checkout-form">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />

        <select name="county" value={form.county} onChange={handleChange}>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          name="localTown"
          placeholder="Nearest Town"
          value={form.localTown}
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}

        <button disabled={loading} onClick={submitOrder}>
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="payment-popup">
          <div className="popup-content">
            <h3>Confirm Phone for M-Pesa Payment</h3>
            <input
              type="text"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              placeholder="Enter phone number (2547XXXXXXXX)"
            />
            <div className="popup-buttons">
              <button onClick={() => setShowPaymentPopup(false)}>Cancel</button>
              <button disabled={loading} onClick={handlePayment}>
                {loading
                  ? "Processing..."
                  : "Pay KES " + (total + getDeliveryFee(form.county))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
