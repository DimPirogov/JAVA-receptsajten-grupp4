export function computeDifficulty(price) {
	if (parseInt(price) === 1) return "Lätt";
	if (parseInt(price) === 2) return "Mellan";
	return "Svår";
}
