import { Product } from "./product.types";

export type Epic = {
  id: number;
  name: string;
  product_id: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
};
