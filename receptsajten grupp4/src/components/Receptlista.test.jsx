import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import ReceptLista from "./Receptlista";

const sampleRecipe = {
	id: "r1",
	_id: "r1",
	title: "Example Cocktail",
	imageUrl: "/img/example.jpg",
	timeInMins: 8,
	avgRating: 3.5,
	ingredients: [{ name: "Gin" }, { name: "Tonic" }],
	description: "A lovely drink",
};

describe("ReceptLista basic render", () => {
	it("renders title, image (with alt), rating and time", () => {
		render(
			<MemoryRouter>
				<ReceptLista recipe={sampleRecipe} index={0} />
			</MemoryRouter>
		);

		// title
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Example Cocktail"
		);

		// image with alt text
		const img = screen.getByAltText("Example Cocktail");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "/img/example.jpg");

		// time text
		expect(screen.getByText(/Tillredningstid:/)).toBeInTheDocument();
		expect(screen.getByText(/8 min/)).toBeInTheDocument();

		// rating wrapper should exist and Recept button is present
		expect(document.querySelector(".rating-wrap")).toBeInTheDocument();
		expect(screen.getByText(/Recept/)).toBeInTheDocument();
	});
});
