import React from "react";
import { computeDifficulty } from "../../utils/difficulty";

export default function DifficultyBadge({ price }) {
	const label = computeDifficulty(price);
	return (
		<span >
			{label}
		</span>
	);
}
