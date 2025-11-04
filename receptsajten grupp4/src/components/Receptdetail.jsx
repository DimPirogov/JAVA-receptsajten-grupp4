// src/components/Receptdetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRecipes, postRating, updateRecipe } from "../services/recipes";
import SearchBar from "./ui/SearchBar.jsx";
import DifficultyBadge from "./ui/DifficultyBadge"; // 若没有可先删掉这行与下方组件
import "./Startsida.css"; // 你已有
import "./receptdetail.css"; // 👈 新增样式文件（第2步给出）
import RatingStars from "./ui/RatingStars.jsx";
import Categorybutton from "./categorybutton.jsx";
import { getCategories } from "../services/categories";
import { sanitizeText, sanitizeUrlPart } from "../utils/sanitize.js";

export default function Receptdetail() {
	const navigate = useNavigate();
	const { recipeId } = useParams();

	const [recipe, setRecipe] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// feedback
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [name, setName] = useState("");
	const [comment, setComment] = useState("");
	const [hasRated, setHasRated] = useState(false);
	const [ratedMessage, setRatedMessage] = useState("");
	const [query, setQuery] = useState("");
	const [comments, setComments] = useState([]);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [categories, setCategories] = useState([]);

	const [recipes, setRecipes] = useState([]);
    const countsByCat = React.useMemo(() => {
        const map = {};
        (recipes || []).forEach((r) => {
            (r?.categories || []).forEach((c) => {
                map[c] = (map[c] || 0) + 1;
            });
        });
        return map;
    }, [recipes]);

	useEffect(() => {
		getCategories()
			.then((data) => {
				setCategories(data);
			})
			.catch(() => {
			});
	}, []);

	useEffect(() => {
		if (!recipeId) return;
		fetch(`https://grupp4-pkfud.reky.se/recipes/${recipeId}/comments`)
			.then((res) => res.json())
			.then((data) => {
				const list = Array.isArray(data) ? data : [];
				// sanitize incoming comments
				const safe = list.map((c) => ({
					...c,
					name: sanitizeText(c?.name, 60),
					comment: sanitizeText(c?.comment, 2000),
				}));
				setComments(safe);
			})
			.catch(() => setComments([]));
	}, [recipeId]);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		getRecipes()
			.then((data) => {
				if (!alive) return;
				const list = Array.isArray(data) ? data : [];
				setRecipes(list);
				const found = list.find(
					(r) => String(r._id ?? r.id) === String(recipeId)
				);
				setRecipe(found || null);
			})
			.catch((e) => alive && setError(e.message || "Failed to load"))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [recipeId]);

	if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
	if (error)
		return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;
	if (!recipe)
		return <div style={{ padding: 16 }}>Receptet hittades inte.</div>;

	// 展示字段准备
	const title = recipe.title || recipe.name || "Mojito";
	const img = recipe.imageUrl || recipe.image || "/hero.jpg";
	const mins = recipe.timeInMins ?? recipe.time ?? 0;
	const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
	const steps = Array.isArray(recipe.instructions) ? recipe.instructions : [];
	const price = recipe.price || recipe.svårighetsgrad || "Mellan";

	// avgRating may be stored as an array of numeric ratings or a single number
	const ratingsArray = Array.isArray(recipe.avgRating)
		? recipe.avgRating.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
		: typeof recipe.avgRating === "number"
			? [Number(recipe.avgRating)]
			: [];

	const avg =
		ratingsArray.length > 0
			? ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length
			: 0;

	// When the user has submitted a rating, lock further interactions and show
	// the average (read-only). Otherwise show the temporary selection.
	const displayRating = hasRated ? Math.round(avg) : rating;

	// effective rating to show while hovering/previewing: prefer hoverRating when present
	const effectiveRating = hoverRating || displayRating;

	async function sendComment() {
		if (!name.trim() || !comment.trim()) {
			alert("Vänligen fyll i både namn och kommentar.");
			return;
		}
		try {
			const res = await fetch(
				`https://grupp4-pkfud.reky.se/recipes/${recipeId}/comments`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: sanitizeText(name, 60),
						comment: sanitizeText(comment, 2000),
					}),
				}
			);
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(
					(err && (err.error || err.message)) || "Kunde inte skicka kommentar"
				);
			}
			setName("");
			setComment("");
			setIsSubmitted(true);

			const commentsRes = await fetch(
				`https://grupp4-pkfud.reky.se/recipes/${recipeId}/comments`
			);
			const newComments = await commentsRes.json();
			const list = Array.isArray(newComments) ? newComments : [];
			setComments(
				list.map((c) => ({
					...c,
					name: sanitizeText(c?.name, 60),
					comment: sanitizeText(c?.comment, 2000),
				}))
			);

			alert("Kommentar skickad");
		} catch (e) {
			alert(e.message || "Något gick fel vid skickandet.");
		}
	}

	return (
		<div className="drink-app">
			{/* Frame 1：头部大图 + 搜索 + 标题 */}
			<header className="hero hero--detail">
				<img src="/hero.jpg" alt="header" />
				<Link className="hero-home" to="/">
					Hem
				</Link>

				<div className="hero-search">
					<SearchBar
						value={query}
						onChange={(v) => setQuery(sanitizeText(v, 120))}
						onSubmit={(val) => {
							const q = sanitizeUrlPart(val, 120)
							navigate(q ? `/?q=${q}` : "/");
						}}
						placeholder="Sök recept eller ingrediens…"
					/>
				</div>

				<div className="hero-text">
					<h1>{title}</h1>
				</div>
				<nav>
                    {categories.map((cat) => {
                        const count = countsByCat[cat.name] || 0;
                        const baseCategory = cat.name.replace(/drinkar$/i, '');
                        const displayName = baseCategory.charAt(0).toUpperCase() + baseCategory.slice(1) + 'drinkar';

                        // Convert to URL-friendly id (e.g., "gindrinkar" -> "gin")
                        const categoryId = cat.name.toLowerCase().replace(/drinkar$/i, '').replace(/\s+/g, '-');

                        return (
                            <Link key={cat.name} to={`/category/${categoryId}`} style={{ textDecoration: "none" }}>
                                <Categorybutton
                                    name={displayName}
                                    count={count}
                                    isActive={false}
                                />
                            </Link>
                        );
                    })}
                </nav>
			</header>

			{/* Frame 2：信息条 */}
			<section className="detail-meta">
				<img className="hero-image" src={img} alt={title} />
				{/* todo  put back in center Tid Ingredienser Svårighetsgrad och hitta varför en test failar */}
				<div className="meta-column">
					<span className="meta-label">
						<h2 className="meta-title">{recipe.title}</h2>
					</span>
					<div className="meta-item">
						<span className="meta-label description">{recipe.description}</span>
					</div>
					<div className="meta-item">
						<span className="meta-label">Tid:</span> {mins} min
					</div>
					<div className="meta-item">
						<span className="meta-label">Ingredienser:</span> {ings.length}
					</div>
					<div className="meta-item meta-diff">
						<span className="meta-label">Svårighetsgrad:</span>
						<DifficultyBadge price={price} />
					</div>
					<div className="meta-item meta-rating">
						[
						<span className="meta-stars">
							<RatingStars value={avg} />
						</span>
						<span className="meta-score">{avg.toFixed(1)}</span>]
					</div>
				</div>
			</section>

			{/* Frame 3：两列布局 */}
			<section className="detail-body">
				<div className="detail-col">
					<h3>Ingredienser</h3>
					<ul className="dot-list">
						{ings.map((i, idx) => (
							<li key={idx}>
								{typeof i === "string"
									? i
									: i?.amount + " " + i?.unit + " " + i?.name || ""}
							</li>
						))}
					</ul>
				</div>

				<div className="detail-col">
					<h3>Instruktioner</h3>
					<ol className="step-list">
						{steps.map((s, idx) => (
							<li key={idx}>
								<input type="checkbox" name={`step[${idx}]`} value="1" />
								{s}
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="comments-section">
				<h4>Kommentarer</h4>
				{comments.map((c) => (
					<div key={c.id || c._id} className="comment">
						<strong>{c.name}</strong>
						<div className="comment-meta">
							{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
						</div>
						<p className="commentarytext">{c.comment}</p>
					</div>
				))}
			</section>

			{/* Frame 4：反馈区 */}
			<section className="detail-feedback">
				<h4>Vad tyckte du om receptet?</h4>

				<div className="stars">
					{/* If user has rated, replace the interactive stars with the thank-you message */}
					{hasRated ? (
						<div className="rated-message">
							{ratedMessage || "Tack! Du har betygsatt detta recept."}
						</div>
					) : (
						[1, 2, 3, 4, 5].map((star) => (
							<span
								key={star}
								className={`${star <= effectiveRating ? "active" : ""}`}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={async () => {
									// set local selection immediately
									setRating(star);
									try {
										const id = recipe._id ?? recipe.id;
										if (!id) throw new Error("Recipe id missing");

										const resp = await postRating(id, Number(star));

										if (resp && resp.avgRating !== undefined) {
											if (typeof resp.avgRating === "number") {
												const arr = [Number(resp.avgRating)];
												try {
													await updateRecipe(id, { avgRating: arr });
													setRecipe({ ...recipe, avgRating: arr });
												} catch {
													setRecipe({ ...recipe, avgRating: arr });
												}
											} else {
												setRecipe({ ...recipe, avgRating: resp.avgRating });
											}
										} else if (resp && resp.ratings) {
											setRecipe({ ...recipe, avgRating: resp.ratings });
										} else {
											const newRatings = Array.from(ratingsArray);
											newRatings.push(Number(star));
											setRecipe({ ...recipe, avgRating: newRatings });
										}

										setHasRated(true);
										setRating(0);
										setRatedMessage("Tack för ditt betyg!");
									} catch {
										setRatedMessage("Kunde inte spara omdömet. Försök igen.");
									}
								}}
								role="button"
								aria-disabled={false}
								style={{ cursor: "pointer" }}
							>
								☆
							</span>
						))
					)}
				</div>

				{isSubmitted ? (
					<div className="thank-you-message">
						<p>Tack för din kommentar!</p>
					</div>
				) : (
					<div className="feedback-form">
						Lämna gärna en kommentar
						<input
							className="input"
							placeholder="Namn..."
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isSubmitted}
						/>
						<textarea
							className="textarea"
							placeholder="Kommentar..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							disabled={isSubmitted}
						/>
						<button
							className="btn"
							onClick={sendComment}
							disabled={isSubmitted}
						>
							Skicka
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
