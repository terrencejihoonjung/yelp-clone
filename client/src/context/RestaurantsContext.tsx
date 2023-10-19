import { useContext, createContext } from "react";

export type Restaurant = {
  readonly id: number;
  name: string;
  location: string;
  price_range: number;
  restaurant_id: number;
  review_count: number;
  avg_rating: number;
};

export type RestaurantProps = {
  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
};

export const RestaurantsContext = createContext<RestaurantProps>({
  restaurants: [],
  setRestaurants: () => [],
});

export const useRestaurantsContext = () => useContext(RestaurantsContext);
