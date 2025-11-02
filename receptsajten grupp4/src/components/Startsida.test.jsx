// src/components/Startsida.test.jsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// ---- mock recipes service ----
vi.mock("../services/recipes", () => ({
  getRecipes: vi.fn(),
}));
import { getRecipes } from "../services/recipes";

import Startsida, { __resetStartsidaTestFlags } from "./Startsida";
import { categories } from "../data/categories";

const sampleRecipes = [
  {
    id: "r1",
    title: "Gin Fizz",
    imageUrl: "/gin.jpg",
    timeInMins: 5,
    ingredients: ["Gin", "Lime"],
  },
  {
    id: "r2",
    title: "Rum Punch",
    imageUrl: "/rum.jpg",
    timeInMins: 12,
    ingredients: ["Rom", "Orange"],
  },
];

describe("Startsida", () => {
  beforeEach(() => {
    getRecipes.mockReset();
    // 重置组件内的模块级标志，避免用例之间相互影响
    if (typeof __resetStartsidaTestFlags === "function") {
      __resetStartsidaTestFlags();
    }
  });

  it("renders category buttons and recipe list", async () => {
    getRecipes.mockResolvedValue(sampleRecipes);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Startsida />} />
        </Routes>
      </MemoryRouter>
    );

    for (const c of categories) {
      expect(await screen.findByText(c.name)).toBeInTheDocument();
    }

    expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
    expect(await screen.findByText("Rum Punch")).toBeInTheDocument();
  });

  it("applies ?q= search filter from URL", async () => {
    getRecipes.mockResolvedValue(sampleRecipes);

    render(
      <MemoryRouter initialEntries={["/?q=gin"]}>
        <Routes>
          <Route path="/" element={<Startsida />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Rum Punch")).not.toBeInTheDocument();
    });
  });

  it("renders the correct number of filled stars for avgRating", async () => {
    const rated = [
      {
        id: "r3",
        _id: "r3",
        title: "Starred Drink",
        imageUrl: "/star.jpg",
        timeInMins: 7,
        ingredients: ["Thing"],
        avgRating: 3,
      },
    ];

    getRecipes.mockResolvedValue(rated);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Startsida />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Starred Drink")).toBeInTheDocument();

    const titleNode = screen.getByText("Starred Drink");
    const article = titleNode.closest("article");
    expect(article).toBeTruthy();

    const ratingEl = article.querySelector(".rating");
    expect(ratingEl).toBeTruthy();

    const filled = ratingEl.querySelectorAll(".active");
    expect(filled.length).toBe(3);
  });

  it("shows retry button on load error and retries when clicked", async () => {
    const sample = [
      {
        _id: "r1",
        title: "Gin Fizz",
        imageUrl: "/g.jpg",
        timeInMins: 5,
        ingredients: ["Gin"],
      },
    ];

    // 关键：前两次自动请求都失败，确保错误框一定出现（防止意外二次挂载覆盖错误）
    getRecipes
      .mockRejectedValueOnce(new Error("Network fail"))
      .mockRejectedValueOnce(new Error("Network fail"));

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Startsida />} />
        </Routes>
      </MemoryRouter>
    );

    // 现在错误文本一定可见
    const msg = await screen.findByText(/Kunde inte kontakta databasen/i);
    const alertBox = msg.closest('[role="alert"]');
    expect(alertBox).toBeTruthy();

    // 设置“下一次调用”（点击重试触发）为成功
    getRecipes.mockResolvedValueOnce(sample);

    const retryBtn = within(alertBox).getByRole("button", {
      name: /försök igen/i,
    });
    fireEvent.click(retryBtn);

    // 成功后应渲染数据
    expect(await screen.findByText("Gin Fizz")).toBeInTheDocument();
  });
});
