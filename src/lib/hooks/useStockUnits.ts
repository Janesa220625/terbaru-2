import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

// Stock unit interface
export interface StockUnitItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  boxId: string;
  dateAdded: Date | string; // Date when the stock unit was added (can be Date object or ISO string)
  addedBy?: string; // User who added the stock unit
  lastModified?: Date | string; // Date when the stock unit was last modified
  modifiedBy?: string; // User who last modified the stock unit
  manufactureDate?: Date | string; // Date when the product was manufactured
}

// Box stock interface
interface BoxStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  boxCount: number;
  pairsPerBox: number;
  totalPairs: number;
  stockLevel: "low" | "medium" | "high";
}

/**
 * Calculate the number of boxes to reduce based on pairs allocated
 * @param pairsAllocated Number of pairs allocated
 * @param pairsPerBox Number of pairs per box
 * @returns Number of boxes to reduce (rounded up)
 */
const calculateBoxesToReduce = (
  pairsAllocated: number,
  pairsPerBox: number,
): number => {
  if (pairsPerBox <= 0) return 0;
  // Calculate how many boxes are needed for the allocated pairs (round up)
  return Math.ceil(pairsAllocated / pairsPerBox);
};

/**
 * Update box stock after allocating stock units
 * @param sku SKU code to update
 * @param pairsAllocated Number of pairs allocated
 */
const updateBoxStock = async (
  sku: string,
  pairsAllocated: number,
): Promise<void> => {
  try {
    // Load current box stock
    const { data: boxStock } = await loadFromStorage<BoxStockItem[]>(
      "warehouse-box-stock",
      [],
    );

    // Find the box stock item for this SKU
    const boxStockItem = boxStock.find(
      (item) => item.sku.toLowerCase() === sku.toLowerCase(),
    );

    if (!boxStockItem) return; // No box stock found for this SKU

    // Calculate boxes to reduce
    const boxesToReduce = calculateBoxesToReduce(
      pairsAllocated,
      boxStockItem.pairsPerBox,
    );

    // Update box stock
    const updatedBoxStock = boxStock.map((item) => {
      if (item.sku.toLowerCase() === sku.toLowerCase()) {
        // Ensure we don't go below zero
        const newBoxCount = Math.max(0, item.boxCount - boxesToReduce);
        const newTotalPairs = newBoxCount * item.pairsPerBox;

        // Calculate new stock level
        let newStockLevel: "low" | "medium" | "high" = "low";
        if (newBoxCount > 30) newStockLevel = "high";
        else if (newBoxCount > 15) newStockLevel = "medium";

        return {
          ...item,
          boxCount: newBoxCount,
          totalPairs: newTotalPairs,
          stockLevel: newStockLevel,
        };
      }
      return item;
    });

    // Save updated box stock
    await saveToStorage("warehouse-box-stock", updatedBoxStock);
  } catch (error) {
    console.error("Error updating box stock:", error);
  }
};

/**
 * Hook to manage stock units data
 * @returns Stock units data and operations
 */
export function useStockUnits() {
  const [stockUnits, setStockUnits] = useState<StockUnitItem[]>([]);

  // Load initial stock units data
  useEffect(() => {
    const loadStockUnits = async () => {
      try {
        const defaultStockUnits = [
          {
            id: "u1001",
            sku: "SKU-101-BLK",
            size: "40",
            color: "Black",
            quantity: 10,
            boxId: "1001",
            dateAdded: new Date(2023, 5, 15, 9, 30), // June 15, 2023, 9:30 AM
            addedBy: "System",
          },
          {
            id: "u1002",
            sku: "SKU-101-BLK",
            size: "41",
            color: "Black",
            quantity: 10,
            boxId: "1001",
            dateAdded: new Date(2023, 5, 15, 9, 45), // June 15, 2023, 9:45 AM
            addedBy: "System",
          },
          {
            id: "u1003",
            sku: "SKU-101-BLK",
            size: "42",
            color: "Black",
            quantity: 10,
            boxId: "1001",
            dateAdded: new Date(2023, 5, 15, 10, 0), // June 15, 2023, 10:00 AM
            addedBy: "System",
          },
          {
            id: "u1004",
            sku: "SKU-102-BLK",
            size: "39",
            color: "Brown",
            quantity: 15,
            boxId: "1002",
            dateAdded: new Date(2023, 6, 20, 14, 15), // July 20, 2023, 2:15 PM
            addedBy: "System",
          },
          {
            id: "u1005",
            sku: "SKU-102-BLK",
            size: "40",
            color: "Brown",
            quantity: 15,
            boxId: "1002",
            dateAdded: new Date(2023, 6, 20, 14, 30), // July 20, 2023, 2:30 PM
            addedBy: "System",
          },
          {
            id: "u1006",
            sku: "SKU-102-BLK",
            size: "41",
            color: "Brown",
            quantity: 15,
            boxId: "1002",
            dateAdded: new Date(2023, 6, 20, 14, 45), // July 20, 2023, 2:45 PM
            addedBy: "System",
          },
          {
            id: "u1007",
            sku: "SKU-102-BLK",
            size: "42",
            color: "Brown",
            quantity: 15,
            boxId: "1002",
            dateAdded: new Date(2023, 6, 20, 15, 0), // July 20, 2023, 3:00 PM
            addedBy: "System",
          },
        ];

        const { data: savedStockUnits } = await loadFromStorage<
          StockUnitItem[]
        >("warehouse-stock-units", defaultStockUnits);
        setStockUnits(savedStockUnits);
      } catch (error) {
        console.error("Error loading stock units:", error);
        // Set default empty array if loading fails
        setStockUnits([]);
      }
    };

    loadStockUnits();
  }, []);

  // Add new stock units
  const addStockUnits = async (
    newUnits: Omit<StockUnitItem, "id" | "dateAdded">[],
  ) => {
    if (newUnits.length === 0) return;

    const currentDate = new Date();
    // Default user name if not provided
    const defaultUser = "Warehouse Staff";

    const newStockUnits = newUnits.map((unit, index) => ({
      ...unit,
      id: `u${1000 + stockUnits.length + 1 + index}`,
      dateAdded: unit.dateAdded || currentDate,
      addedBy: unit.addedBy || defaultUser,
    })) as StockUnitItem[];

    const updatedStockUnits = [...stockUnits, ...newStockUnits];
    setStockUnits(updatedStockUnits);

    try {
      await saveToStorage("warehouse-stock-units", updatedStockUnits);

      // Group new units by SKU to update box stock
      const skuQuantities: Record<string, number> = {};

      // Calculate total quantity for each SKU
      newUnits.forEach((unit) => {
        const sku = unit.sku.toLowerCase();
        if (!skuQuantities[sku]) {
          skuQuantities[sku] = 0;
        }
        skuQuantities[sku] += unit.quantity;
      });

      // Update box stock for each SKU
      for (const [sku, quantity] of Object.entries(skuQuantities)) {
        await updateBoxStock(sku, quantity);
      }

      return updatedStockUnits;
    } catch (error) {
      console.error("Error saving stock units:", error);
      return updatedStockUnits;
    }
  };

  // Update an existing stock unit
  const updateStockUnit = async (
    updatedUnit: StockUnitItem,
    userName: string = "Warehouse Staff",
  ) => {
    const currentDate = new Date();

    // Find the original unit to calculate quantity difference
    const originalUnit = stockUnits.find((unit) => unit.id === updatedUnit.id);
    if (!originalUnit) {
      console.error(`Stock unit with ID ${updatedUnit.id} not found`);
      return stockUnits;
    }

    const quantityDifference = updatedUnit.quantity - originalUnit.quantity;

    // Skip update if no change in quantity
    if (
      quantityDifference === 0 &&
      updatedUnit.quantity === originalUnit.quantity
    ) {
      return stockUnits;
    }

    // Log the update for debugging
    console.log(
      `Updating stock unit: ${originalUnit.sku} (${originalUnit.color}, ${originalUnit.size}) from ${originalUnit.quantity} to ${updatedUnit.quantity}`,
    );

    const updatedStockUnits = stockUnits.map((unit) => {
      if (unit.id === updatedUnit.id) {
        return {
          ...updatedUnit,
          // Preserve the original dateAdded field
          dateAdded: originalUnit.dateAdded,
          // Update the lastModified and modifiedBy fields
          lastModified: updatedUnit.lastModified || currentDate,
          modifiedBy: updatedUnit.modifiedBy || userName,
        };
      }
      return unit;
    });

    setStockUnits(updatedStockUnits);

    try {
      await saveToStorage("warehouse-stock-units", updatedStockUnits);

      // If quantity decreased, update box stock
      if (quantityDifference < 0) {
        // When quantity decreases (outgoing stock), we need to update box stock
        // The absolute value of the difference is passed to ensure proper calculation
        await updateBoxStock(updatedUnit.sku, Math.abs(quantityDifference));
      } else if (quantityDifference > 0) {
        // If quantity increased, also update box stock but with different logic
        // This might happen when returning items or correcting inventory
        await updateBoxStock(updatedUnit.sku, quantityDifference);
      }

      return updatedStockUnits;
    } catch (error) {
      console.error("Error updating stock unit:", error);
      return updatedStockUnits;
    }
  };

  // Delete a stock unit
  const deleteStockUnit = async (unitId: string) => {
    const unitToDelete = stockUnits.find((unit) => unit.id === unitId);
    if (!unitToDelete) return stockUnits;

    const updatedStockUnits = stockUnits.filter((unit) => unit.id !== unitId);
    setStockUnits(updatedStockUnits);

    try {
      await saveToStorage("warehouse-stock-units", updatedStockUnits);
      return updatedStockUnits;
    } catch (error) {
      console.error("Error deleting stock unit:", error);
      return updatedStockUnits;
    }
  };

  // Group stock units by SKU for display
  const stockBySku = stockUnits.reduce(
    (acc, unit) => {
      if (!acc[unit.sku]) {
        acc[unit.sku] = [];
      }
      acc[unit.sku].push(unit);
      return acc;
    },
    {} as Record<string, StockUnitItem[]>,
  );

  return {
    stockUnits,
    setStockUnits,
    addStockUnits,
    updateStockUnit,
    deleteStockUnit,
    stockBySku,
    calculateBoxesToReduce, // Export for testing/debugging
    updateBoxStock, // Export for direct use if needed
  };
}
