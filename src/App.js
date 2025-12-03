import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import AddProductForm from "./components/addproduct";
import SignUp from "./components/Auth/signup";
import SignIn from "./components/Auth/signin";
import AuthProvider from "./components/context/authcontext";
import HomePage from "./components/home";
import { CartContext } from "./components/context/cartContext";

const App = () => {
  return (
    <AuthProvider>
      <CartContext>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddProductForm />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </BrowserRouter>
      </CartContext>
    </AuthProvider>
  );
};

export default App;
