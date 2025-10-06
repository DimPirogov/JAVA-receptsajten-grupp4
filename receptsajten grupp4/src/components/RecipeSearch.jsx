import useRecipeSearch from "../hooks/useRecipeSearch";

export default function RecipeSearch() {
  const { loading, err, query, setQuery, results } = useRecipeSearch();

  if (loading) return <p>Laddar…</p>;
  if (err) return <p style={{ color: "red" }}>Fel: {err}</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && null}
        placeholder="Sök recept eller ingrediens…"
        aria-label="Sökruta"
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
      {query && results.length === 0 && (
        <p style={{ marginTop: 8 }}>Din sökning gav inga träffar</p>
      )}
      <ul style={{ marginTop: 12, lineHeight: 1.8 }}>
        {results.map((r) => (
          <li key={r.id || r._id}>
            <strong>{r.title}</strong>
            {r.ingredients?.length ? (
              <span style={{ color: "#666" }}>
                {" "}
                – {r.ingredients.slice(0, 3).map((i) => i.name).join(", ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
