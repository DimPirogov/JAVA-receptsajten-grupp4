const BASE = "https://grupp4-pkfud.reky.se";

export async function getRecipes() {
	const res = await fetch(`${BASE}/recipes`);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to load recipes: ${res.status} ${text}`);
	}
	// expecting an array
	return res.json();
}

export async function updateRecipe(id, patch) {
	const res = await fetch(`${BASE}/recipes/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(patch),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to update recipe: ${res.status} ${text}`);
	}
	return res.json();
}

// Post a single rating to the recipe ratings endpoint.
// Server expects { rating: number } at POST /recipes/:id/ratings
export async function postRating(id, rating) {
	const res = await fetch(`${BASE}/recipes/${id}/ratings`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ rating }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to post rating: ${res.status} ${text}`);
	}
	// Some servers return an empty body (204/empty) on success. Avoid calling
	// res.json() directly which throws on empty responses. Read text first,
	// then parse if non-empty and of JSON content-type.
	try {
		const text = await res.text();
		if (!text) return null;
		// Try to parse JSON; if parsing fails, return null so caller can
		// gracefully fallback to local updates.
		return JSON.parse(text);
	} catch (e) {
		// If we can't parse, return null instead of throwing a JSON error.
		console.warn("postRating: failed to parse JSON response", e);
		return null;
	}
}
