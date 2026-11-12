import axios from "axios";

import { fetchMeal, apiURL } from "../services/mealService";

// Підміняємо весь модуль axios: жодного реального запиту в мережу
jest.mock("axios");

const meal = {
  idMeal: "52771",
  strMeal: "Spicy Arrabiata Penne",
  strMealThumb:
    "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  strInstructions: "Bring a large pot of water to a boil.",
};

describe("mealService.fetchMeal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exports the base URL of TheMealDB API", () => {
    expect(apiURL).toBe("https://www.themealdb.com/api/json/v1/1/");
  });

  it("requests a random meal when the search query is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { meals: [meal] } });

    const result = await fetchMeal("");

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${apiURL}random.php`);
    expect(result).toEqual(meal);
  });

  it("requests a random meal when the search query is not passed at all", async () => {
    axios.get.mockResolvedValueOnce({ data: { meals: [meal] } });

    await fetchMeal();

    expect(axios.get).toHaveBeenCalledWith(`${apiURL}random.php`);
  });

  it("searches by name when the search query is provided", async () => {
    axios.get.mockResolvedValueOnce({ data: { meals: [meal] } });

    const result = await fetchMeal("Arrabiata");

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${apiURL}search.php?s=Arrabiata`);
    expect(result).toEqual(meal);
  });

  it("returns only the first meal when the server finds several", async () => {
    const second = { ...meal, idMeal: "1", strMeal: "Second meal" };
    axios.get.mockResolvedValueOnce({ data: { meals: [meal, second] } });

    const result = await fetchMeal("a");

    expect(result).toEqual(meal);
  });

  it("returns undefined when nothing is found (meals is null)", async () => {
    // Саме так відповідає TheMealDB, коли страву не знайдено
    axios.get.mockResolvedValueOnce({ data: { meals: null } });

    const result = await fetchMeal("no-such-meal");

    expect(result).toBeUndefined();
  });

  it("returns undefined when the response has no data", async () => {
    axios.get.mockResolvedValueOnce({});

    expect(await fetchMeal("x")).toBeUndefined();
  });

  it("returns undefined when the response itself is undefined", async () => {
    axios.get.mockResolvedValueOnce(undefined);

    expect(await fetchMeal("x")).toBeUndefined();
  });

  it("returns null and logs the error when the request fails", async () => {
    const error = new Error("Network Error");
    axios.get.mockRejectedValueOnce(error);
    // Глушимо console.error, щоб не засмічувати вивід, і водночас стежимо за ним
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await fetchMeal("Arrabiata");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });
});
