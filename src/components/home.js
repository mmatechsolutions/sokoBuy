import "./home.css";
import React, { useState, useEffect, useContext, useRef } from "react";
import CardList from "./listCard";
import SearchBar from "./searchBar";
import { AuthContext } from "../context/authcontext";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/cartContext";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { user, signout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const accRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close dropdown when clicking outside
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

      // Shuffle products
      const shuffled = [...data.products];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setProducts(shuffled);

      // Extract categories
      const dbCategories = [...new Set(data.products.map((p) => p.category))];
      setCategories(["All", ...dbCategories]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search handler
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearching(false);
      setSearchResults([]);
      return;
    }

    const results = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );

    setSearchResults(results);
    setSearching(true);
  };

  // Category Filter
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
          {/* Search Component */}
          <SearchBar onSearch={handleSearch} />

          {/* Account Dropdown */}
          <div className="acc-wrapper" ref={accRef}>
            <button type="button" className="acc" onClick={toggleMenu}>
              {user ? `Hi, ${user.firstName}` : "Account"}
            </button>

            {!user && menuOpen && (
              <div className="acc-dropdown">
                <a href="/signin" className="dropdown-btn">
                  Log In
                </a>
                <a href="/signup" className="dropdown-btn">
                  Create Account
                </a>
              </div>
            )}

            {user && menuOpen && (
              <div className="acc-dropdown">
                <button
                  className="dropdown-btn"
                  onClick={() => navigate("/account")}
                >
                  Account
                </button>
                {user && (user.role === "admin" || user.role === "vendor") && (
                  <button
                    type="button"
                    className="dropdown-btn"
                    onClick={() => navigate("/dashboard")}
                  >
                    Admin
                  </button>
                )}

                <button
                  className="dropdown-btn"
                  onClick={() => navigate("/orders")}
                >
                  My Orders
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
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      {!searching && (
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
      )}

      {/* Main Content */}
      <div className="main">
        {loading && <p>Loading products...</p>}
        {error && <p className="error">Error: {error}</p>}

        {/* SEARCH RESULTS */}
        {searching && <CardList products={searchResults} />}

        {/* NORMAL LISTING */}
        {!searching && !loading && !error && (
          <CardList products={filteredProducts} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
