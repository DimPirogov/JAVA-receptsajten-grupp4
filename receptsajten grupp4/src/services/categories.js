const BASE = 'https://grupp4-pkfud.reky.se';

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load categories: ${res.status} ${text}`);
  }
  // expecting an array
  return res.json();
}
