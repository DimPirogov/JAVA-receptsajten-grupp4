// src/components/CategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRecipes } from "../services/recipes";
import ReceptLista from "./Receptlista";
import { categories as CATEGORY_META } from "../data/categories";
import "./Startsida.css";
import SearchBar from "./ui/SearchBar.jsx";
import CategoryButton from "./categorybutton.jsx";

export default function CategoryPage() {
	const { categoryId } = useParams(); // e.g. "gin", "rum", "tequila", "vodka"

	// data state
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// local search state (category-scoped)
	const [query, setQuery] = useState("");

	// Map route param ("gin") -> real backend category key ("gindrinkar")
	const dbCategory = useMemo(() => {
		const id = (categoryId || "").toLowerCase();
		const found = CATEGORY_META.find(
			(c) =>
				c.dbCategory?.toLowerCase().includes(id) || // dbCategory contains "gin"
				c.name?.toLowerCase().startsWith(id) // or "Gindrinkar" starts with "gin"
		);
		return found?.dbCategory || id;
	}, [categoryId]);

	// Fetch all recipes once
	useEffect(() => {
		let alive = true;
		setLoading(true);
		getRecipes()
			.then((data) => alive && setRecipes(Array.isArray(data) ? data : []))
			.catch((e) => alive && setError(e.message || "Failed to load"))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, []);

	// Filter by category, then by local query
	const filtered = useMemo(() => {
		const base = recipes.filter((r) => r?.categories?.includes(dbCategory));
		const q = query.trim().toLowerCase();
		if (!q) return base;

		return base.filter((r) => {
			const title = (r.title || "").toLowerCase();
			const desc = (r.description || "").toLowerCase();
			const ings = (r.ingredients || [])
				.map((i) => (typeof i === "string" ? i : i?.name || ""))
				.join(" ")
				.toLowerCase();
			return title.includes(q) || desc.includes(q) || ings.includes(q);
		});
	}, [recipes, dbCategory, query]);

	if (loading) return <div style={{ padding: 16 }}>Loading recipes…</div>;
	if (error)
		return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;

	const prettyTitle =
		CATEGORY_META.find((c) => c.dbCategory === dbCategory)?.name ||
		`${categoryId}-drinkar`;

	return (
		<div className="drink-app">
			<header className="hero" style={{ minHeight: 120 }}>
				<img src="/hero.jpg" alt="header" />
				<Link className="hero-home" to="/">
					Hem
				</Link>

				{/* top-right search bar (category-scoped) */}
				<div style={{ position: "absolute", top: 10, right: 20, zIndex: 6 }}>
					<SearchBar
						value={query}
						onChange={setQuery}
						placeholder="Sök i denna kategori…"
					/>
				</div>

				<div className="hero-text">
					<h1 style={{ textTransform: "capitalize" }}>{prettyTitle}</h1>
				</div>

				<nav>
					{CATEGORY_META.map((cat) => {
						const id = cat.dbCategory.toLowerCase().replace("drinkar", "");
						return (
							<CategoryButton
								key={cat.name}
								name={cat.name}
								isActive={categoryId === id}
							/>
						);
					})}
				</nav>
			</header>

			<section className="drink-list">
				{filtered.map((recipe, i) => (
					<ReceptLista
						key={recipe._id || recipe.title}
						recipe={recipe}
						index={i}
					/>
				))}

				{filtered.length === 0 && (
					<p className="no-result">Inga recept i kategorin “{categoryId}”.</p>
				)}
			</section>
		</div>
	);
}
