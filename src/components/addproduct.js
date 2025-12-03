import React, { useState } from "react";
import "./addproduct.css";

const AddProductForm = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // NEW

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    // Create preview
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.category || !imageFile) {
      alert("Please fill all fields and select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("category", product.category);
      formData.append("description", product.description);
      formData.append("image", imageFile);

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully!");
        setProduct({ name: "", price: "", category: "", description: "" });
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="add-product-form">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Inputs */}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Price (KES)</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            placeholder="Enter category"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Image</label>
          <input type="file" onChange={handleFileChange} required />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="image-preview">
            <p>Image Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
