import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import App from "../App";
import { fetchMeal } from "../services/mealService";

// Підміняємо сервіс: App не має знати ні про axios, ні про мережу
jest.mock("../services/mealService");

const randomMeal = {
  strMeal: "Random Meal",
  strMealThumb: "https://example.com/random.jpg",
  strInstructions: "Random instructions.",
};

const foundMeal = {
  strMeal: "Pizza Express Margherita",
  strMealThumb: "https://example.com/pizza.jpg",
  strInstructions: "Bake the pizza.",
};

describe("App", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the input and the button", async () => {
    fetchMeal.mockResolvedValueOnce(randomMeal);

    render(<App />);

    expect(screen.getByPlaceholderText("Enter a meal name")).toBeOnTheScreen();
    expect(screen.getByText("Get Meal")).toBeOnTheScreen();

    await screen.findByText(randomMeal.strMeal);
  });

  it("fetches a random meal on start and shows it", async () => {
    fetchMeal.mockResolvedValueOnce(randomMeal);

    render(<App />);

    expect(await screen.findByText(randomMeal.strMeal)).toBeOnTheScreen();
    expect(screen.getByText(randomMeal.strInstructions)).toBeOnTheScreen();
    expect(screen.getByTestId("mealImage").props.source).toEqual({
      uri: randomMeal.strMealThumb,
    });
    expect(fetchMeal).toHaveBeenCalledTimes(1);
    expect(fetchMeal).toHaveBeenCalledWith("");
    expect(screen.queryByText("No meal was found")).not.toBeOnTheScreen();
  });

  it("shows 'No meal was found' while there is no meal", async () => {
    fetchMeal.mockResolvedValueOnce(null);

    render(<App />);

    // до відповіді сервісу meal === null → показано заглушку
    expect(screen.getByText("No meal was found")).toBeOnTheScreen();
    await waitFor(() => expect(fetchMeal).toHaveBeenCalledTimes(1));
    // після відповіді null заглушка залишається
    expect(screen.getByText("No meal was found")).toBeOnTheScreen();
    expect(screen.queryByTestId("mealImage")).not.toBeOnTheScreen();
  });

  it("searches by the entered name, shows the found meal and clears the input", async () => {
    fetchMeal
      .mockResolvedValueOnce(randomMeal)
      .mockResolvedValueOnce(foundMeal);
    render(<App />);
    await screen.findByText(randomMeal.strMeal);
    const input = screen.getByPlaceholderText("Enter a meal name");

    fireEvent.changeText(input, "Pizza");
    expect(input.props.value).toBe("Pizza");
    fireEvent.press(screen.getByText("Get Meal"));

    expect(await screen.findByText(foundMeal.strMeal)).toBeOnTheScreen();
    expect(fetchMeal).toHaveBeenCalledTimes(2);
    expect(fetchMeal).toHaveBeenLastCalledWith("Pizza");
    expect(screen.queryByText(randomMeal.strMeal)).not.toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Enter a meal name").props.value).toBe(
        "",
      ),
    );
  });

  it("fetches a new random meal when the button is pressed with an empty input", async () => {
    const anotherRandom = { ...randomMeal, strMeal: "Another Random Meal" };
    fetchMeal
      .mockResolvedValueOnce(randomMeal)
      .mockResolvedValueOnce(anotherRandom);
    render(<App />);
    await screen.findByText(randomMeal.strMeal);

    fireEvent.press(screen.getByText("Get Meal"));

    expect(await screen.findByText("Another Random Meal")).toBeOnTheScreen();
    expect(fetchMeal).toHaveBeenCalledTimes(2);
    expect(fetchMeal).toHaveBeenLastCalledWith("");
  });

  it("shows 'No meal was found' when the search returns nothing", async () => {
    fetchMeal
      .mockResolvedValueOnce(randomMeal)
      .mockResolvedValueOnce(undefined);
    render(<App />);
    await screen.findByText(randomMeal.strMeal);

    fireEvent.changeText(
      screen.getByPlaceholderText("Enter a meal name"),
      "qwerty",
    );
    fireEvent.press(screen.getByText("Get Meal"));

    expect(await screen.findByText("No meal was found")).toBeOnTheScreen();
    expect(fetchMeal).toHaveBeenLastCalledWith("qwerty");
    expect(screen.queryByText(randomMeal.strMeal)).not.toBeOnTheScreen();
  });
});
