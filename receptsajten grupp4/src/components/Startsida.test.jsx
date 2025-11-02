import React from "react";
import {
	render,
	screen,
	waitFor,
	fireEvent,
	within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// mock the recipes service
vi.mock("../services/recipes", () => ({
	getRecipes: vi.fn(),
}));
import { getRecipes } from "../services/recipes";

vi.mock("../services/categories", () => ({
	getCategories: vi.fn(),
}));

import { getCategories } from "../services/categories";

import Startsida from "./Startsida";

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

const mockCategories = [
	{ name: "Gin", count: 3 },
	{ name: "Rom", count: 2 },
	{ name: "Tequila", count: 1 },
	{ name: "Vodka", count: 4 }
];

describe("Startsida", () => {
	beforeEach(() => {
		getRecipes.mockReset();
		getCategories.mockReset();
		getCategories.mockResolvedValue(mockCategories);
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
		for (const c of mockCategories) {
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

	it("shows retry button on load error and retries when clicked", async () => {
		const sample = [
			{
				_id: "r1",
				title: "Gin Fizz",
				imageUrl: "/g.jpg",
				timeInMins: 5,
				ingredients: ["Gin"],
			},
		];

		// first call fails, second call returns data
		getRecipes
			.mockRejectedValueOnce(new Error("Network fail"))
			.mockResolvedValueOnce(sample);

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Routes>
					<Route path="/" element={<Startsida />} />
				</Routes>
			</MemoryRouter>
		);

		// error shown
		const err = await screen.findByText(/Kunde inte kontakta databasen/i);
		expect(err).toBeInTheDocument();

		// find retry button inside the error container and click
		const retry = within(err.parentElement).getByRole("button", {
			name: /försök igen/i,
		});
		expect(retry).toBeInTheDocument();

		fireEvent.click(retry);

		// after retry resolves, recipe appears
		expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
	});

	describe("XSS Protection", () => {
		it("sanitizes XSS in URL query parameter", async () => {
			getRecipes.mockResolvedValue(sampleRecipes);

			//URL med XSS försök
			const xssQuery = "<script>alert('XSS')</script>";

			render(
                <MemoryRouter initialEntries={[`/?q=${encodeURIComponent(xssQuery)}`]}>
                    <Routes>
                        <Route path="/" element={<Startsida />} />
                    </Routes>
                </MemoryRouter>
            );

			//väntar på input i search
			await waitFor(() => {
                expect(screen.getByPlaceholderText(/Sök recept/i)).toBeInTheDocument();
            });

			//Inputen bör ha ren textning
			const searchInput = screen.getByPlaceholderText(/Sök recept/i);
            expect(searchInput.value).not.toContain("<script>");
            expect(searchInput.value).not.toContain("alert");

			//inga scripts borde finnas i DOM
			const scripts = document.querySelectorAll("script");
            const hasXSS = Array.from(scripts).some((s) => 
                s.textContent.includes("alert('XSS')")
            );
            expect(hasXSS).toBe(false);
		});
	})
});


