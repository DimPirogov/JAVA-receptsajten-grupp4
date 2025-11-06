import React from "react";
import { useNavigate } from "react-router-dom"; // for page navigation
import "./categorybutton.css";

// Category button component
export default function CategoryButton({ name, isActive, count, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {

    if (onClick) {
      onClick();
    } else {
      let categoryId = name.toLowerCase();
      
      if (categoryId.endsWith(' drinkar')) {
        categoryId = categoryId.slice(0, -8);
      } else if (categoryId.endsWith('drinkar')) {
        categoryId = categoryId.slice(0, -7); 
      }
      
      categoryId = categoryId.replace(/\s+/g, "-");
      
      if (isActive) {
        navigate("/");
      } else {
        navigate(`/category/${categoryId}`);
      }
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