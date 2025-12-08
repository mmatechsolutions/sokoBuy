import React, { useContext } from "react";
import { CartContext } from "../context/cartContext";
import "./cart.css";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";

export default function CartList() {
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const getTotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (!token) {
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        cart,
        total: getTotal(),
      },
    });
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
