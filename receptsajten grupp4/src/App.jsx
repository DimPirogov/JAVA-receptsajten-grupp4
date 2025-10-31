// src/App.jsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

// pages/components
import Startsida from "./components/Startsida.jsx";
import CategoryPage from "./components/CategoryPage.jsx";
import Receptdetail from "./components/Receptdetail.jsx"; // detail page you already have

export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Startsida />} />

      {/* Category page: /category/:categoryId */}
      <Route path="/category/:categoryId" element={<CategoryPage />} />

      {/* Recipe detail: /recipe/:recipeId */}
      <Route path="/recipe/:recipeId" element={<Receptdetail />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
