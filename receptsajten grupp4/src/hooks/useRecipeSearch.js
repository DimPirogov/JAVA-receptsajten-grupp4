import { useEffect, useMemo, useState } from "react";
import { getRecipes } from "../api/recipes.js"; // 命名导入
import { norm } from "../utils/text";

export default function useRecipeSearch() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getRecipes()
      .then(setAll)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!query) return all;
    const q = norm(query);
    return all.filter(r => {
      const titleHit = norm(r.title).includes(q);
      const ingHit = (r.ingredients || []).some(i => norm(i.name).includes(q));
      return titleHit || ingHit;
    });
  }, [all, query]);

  return { loading, err, query, setQuery, results };
}
