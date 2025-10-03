console.log("ENV:", import.meta.env);

const BASE = import.meta.env.VITE_API_BASE; // 来自 .env.local

export async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  console.log("FETCH:", url);             // ← 临时调试：确认请求地址

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }

  return res.status === 204 ? null : res.json();
}
