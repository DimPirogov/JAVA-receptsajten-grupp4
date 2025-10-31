import React from "react";

export default function RatingStars({ value, max = 5 }) {
	const filled = Math.floor(value);
	return (
		<span className="rating" aria-label={`Rating: ${value} of ${max}`}>
			{Array.from({ length: max }, (_, i) => (
				<span key={i + 1} className={i + 1 <= filled ? "active" : ""}>
					{i + 1 <= filled ? "★" : "☆"}
				</span>
			))}
		</span>
	);
}
