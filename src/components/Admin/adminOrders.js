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
  const [filter, setFilter] = useState("pending");
  const [showCustomer, setShowCustomer] = useState({}); // toggle state per order

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401) {
        signout();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data);

      // init statusInputs and toggle state
      const initialInputs = {};
      const initialToggle = {};
      data.forEach((order) => {
        initialInputs[order._id] = { status: "", message: "" };
        initialToggle[order._id] = false; // customer details hidden by default
      });
      setStatusInputs(initialInputs);
      setShowCustomer(initialToggle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, signout]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ---------------- UPDATE STATUS ----------------
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

  const counts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.status === filter
  );

  if (loading) return <p className="loading">Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      {/* FILTER */}
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

      {/* ORDERS */}
      {filteredOrders.map((order) => {
        const input = statusInputs[order._id] || {};
        return (
          <div className="order-card" key={order._id}>
            {/* HEADER */}
            <div className="order-header">
              <h3>Order #{order._id?.slice(-6) || "N/A"}</h3>
              <span className={statusColors[order.status]}>
                {order.status?.toUpperCase() || "N/A"}
              </span>
            </div>
            <p className="order-date">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </p>

            {/* TOGGLE CUSTOMER DETAILS */}
            <button
              className="toggle-btn"
              onClick={() =>
                setShowCustomer((prev) => ({
                  ...prev,
                  [order._id]: !prev[order._id],
                }))
              }
            >
              {showCustomer[order._id]
                ? "Hide Customer Details"
                : "Show Customer Details"}
            </button>

            {showCustomer[order._id] && order.customer && (
              <div className="customer-details">
                <h4>Customer Details</h4>
                <p>
                  <b>Name:</b> {order.customer?.name || "N/A"}
                </p>
                <p>
                  <b>Phone:</b> {order.customer?.phone || "N/A"}
                </p>
                <p>
                  <b>Email:</b> {order.customer?.email || "N/A"}
                </p>
                <p>
                  <b>County:</b> {order.customer?.county || "N/A"}
                </p>
                <p>
                  <b>Town:</b> {order.customer?.localTown || "N/A"}
                </p>
                <p>
                  <b>Address:</b> {order.customer?.address || "N/A"}
                </p>
              </div>
            )}

            {/* ITEMS */}
            <h4>Items</h4>
            <ul className="item-list">
              {order.items?.map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.quantity}{" "}
                  <b>KES {item.price * item.quantity}</b>
                </li>
              ))}
            </ul>

            <h3>Total: KES {order.total?.toLocaleString() || 0}</h3>
            <p>Delivery: KES {order.deliveryFee?.toLocaleString() || 0}</p>
            <h3>Grand Total: KES {order.grandTotal?.toLocaleString() || 0}</h3>

            {/* STATUS HISTORY */}
            <div className="history">
              <h4>Status History</h4>
              <ul>
                {order.statusHistory?.map((h, idx) => (
                  <li key={idx}>
                    <b>{h.status?.toUpperCase() || "N/A"}</b> -{" "}
                    {h.message || "No message"}
                    <small>
                      {" "}
                      (
                      {h.updatedAt
                        ? new Date(h.updatedAt).toLocaleString()
                        : "N/A"}
                      )
                    </small>
                  </li>
                ))}
              </ul>
            </div>

            {/* UPDATE */}
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
                disabled={updatingId === order._id || !input.status}
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
