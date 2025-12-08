import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/authcontext";
import "./orders.css";

export default function Orders() {
  const { token } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errRes = await res.json();
        throw new Error(errRes.message || "Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("ORDERS ERROR:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <p className="orders-loading">Loading orders...</p>;
  if (error) return <p className="orders-error">{error}</p>;
  if (orders.length === 0)
    return <p className="orders-empty">You have no orders yet.</p>;

  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <span className="order-id">Order: {order._id.slice(-6)}</span>
            <span className="order-date">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
          <p className={`order-status status-${order.status}`}>
            Status: {order.status.toUpperCase()}
          </p>
          <p className="order-total">
            Total: KES {order.total.toLocaleString()}
          </p>

          <h4 className="items-title">Items</h4>
          <ul className="order-items">
            {order.items.map((item, i) => (
              <li key={i} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-price">
                  KES {item.price.toLocaleString()} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>

          {order.shipping && order.shipping.address && (
            <div className="shipping-section">
              <h4>Shipping</h4>
              <p>Address: {order.shipping.address}</p>
              <p>City: {order.shipping.city}</p>
              <p>Phone: {order.shipping.phone}</p>
              {order.shipping.trackingNumber && (
                <p>Tracking #: {order.shipping.trackingNumber}</p>
              )}
              {order.shipping.courier && (
                <p>Courier: {order.shipping.courier}</p>
              )}
            </div>
          )}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="history-section">
              <h4>Status History</h4>
              <ul>
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="history-item">
                    <b>{h.status.toUpperCase()}</b> –{" "}
                    {h.message || "No message"}{" "}
                    <span className="history-date">
                      ({new Date(h.updatedAt).toLocaleString()})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
