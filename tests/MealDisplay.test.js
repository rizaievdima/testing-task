import React from "react";
import { render, screen } from "@testing-library/react-native";

import MealDisplay from "../components/MealDisplay";

const meal = {
  strMeal: "Spicy Arrabiata Penne",
  strMealThumb:
    "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  strInstructions: "Bring a large pot of water to a boil.",
};

describe("MealDisplay", () => {
  it("shows the meal title", () => {
    render(<MealDisplay meal={meal} />);

    expect(screen.getByText(meal.strMeal)).toBeOnTheScreen();
  });

  it("shows the cooking instructions", () => {
    render(<MealDisplay meal={meal} />);

    expect(screen.getByText(meal.strInstructions)).toBeOnTheScreen();
  });

  it("shows the meal image loaded from strMealThumb", () => {
    render(<MealDisplay meal={meal} />);

    const image = screen.getByTestId("mealImage");

    expect(image).toBeOnTheScreen();
    expect(image.props.source).toEqual({ uri: meal.strMealThumb });
  });

  it("re-renders with new data when the meal prop changes", () => {
    render(<MealDisplay meal={meal} />);
    const another = {
      strMeal: "Borscht",
      strMealThumb: "https://example.com/borscht.jpg",
      strInstructions: "Boil the beets.",
    };

    screen.rerender(<MealDisplay meal={another} />);

    expect(screen.getByText("Borscht")).toBeOnTheScreen();
    expect(screen.getByText("Boil the beets.")).toBeOnTheScreen();
    expect(screen.queryByText(meal.strMeal)).not.toBeOnTheScreen();
    expect(screen.getByTestId("mealImage").props.source).toEqual({
      uri: "https://example.com/borscht.jpg",
    });
  });
});
