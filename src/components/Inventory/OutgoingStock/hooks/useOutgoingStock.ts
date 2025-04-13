import { useState, useEffect } from "react";
import { format } from "date-fns";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import { AggregatedStockItem } from "../../SingleWarehouseStock";
import { Recipient } from "../../RecipientManagement";
import { generateUUID } from "@/lib/utils/uuidUtils";
import {
  OutgoingStockDocument,
  OutgoingStockItem,
} from "../OutgoingDocumentList";

interface SelectedStockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

interface StockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  stockLevel: "low" | "medium" | "high";
}

export const useOutgoingStock = (stockUnits: any[]) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [outgoingDocuments, setOutgoingDocuments] = useState<
    OutgoingStockDocument[]
  >([]);
  const [availableStock, setAvailableStock] = useState<AggregatedStockItem[]>(
    [],
  );
  const [selectedStockItems, setSelectedStockItems] = useState<
    SelectedStockItem[]
  >([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Generate a document number
  const generateDocumentNumber = () => {
    return `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // Calculate aggregated stock from stockUnits
  useEffect(() => {
    if (stockUnits.length === 0) return;

    // Aggregate stock units by SKU, color, and size
    const aggregated: Record<string, AggregatedStockItem> = {};

    stockUnits.forEach((unit) => {
      // Normalize color to lowercase for consistent matching
      const normalizedColor = unit.color.toLowerCase();
      const key = `${unit.sku}-${normalizedColor}-${unit.size}`;

      if (!aggregated[key]) {
        // Extract base SKU for display name
        const baseSku = unit.sku.includes("-")
          ? unit.sku.split("-").slice(0, 3).join("-")
          : unit.sku;

        aggregated[key] = {
          id: key,
          sku: unit.sku,
          name: baseSku,
          category: "unknown", // This would ideally come from product data
          size: unit.size,
          color: unit.color,
          totalPairs: 0,
        };
      }

      aggregated[key].totalPairs += unit.quantity;
    });

    // Also account for outgoing documents to ensure consistency
    const outgoingDocs = loadFromLocalStorage<any[]>(
      "warehouse-outgoing-documents",
      [],
    );

    outgoingDocs.forEach((doc) => {
      if (doc.items && Array.isArray(doc.items)) {
        doc.items.forEach((item: any) => {
          // Normalize color to lowercase for consistent matching
          const normalizedColor = item.color.toLowerCase();
          // Extract the base SKU without size and color variations
          const baseSku = item.sku.split("-").slice(0, 3).join("-");

          // Try exact match first
          let key = `${item.sku}-${normalizedColor}-${item.size}`;

          // If exact key doesn't exist, try to find a matching key with the base SKU
          if (!aggregated[key]) {
            const matchingKeys = Object.keys(aggregated).filter((k) => {
              const parts = k.split("-");
              const keyBaseSku = parts.slice(0, 3).join("-");
              const keySize = aggregated[k].size;
              const keyColor = aggregated[k].color.toLowerCase();

              return (
                keyBaseSku.toLowerCase() === baseSku.toLowerCase() &&
                keySize === item.size &&
                keyColor === normalizedColor
              );
            });

            if (matchingKeys.length > 0) {
              key = matchingKeys[0]; // Use the first matching key
            }
          }

          if (aggregated[key]) {
            // Subtract the outgoing quantity, ensuring we don't go below zero
            aggregated[key].totalPairs = Math.max(
              0,
              aggregated[key].totalPairs - item.quantity,
            );
          }
        });
      }
    });

    // Update available stock
    setAvailableStock(Object.values(aggregated));

    // Save to localStorage for potential use elsewhere
    saveToLocalStorage("warehouse-aggregated-stock", Object.values(aggregated));
  }, [stockUnits]);

  // Load initial data
  useEffect(() => {
    try {
      // Load outgoing documents from localStorage
      const savedOutgoingDocuments = loadFromLocalStorage<
        OutgoingStockDocument[]
      >("warehouse-outgoing-documents", []);
      setOutgoingDocuments(savedOutgoingDocuments);

      // Load recipients from localStorage
      const savedRecipients = loadFromLocalStorage<Recipient[]>(
        "warehouse-recipients",
        [],
      );
      setRecipients(savedRecipients);

      // Load stock items from localStorage
      const savedStockItems = loadFromLocalStorage<StockItem[]>(
        "warehouse-unit-stock",
        [
          // Default stock items if none are found
          {
            id: "1",
            sku: "SKU-123-BLK-40",
            name: "Men's Casual Shoes",
            size: "40",
            color: "Black",
            quantity: 45,
            stockLevel: "high",
          },
          // ... other default items
        ],
      );
      setStockItems(savedStockItems);
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Set default values if loading fails
      setOutgoingDocuments([]);
      setStockItems([]);
      setRecipients([]);
    }
  }, []);

  const addStockItemToOutgoing = (item: AggregatedStockItem) => {
    // Check if item is already in the selected items
    const existingItemIndex = selectedStockItems.findIndex(
      (i) => i.id === item.id,
    );

    if (existingItemIndex >= 0) {
      // Item already exists, increment quantity if possible
      const updatedItems = [...selectedStockItems];
      if (
        updatedItems[existingItemIndex].quantity <
        updatedItems[existingItemIndex].maxQuantity
      ) {
        updatedItems[existingItemIndex].quantity += 1;
        setSelectedStockItems(updatedItems);
      }
    } else {
      // Add new item
      setSelectedStockItems([
        ...selectedStockItems,
        {
          id: item.id,
          sku: item.sku,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: 1,
          maxQuantity: item.totalPairs,
        },
      ]);
    }
  };

  const removeStockItemFromOutgoing = (itemId: string) => {
    setSelectedStockItems(
      selectedStockItems.filter((item) => item.id !== itemId),
    );
  };

  const updateStockItemQuantity = (itemId: string, quantity: number) => {
    const updatedItems = selectedStockItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: Math.min(Math.max(1, quantity), item.maxQuantity),
        };
      }
      return item;
    });
    setSelectedStockItems(updatedItems);
  };

  const createOutgoingDocument = (
    recipientId: string,
    recipientName: string,
    notes: string,
  ) => {
    if (!recipientId || selectedStockItems.length === 0) {
      return false;
    }

    // Normalize selected items to ensure consistent format
    const normalizedSelectedItems = selectedStockItems.map((item) => ({
      ...item,
      color: item.color.toLowerCase(),
      sku: item.sku.trim(),
    }));

    // Validate that all selected items have sufficient stock
    const insufficientStockItems = selectedStockItems.filter((item) => {
      const stockItem = availableStock.find((stock) => stock.id === item.id);
      return !stockItem || stockItem.totalPairs < item.quantity;
    });

    if (insufficientStockItems.length > 0) {
      // Show error or alert about insufficient stock
      console.error(
        "Insufficient stock for some items",
        insufficientStockItems,
      );
      return false;
    }

    const outgoingItems = normalizedSelectedItems.map((item) => ({
      id: generateUUID(),
      sku: item.sku,
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    const totalItems = outgoingItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const newDocument: OutgoingStockDocument = {
      id: generateUUID(),
      documentNumber: generateDocumentNumber(),
      recipientId,
      recipient: recipientName,
      date: new Date().toISOString(),
      time: format(new Date(), "HH:mm:ss"),
      items: outgoingItems,
      totalItems,
      notes,
    };

    // Save the new document
    const updatedDocuments = [...outgoingDocuments, newDocument];
    setOutgoingDocuments(updatedDocuments);
    saveToLocalStorage("warehouse-outgoing-documents", updatedDocuments);

    // Clear selected items
    setSelectedStockItems([]);

    return newDocument;
  };

  return {
    stockItems,
    availableStock,
    selectedStockItems,
    outgoingDocuments,
    recipients,
    addStockItemToOutgoing,
    removeStockItemFromOutgoing,
    updateStockItemQuantity,
    createOutgoingDocument,
  };
};
