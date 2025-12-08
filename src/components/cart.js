import React, { useContext } from "react";
import { CartContext } from "../context/cartContext";
import "./cart.css";
import { AuthContext } from "../context/authcontext";

export default function CartList() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } =
    useContext(CartContext);

  const { token } = useContext(AuthContext);

  // Calculate total
  const getTotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderPayload = {
      items: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: getTotal(),
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- add JWT
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Checkout successful!");
        clearCart();
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during checkout");
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {cart.length === 0 && <p className="cart-empty">No items in cart</p>}

      <div className="cart-items-wrapper">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-img" />

            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-price">
                KES {item.price.toLocaleString()}
              </p>

              <div className="cart-qty-controls">
                <button onClick={() => decreaseQuantity(item._id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>

              <button
                className="cart-remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-fixed-summary">
          <div className="cart-fixed-total">
            Total: KES {getTotal().toLocaleString()}
          </div>
          <button className="cart-checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
