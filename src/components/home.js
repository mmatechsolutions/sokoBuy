import "./home.css";
import React, { useState, useEffect, useContext, useRef } from "react";
import CardList from "./listCard";
import { AuthContext } from "../context/authcontext";
import { Link } from "react-router-dom";

const categories = [
  "All",
  "Electronics",
  "Appliances",
  "Fashion",
  "Beauty",
  "Services",
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, signout } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const accRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (accRef.current && !accRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      // Shuffle products
      const shuffled = [...data.products];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setProducts(shuffled);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="container">
      {/* Navbar */}
      <div className="nav">
        <h1 className="logo">Soko Buy</h1>

        <div className="nav-buttons">
          <button type="button" className="search-btn">
            Search
          </button>

          {/* ACCOUNT DROPDOWN */}
          <div className="acc-wrapper" ref={accRef}>
            <button type="button" className="acc" onClick={toggleMenu}>
              {user ? `Hi, ${user.lastName}` : "Account"}
            </button>

            {!user && menuOpen && (
              <div className="acc-dropdown">
                <a href="/signin" className="dropdown-btn">
                  Sign In
                </a>
                <a href="/signup" className="dropdown-btn">
                  Sign Up
                </a>
              </div>
            )}

            {user && menuOpen && (
              <div className="acc-dropdown">
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    signout();
                    setMenuOpen(false);
                  }}
                >
                  Account
                </button>

                <button
                  className="dropdown-btn"
                  onClick={() => {
                    signout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <Link to="/cart">
            <button type="button" className="cart">
              Cart
            </button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-right">
        <ul>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={selectedCategory === cat ? "active-category" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="main">
        {loading && <p>Loading products...</p>}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && <CardList products={filteredProducts} />}
      </div>
    </div>
  );
};

export default HomePage;
