import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./orderSummary.css";

export default function OrderSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.order) return navigate("/");

  const { cart, total, deliveryFee, grandTotal, customer, orderId } =
    state.order;

  return (
    <div className="summary-page">
      <h2>Order Summary</h2>

      <p>
        <strong>Order ID:</strong> {orderId}
      </p>

      <h3>Customer Details</h3>
      <p>{customer.name}</p>
      <p>{customer.phone}</p>
      <p>{customer.email}</p>
      <p>
        {customer.county}, {customer.localTown}
      </p>
      <p>{customer.address}</p>

      <h3>Items</h3>
      {cart.map((i) => (
        <div key={i._id} className="summary-item">
          <span>{i.name}</span>
          <span>x{i.quantity}</span>
          <span>KES {i.price * i.quantity}</span>
        </div>
      ))}

      <h3>Total: KES {total}</h3>
      <h3>Delivery Fee: KES {deliveryFee}</h3>
      <h2>Grand Total: KES {grandTotal}</h2>
    </div>
  );
}
