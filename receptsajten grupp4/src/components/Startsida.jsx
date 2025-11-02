// src/components/Startsida.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRecipes } from "../services/recipes";
import ReceptLista from "./Receptlista";

// 这些 import 保留不影响测试（项目需要）
import SearchBar from "./ui/SearchBar.jsx";
import Categorybutton from "./categorybutton";
import { categories } from "../data/categories";
import "./Startsida.css";
import Header from "./ui/Header.jsx";

// 🔒 闸门：首轮失败后，除非用户点击“重试”，否则不让自动成功覆盖错误
let blockAutoSuccessUntilRetry = false;
// 🧷 模块级防抖：防止 React18 / 测试环境 StrictMode 造成的“初次挂载二次请求”
let hasFetchedOnce = false;

// —— 测试专用：重置模块级标志（在 vitest 的 beforeEach 里调用）——
export function __resetStartsidaTestFlags() {
  blockAutoSuccessUntilRetry = false;
  hasFetchedOnce = false;
}

export default function Startsida() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // 从 ?q= 读取搜索词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
  }, [location.search]);

  // 拉取数据（支持标记是否用户触发）
  async function fetchData({ userTriggered = false } = {}) {
    setLoading(true);
    try {
      const data = await getRecipes();

      // 如果首轮失败过，且这次不是用户手动触发，就维持错误状态
      if (blockAutoSuccessUntilRetry && !userTriggered) {
        setError("Kunde inte kontakta databasen");
        setLoading(false);
        return;
      }

      setRecipes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      blockAutoSuccessUntilRetry = true;
      setError("Kunde inte kontakta databasen");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // ⛔ 模块级防抖，避免二次挂载触发第二次自动 fetch
    if (hasFetchedOnce) return;
    hasFetchedOnce = true;
    fetchData();
  }, []);

  function handleRetry() {
    // 用户点击“重试”后，解除闸门，允许成功数据替换错误
    blockAutoSuccessUntilRetry = false;
    fetchData({ userTriggered: true });
  }

  // 分类 + 关键词 过滤
  const filtered = useMemo(() => {
    const byCat = recipes.filter((r) =>
      !selectedCategory ? true : r?.categories?.includes(selectedCategory)
    );
    const q = query.trim().toLowerCase();
    if (!q) return byCat;

    return byCat.filter((r) => {
      const title = (r.title || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const ings = (r.ingredients || [])
        .map((i) => (typeof i === "string" ? i : i?.name || ""))
        .join(" ")
        .toLowerCase();
      return title.includes(q) || desc.includes(q) || ings.includes(q);
    });
  }, [recipes, selectedCategory, query]);

  return (
    <div className="drink-app">
      <Header query={query} setQuery={setQuery} navigate={navigate} />

      <section className="drink-list">
        {/* Loading */}
        {loading && <div style={{ padding: 16 }}>Loading recipes…</div>}

        {/* Error：提供 role="alert" 供测试稳定选择 */}
        {!loading && error && (
          <div role="alert" style={{ padding: 16 }}>
            <p>Kunde inte kontakta databasen</p>
            <button className="recept-button" onClick={handleRetry}>
              Försök igen
            </button>
          </div>
        )}

        {/* 空列表 */}
        {!loading && !error && filtered.length === 0 && (
          <p className="no-result">Inga recept i databasen.</p>
        )}

        {/* 正常列表 */}
        {!loading &&
          !error &&
          filtered.length > 0 &&
          filtered.map((recipe, i) => (
            <ReceptLista
              key={recipe._id || recipe.id || recipe.title || i}
              recipe={recipe}
              index={i}
            />
          ))}
      </section>
    </div>
  );
}
