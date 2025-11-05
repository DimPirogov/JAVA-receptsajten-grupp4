// src/components/CategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRecipes } from "../services/recipes";
import ReceptLista from "./Receptlista";
import { getCategories } from "../services/categories";
import "./Startsida.css";
import SearchBar from "./ui/SearchBar.jsx";
import CategoryButton from "./categorybutton.jsx";

export default function CategoryPage() {
	const { categoryId } = useParams(); // e.g. "gin", "rum", "tequila", "vodka"

	// data state
	const [recipes, setRecipes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// local search state (category-scoped)
	const [query, setQuery] = useState("");

	useEffect(() => {
		getCategories()
			.then((data) => {
				setCategories(data);
			})
			.catch(() => {
			});
	}, []);

	// Map route param ("gin") -> real backend category key ("gindrinkar")
	const activeSlug = useMemo(
		() => (categoryId || "").toLowerCase(),
		[categoryId]
	);

	const prettyTitle = useMemo(() => {
		const match = categories.find(
			(c) => (c.name || "").toLowerCase() === activeSlug
		);
		return match?.name || (categoryId ? categoryId[0].toUpperCase() + categoryId.slice(1) : "");
	}, [categories, activeSlug, categoryId])

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
		const base = recipes.filter((r) =>
			(r?.categories || []).some((c) =>
				(c || "").toLowerCase().includes(activeSlug) // matches "gin" in "gindrinkar"
			)
		);

		const q = (query || "").trim().toLowerCase();
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
	}, [recipes, activeSlug, query]);

	const countsByCat = useMemo(() => {
		const map = {};
		(recipes || []).forEach((r) => {
			(r?.categories || []).forEach((c) => {
				const id = String(c || "")
					.toLowerCase()
					.replace(/\s*drinkar$/i, "")
					.replace(/\s+/g, "-");
				map[id] = (map[id] || 0) + 1;
			});
		});
		return map;
	}, [recipes]);

	const toId = (name) =>
		String(name || "")
			.toLowerCase()
			.replace(/\s*drinkar$/i, "")
			.replace(/\s+/g, "-");

	if (loading) 
		return <div style={{ padding: 16 }}>Loading recipes…</div>;
	if (error)
		return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;


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
					<h1 style={{ textTransform: "capitalize" }}>{prettyTitle} drinkar</h1>
				</div>

				<nav>
                    {categories.map((cat) => {
                        const id = toId(cat.name);
                        const count = countsByCat[id] || 0;
                        // Format: "gindrinkar" -> "Gin Drinkar"
                        const baseCategory = cat.name.replace(/drinkar$/i, '');
                        const displayName = baseCategory.charAt(0).toUpperCase() + baseCategory.slice(1) + 'drinkar';

                        return (
                            <Link key={cat.name} to={`/category/${id}`} style={{ textDecoration: "none" }}>
                                <CategoryButton
                                    name={displayName}
                                    count={count}
                                    isActive={categoryId === id}
                                />
                            </Link>
                        );
                    })}
                </nav>
			</header>

			<section className="drink-list">
				{filtered.map((recipe, i) => (
					<ReceptLista key={recipe._id || recipe.id || recipe.title || i} recipe={recipe} index={i} />
				))}

				{filtered.length === 0 && (
					<p className="no-result">Inga recept i kategorin “{prettyTitle}”.</p>
				)}
			</section>
		</div>
	);
}
