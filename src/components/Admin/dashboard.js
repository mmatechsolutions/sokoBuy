import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../context/authcontext";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

import "./dashboard.css";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

export default function Dashboard() {
  const { token, signout } = useContext(AuthContext);

  const [pendingCount, setPendingCount] = useState(0);
  const [dailySales, setDailySales] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------------
  // FETCH FUNCTIONS
  // -------------------------------
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return signout();
      const data = await res.json();
      setPendingCount(
        Array.isArray(data)
          ? data.filter((o) => o.status === "pending").length
          : 0
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, [token, signout]);

  const fetchDailySales = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/stats/daily-sales`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setDailySales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching daily sales:", err);
      setDailySales([]);
    }
  }, [token]);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/stats/status-counts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setStatusCounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching status counts:", err);
      setStatusCounts([]);
    }
  }, [token]);

  const fetchBestProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/stats/best-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setBestProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching best products:", err);
      setBestProducts([]);
    }
  }, [token]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/stats/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setSummary(data || null);
    } catch (err) {
      console.error("Failed to fetch summary stats", err);
      setSummary(null);
    }
  }, [token]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchDailySales(),
        fetchStatusCounts(),
        fetchBestProducts(),
        fetchSummary(),
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [
    fetchOrders,
    fetchDailySales,
    fetchStatusCounts,
    fetchBestProducts,
    fetchSummary,
  ]);

  // -------------------------------
  // EFFECT
  // -------------------------------
  useEffect(() => {
    if (!token) return;
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [token, fetchAllData]);

  // -------------------------------
  // CHART DATA
  // -------------------------------
  const dailySalesLabels = dailySales.map(
    (d) => `${d._id?.day || 0}/${d._id?.month || 0}`
  );
  const dailySalesData = {
    labels: dailySalesLabels,
    datasets: [
      {
        label: "Revenue",
        data: dailySales.map((d) => d.totalRevenue || 0),
        borderWidth: 2,
        backgroundColor: "#ea9216",
        borderColor: "#3a4750",
        tension: 0.3,
      },
      {
        label: "Orders",
        data: dailySales.map((d) => d.totalOrders || 0),
        borderWidth: 2,
        backgroundColor: "#3a4750",
        borderColor: "#ea9216",
        tension: 0.3,
      },
    ],
  };

  const statusPieData = {
    labels: statusCounts.map((s) => s._id || "Unknown"),
    datasets: [
      {
        data: statusCounts.map((s) => s.count || 0),
        backgroundColor: ["#f0ad4e", "#5bc0de", "#5cb85c", "#d9534f", "#777"],
      },
    ],
  };

  const bestProductsData = {
    labels: bestProducts.map((p) => p._id || "Unknown"),
    datasets: [
      {
        label: "Units Sold",
        data: bestProducts.map((p) => p.totalSold || 0),
        backgroundColor: "#ea9216",
      },
    ],
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="mobile-header">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <h2 className="mobile-title">Dashboard</h2>
      </div>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3 className="sidebar-title">Quick Links</h3>
        <ul className="sidebar-links">
          <li>
            <a href="/dashboard">🏠 Dashboard Home</a>
          </li>
          <li className="order-link">
            <a href="/admin/orders">
              🛒 Orders{" "}
              {pendingCount > 0 && (
                <span className="badge">{pendingCount}</span>
              )}
            </a>
          </li>
          <li>
            <a href="/add">Add Product</a>
          </li>
          <li>
            <a href="/settings">⚙️ Settings</a>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <h2 className="desktop-title">Analytics Dashboard</h2>
        {summary && (
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total Revenue</h4>
              <p>KES {summary.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Orders</h4>
              <p>{summary.totalOrders || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Customers</h4>
              <p>{summary.totalCustomers || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Items Sold</h4>
              <p>{summary.totalItemsSold || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Average Order Value</h4>
              <p>KES {summary.avgOrderValue?.toFixed(0) || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Today's Revenue</h4>
              <p>KES {summary.todayRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Today's Orders</h4>
              <p>{summary.todayOrders || 0}</p>
            </div>
          </div>
        )}

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Daily Sales (Revenue vs Orders)</h3>
            <Line data={dailySalesData} />
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Orders Per Status</h3>
            <Pie data={statusPieData} />
          </div>
          <div className="chart-card full-width">
            <h3 className="chart-title">Best-Selling Products</h3>
            <Bar data={bestProductsData} />
          </div>
        </div>
      </main>
    </div>
  );
}
