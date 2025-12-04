import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authcontext";
import "./orders.css";

export default function Orders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (orders.length === 0) {
    return <p className="orders-empty">You have no orders yet.</p>;
  }

  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <span className="order-id">Order ID: {order._id}</span>
            <span className="order-date">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="order-total">
            Total: KES {order.total.toLocaleString()}
          </p>

          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item._id} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-price">
                  KES {item.price.toLocaleString()} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
