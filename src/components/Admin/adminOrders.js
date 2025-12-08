import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../../context/authcontext";
import "./adminorders.css";

export default function AdminOrders() {
  const { token, signout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusInputs, setStatusInputs] = useState({});
  const [filter, setFilter] = useState("pending"); // default

  // COUNT ORDERS BY STATUS
  const counts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // FILTERED ORDERS
  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.status === filter
  );

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        signout();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data);

      const initialInputs = {};
      data.forEach((order) => {
        initialInputs[order._id] = { status: "", message: "" };
      });
      setStatusInputs(initialInputs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, signout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---------------- UPDATE ORDER STATUS ----------------
  const updateStatus = async (orderId) => {
    const { status, message } = statusInputs[orderId] || {};
    if (!status) return alert("Select a status");

    setUpdatingId(orderId);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (res.status === 401) {
        signout();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors = {
    pending: "badge pending",
    processing: "badge processing",
    shipped: "badge shipped",
    delivered: "badge delivered",
    cancelled: "badge cancelled",
  };

  if (loading) return <p className="loading">Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      {/* FILTER STRIP WITH BADGES */}
      <div className="filter-strip">
        {[
          { label: "pending", text: "Pending" },
          { label: "processing", text: "Processing" },
          { label: "shipped", text: "Shipped" },
          { label: "delivered", text: "Delivered" },
          { label: "cancelled", text: "Cancelled" },
          { label: "all", text: "All" },
        ].map((status) => (
          <button
            key={status.label}
            className={
              filter === status.label ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter(status.label)}
          >
            {status.text}
            <span className="filter-badge">
              {status.label === "all"
                ? orders.length
                : counts[status.label] || 0}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 && <p>No orders in this category.</p>}

      {/* USE FILTERED ORDERS HERE */}
      {filteredOrders.map((order) => {
        const input = statusInputs[order._id] || {};
        return (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <h3>Order #{order._id.slice(-6)}</h3>
              <span className={statusColors[order.status]}>
                {order.status.toUpperCase()}
              </span>
            </div>

            <p className="order-date">
              {new Date(order.createdAt).toLocaleString()}
            </p>

            {/* ITEMS */}
            <h4>Items</h4>
            <ul className="item-list">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  <span>{item.name}</span> × {item.quantity}
                  <b>KES {item.price * item.quantity}</b>
                </li>
              ))}
            </ul>

            <h3 className="total">Total: KES {order.total.toLocaleString()}</h3>

            {/* SHIPPING */}
            {order.shipping?.address && (
              <div className="shipping">
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

            {/* STATUS HISTORY */}
            <div className="history">
              <h4>Status History</h4>
              <ul>
                {order.statusHistory.map((h, idx) => (
                  <li key={idx}>
                    <b>{h.status.toUpperCase()}</b>
                    <span> - {h.message || "No message"}</span>
                    <small>({new Date(h.updatedAt).toLocaleString()})</small>
                  </li>
                ))}
              </ul>
            </div>

            {/* UPDATE SECTION */}
            <div className="update-section">
              <select
                value={input.status}
                onChange={(e) =>
                  setStatusInputs({
                    ...statusInputs,
                    [order._id]: { ...input, status: e.target.value },
                  })
                }
              >
                <option value="">Update status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="text"
                placeholder="Optional message"
                value={input.message}
                onChange={(e) =>
                  setStatusInputs({
                    ...statusInputs,
                    [order._id]: { ...input, message: e.target.value },
                  })
                }
              />

              <button
                onClick={() => updateStatus(order._id)}
                disabled={updatingId === order._id}
              >
                {updatingId === order._id ? "Updating..." : "Apply"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
