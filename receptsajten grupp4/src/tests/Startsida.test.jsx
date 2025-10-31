import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// mock the recipes service
vi.mock("../services/recipes", () => ({
	getRecipes: vi.fn(),
}));
import { getRecipes } from "../services/recipes";

import Startsida from "../components/Startsida";
import { categories } from "../data/categories";

const sampleRecipes = [
	{
		id: "r1",
		title: "Gin Fizz",
		imageUrl: "/gin.jpg",
		timeInMins: 5,
		ingredients: ["Gin", "Lime"],
	},
	{
		id: "r2",
		title: "Rum Punch",
		imageUrl: "/rum.jpg",
		timeInMins: 12,
		ingredients: ["Rom", "Orange"],
	},
];

describe("Startsida", () => {
	beforeEach(() => {
		getRecipes.mockReset();
	});

	it("renders category buttons and recipe list", async () => {
		getRecipes.mockResolvedValue(sampleRecipes);

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Routes>
					<Route path="/" element={<Startsida />} />
				</Routes>
			</MemoryRouter>
		);

		// categories from data should be rendered as buttons
		for (const c of categories) {
			expect(await screen.findByText(c.name)).toBeInTheDocument();
		}

		// recipe titles should appear
		expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
		expect(await screen.findByText("Rum Punch")).toBeInTheDocument();
	});

	it("applies ?q= search filter from URL", async () => {
		getRecipes.mockResolvedValue(sampleRecipes);

		// initial URL contains a query that should match only the Gin Fizz
		render(
			<MemoryRouter initialEntries={["/?q=gin"]}>
				<Routes>
					<Route path="/" element={<Startsida />} />
				</Routes>
			</MemoryRouter>
		);

		// Gin Fizz should be present, Rum Punch should not
		expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.queryByText("Rum Punch")).not.toBeInTheDocument();
		});

	});

  // testar visa betyg med korrekt antal fyllda stjärnor
  it("renders the correct number of filled stars for avgRating", async () => {
    const rated = [
      {
        id: "r3",
        _id: "r3",
        title: "Starred Drink",
        imageUrl: "/star.jpg",
        timeInMins: 7,
        ingredients: ["Thing"],
        avgRating: 3,
      },
    ];

    getRecipes.mockResolvedValue(rated);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Startsida />} />
        </Routes>
      </MemoryRouter>
    );

    // wait for the recipe title to appear
    expect(await screen.findByText("Starred Drink")).toBeInTheDocument();

    // locate the article node for this recipe and then the rating container inside it
    const titleNode = screen.getByText("Starred Drink");
    const article = titleNode.closest("article");
    expect(article).toBeTruthy();

    const ratingEl = article.querySelector(".rating");
    expect(ratingEl).toBeTruthy();

    // count filled (active) stars
    const filled = ratingEl.querySelectorAll(".active");
    expect(filled.length).toBe(3);
  });
});
