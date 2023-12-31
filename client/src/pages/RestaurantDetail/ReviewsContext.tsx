import { useContext, createContext } from "react";

export type Review = {
  name: string;
  rating: number;
  review: string;
  date: Date;
  readonly user_id: number;
  author: string;
  likes: number;
  readonly id: number;
  readonly restaurant_id: number;
};

export type ReviewLiker = {
  username: string;
  id: number;
};

export type SortedReviewProps = {
  sortedReviews: Review[];
};

export type ReviewProps = {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
};

export const ReviewsContext = createContext<ReviewProps>({
  reviews: [],
  setReviews: () => [],
});

export const useReviewsContext = () => useContext(ReviewsContext);
