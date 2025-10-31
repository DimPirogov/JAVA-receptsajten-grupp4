// src/components/Receptlista.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ← add
import RatingStars from "./ui/RatingStars";

export default function ReceptLista({ recipe, onClick, index = 0 }) {

  const navigate = useNavigate();

  if (!recipe) return null;

  const displayRating = recipe.avgRating || 0;
  const isReversed = index % 2 === 1;

  // navigate to /recipe/:id when clicking the "Recept" button
  const goToDetail = (e) => {
    e.stopPropagation(); // prevent triggering article onClick
    const id = recipe._id ?? recipe.id; // support both _id or id
    if (!id) {
      console.warn("Recipe id not found on recipe:", recipe);
      return;
    }
    navigate(`/recipe/${id}`);
  };

  return (
    <article
      className={`recipe-item ${isReversed ? "reverse" : ""}`}
      onClick={() => onClick && onClick(recipe)}
    >
      <div className="recipe-media">
        <img src={recipe.imageUrl} alt={recipe.title} />
      </div>

      <div className="recipe-content">
        <h3>{recipe.title}</h3>

        <p>{recipe.description}</p>
        <p>
          Den består av&nbsp;
          {recipe.ingredients.map(ingredient => ingredient.name).join(", ")}
        </p>
        <div className="recipe-meta">
          <span className="time">
            Tillredningstid: {recipe.timeInMins} min
          </span>

          <div className="meta-row">
            <button className="recept-button" onClick={goToDetail}>
              Recept
            </button>

            <div className="rating-wrap">
              <RatingStars value={displayRating} />
              <span className="meta-score">{displayRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
