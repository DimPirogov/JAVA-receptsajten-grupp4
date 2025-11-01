import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // for page navigation
import "./categorybutton.css";
// Category button component
export default function CategoryButton({ name, isActive }) {
  const navigate = useNavigate();
  const [bold, setBold] = useState()
  const location = useLocation();
  const path = location.pathname; // "/category/tequila"
  const category = path.split("/")[2]; // ✅ "tequila"
  // When the button is clicked, go to the category page
  const handleClick = () => {
    // convert category name into lowercase (like "gin", "rum", "vodka")
    const categoryId = name.toLowerCase().replace("drinkar", "");
    console.log(categoryId);
    setBold(categoryId)

    if (isActive) {
      navigate("/");
    } else {
      navigate(`/category/${categoryId}`);
    }
  };


  return (
    <button
      className={`categorybutton ${isActive ? "active" : ""} ${bold===category?'bold':''}`}
      onClick={handleClick}
    >
      {name}
    </button>
  );
}
