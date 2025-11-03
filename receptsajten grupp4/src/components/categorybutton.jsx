import React from "react";
import { useNavigate } from "react-router-dom"; // for page navigation
import "./categorybutton.css";

// Category button component
export default function CategoryButton({ name, isActive, count }) {
  const navigate = useNavigate();

  // When the button is clicked, go to the category page
  const handleClick = () => {
    // convert category name into lowercase (like "gin", "rum", "vodka")
    const categoryId = name.toLowerCase().replace(/\s*drinkar$/i, "").replace(/\s+/g, "-");
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
      aria-pressed={isActive}
      aria-label={typeof count === "number" ? `${name} (${count})` : name}
    >
      <span className="label">{name}</span>
      {typeof count === "number" && <span className="count"> ({count})</span>}
    </button>
  );
}
