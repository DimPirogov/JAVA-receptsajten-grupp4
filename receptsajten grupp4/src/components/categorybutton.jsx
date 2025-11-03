import React from "react";
import { useNavigate } from "react-router-dom"; // for page navigation
import "./categorybutton.css";

// Category button component
export default function CategoryButton({ name, isActive, label, count }) {
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

  const text = label || name;

  return (
    <button
      className={`categorybutton ${isActive ? "active" : ""}`}
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={typeof count === "number" ? `${text} (${count})` : text}
    >
      <span className="label">{text}</span>
      {typeof count === "number" && <span className="count"> ({count})</span>}
    </button>
  );
}
