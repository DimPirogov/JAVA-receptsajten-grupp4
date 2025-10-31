import React from "react";
import { useNavigate } from "react-router-dom"; // for page navigation
import "./categorybutton.css";

// Category button component
export default function CategoryButton({ name, isActive }) {
  const navigate = useNavigate();

  // When the button is clicked, go to the category page
  const handleClick = () => {
    // convert category name into lowercase (like "gin", "rum", "vodka")
    const categoryId = name.toLowerCase().replace("drinkar", "");
    if (isActive) {
      navigate("/");
    }else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <button
      className={`categorybutton ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      {name}
    </button>
  );
}
