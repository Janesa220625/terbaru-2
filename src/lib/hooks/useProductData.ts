import { useState, useEffect } from "react";
import { loadFromLocalStorage } from "@/lib/storage";

// Product interface
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  pairsPerBox: number;
  sizes: string;
  colors: string;
}

// Box/Delivery item interface
export interface DeliveryItem {
  id: string;
  date: string;
  sku: string;
  boxCount: number;
  pairsPerBox: number;
  totalPairs: number;
}

// Alias for clarity
export type BoxItem = DeliveryItem;

/**
 * Hook to load and manage product and box data
 * @returns Product and box data with error state
 */
export function useProductData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Load boxes from IncomingBoxStock data in localStorage
      const fetchedBoxes = loadFromLocalStorage<BoxItem[]>(
        "warehouse-deliveries",
        [
          {
            id: "1001",
            date: new Date(Date.now() - 86400000).toISOString(),
            sku: "SKU-123-BLK",
            boxCount: 5,
            pairsPerBox: 6,
            totalPairs: 30,
          },
          {
            id: "1002",
            date: new Date(Date.now() - 2 * 86400000).toISOString(),
            sku: "SKU-456-RED",
            boxCount: 10,
            pairsPerBox: 8,
            totalPairs: 80,
          },
          {
            id: "1003",
            date: new Date(Date.now() - 3 * 86400000).toISOString(),
            sku: "SKU-789-BRN",
            boxCount: 15,
            pairsPerBox: 10,
            totalPairs: 150,
          },
        ],
      );

      // Load products from localStorage
      const fetchedProducts = loadFromLocalStorage<Product[]>(
        "warehouse-products",
        [
          {
            id: "1",
            sku: "SKU-123-BLK",
            name: "Men's Casual Shoes",
            category: "men_shoes",
            pairsPerBox: 6,
            sizes: "40,41,42,43,44,45",
            colors: "Black,Brown,Navy",
          },
          {
            id: "2",
            sku: "SKU-456-RED",
            name: "Women's Heels",
            category: "women_shoes",
            pairsPerBox: 8,
            sizes: "36,37,38,39,40",
            colors: "Red,Black,Beige",
          },
          {
            id: "3",
            sku: "SKU-789-BRN",
            name: "Men's Sandals",
            category: "men_sandals",
            pairsPerBox: 10,
            sizes: "39,40,41,42,43,44",
            colors: "Brown,Black",
          },
          {
            id: "4",
            sku: "SKU-101-WHT",
            name: "Women's Sandals",
            category: "women_sandals",
            pairsPerBox: 12,
            sizes: "36,37,38,39,40",
            colors: "White,Pink,Blue",
          },
          {
            id: "5",
            sku: "SKU-202-BLU",
            name: "Kids' Sport Shoes",
            category: "kids_shoes",
            pairsPerBox: 8,
            sizes: "28,29,30,31,32,33,34",
            colors: "Blue,Red,Green",
          },
        ],
      );

      setBoxes(fetchedBoxes);
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Error fetching data:", err);
    }
  }, []);

  // Helper function to get product details by SKU
  const getProductForSku = (sku: string): Product | undefined => {
    return products.find((product) => product.sku === sku);
  };

  return { products, boxes, error, getProductForSku };
}
