import React, { useContext, useState } from "react";
import Toast from "./toast";
import "./listCard.css";
import { CartContext } from "../context/cartContext";

const CardList = ({ products = [] }) => {
  const { addToCart } = useContext(CartContext);
  const [toastMessage, setToastMessage] = useState("");

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`${product.name} added to cart`);
  };

  return (
    <div>
      <div className="card-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price}</p>

                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default CardList;
