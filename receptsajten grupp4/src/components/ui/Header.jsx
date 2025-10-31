import React from 'react'
import styles from '../header.module.scss'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar.jsx'
import { useState } from 'react'
import { categories } from '../../data/categories'
import Categorybutton from '../categorybutton'
import { useEffect } from 'react'
import { getRecipes } from '../../services/recipes'

export default function Header({ query, setQuery, navigate }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [countsByCategory, setCountsByCategory] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const normalize = (s) =>
    String(s || "").toLowerCase().replace(/drinkar?$/i, "").trim();

  // 提取配方的分类信息（支持多种数据结构）
  const extractRecipeCats = (r) => {
    if (!r) return [];
    const raw = r.categories ?? r.category ?? r.tags ?? [];
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.name || item.title || item.label || item.id || "";
        }
        return "";
      });
    } else if (typeof raw === "string") {
      arr = [raw];
    }
    return arr.map(normalize).filter(Boolean);
  };

  // 获取配方并统计每个分类的数量
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const recipes = await getRecipes();
        const counts = {};
        
        // 初始化所有分类的计数为0
        for (const cat of categories) {
          const key = normalize(cat.dbCategory ?? cat.name);
          counts[key] = 0;
        }
        
        // 累加每个配方的分类
        for (const recipe of recipes) {
          const recipeCats = extractRecipeCats(recipe);
          for (const key of recipeCats) {
            if (counts.hasOwnProperty(key)) {
              counts[key] += 1;
            }
          }
        }
        
        setCountsByCategory(counts);
      } catch (error) {
        console.error('获取分类数量失败:', error);
      }
    };
    
    fetchCategoryCounts();
  }, []);

  return (
    <header className={styles['hero']}>
      <img src="/hero.jpg" alt="Drink hero background" />
      <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles['search']}><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" /><path d="M26.657 14.3431C25.2093 12.8954 23.2093 12 21.0001 12C18.791 12 16.791 12.8954 15.3433 14.3431" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /><path d="M33.2216 33.2217L41.7069 41.707" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /></svg>

      <Link className={styles['hero-home']} to="/">Hem</Link>


      <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles['menu']}><path d="M7.94971 11.9497H39.9497" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /><path d="M7.94971 23.9497H39.9497" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /><path d="M7.94971 35.9497H39.9497" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <div className={styles['hero-search']}>

        {
          windowWidth < 768 ? '' :
            <SearchBar
              value={query}
              onChange={setQuery}

              onSubmit={(val) => {
                const v = (val || "").trim();
                navigate(v ? `/?q=${encodeURIComponent(v)}` : "/");
              }}
              placeholder="Sök recept eller ingrediens…"
            />
        }
      </div>

      <div className={styles['hero-text']}>
        <h1>Drinkrecept</h1>
        <h5>Dina favoritdrinkar samlade på ett ställe</h5>
      </div>

      <nav className={styles['hero-nav']}>
        {categories.map((cat) => {
          const key = normalize(cat.dbCategory ?? cat.name);
          return (
            <Categorybutton
              key={cat.name}
              name={cat.name}
              isActive={selectedCategory === cat.dbCategory}
              count={countsByCategory[key] || 0}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.dbCategory ? null : cat.dbCategory
                )
              }
            />
          );
        })}
      </nav>
    </header>
  )
}
