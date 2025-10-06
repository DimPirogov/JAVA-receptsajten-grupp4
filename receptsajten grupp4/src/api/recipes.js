import { request } from "./client.js";

export function getRecipes() {              // ← 必须有这个
  return request("/recipes");
}

export function getRecipe(id) {
  return request(`/recipes/${id}`);
}

export function getComments(id) {
  return request(`/recipes/${id}/comments`);
}

export function addComment(id, data) {
  return request(`/recipes/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addRating(id, data) {
  return request(`/recipes/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
