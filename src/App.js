import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import AddProductForm from "./components/addproduct";
import SignUp from "./components/Auth/signup";
import SignIn from "./components/Auth/signin";
import AuthProvider from "./context/authcontext";
import HomePage from "./components/home";
import { CartProvider } from "./context/cartContext";
import CartList from "./components/cart";
import Orders from "./components/orders";
import Dashboard from "./components/Admin/dashboard";
import AdminOrders from "./components/Admin/adminOrders";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddProductForm />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/cart" element={<CartList />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
