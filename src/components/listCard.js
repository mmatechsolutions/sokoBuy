import React from "react";
import "./listCard.css";

const CardList = ({ products }) => {
  return (
    <div className="card-list">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price}</p>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardList;
