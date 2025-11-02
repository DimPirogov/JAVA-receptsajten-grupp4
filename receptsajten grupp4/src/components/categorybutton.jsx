import React from "react";
import { useNavigate } from "react-router-dom"; // for page navigation
import "./categorybutton.css";

// Category button component
export default function CategoryButton({ name, isActive, onClick }) {
  const navigate = useNavigate();

  // When the button is clicked, go to the category page
  const handleClick = () => {
    if(typeof onClick === "function"){
      onClick();
      return;
    }
    // convert category name into lowercase (like "gin", "rum", "vodka")
    const categoryId = (name || "").toLowerCase().replace(/\s*drinkar$/i, "");
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
