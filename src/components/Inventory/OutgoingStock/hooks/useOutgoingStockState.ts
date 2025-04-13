import { useState, useEffect } from "react";
import { format } from "date-fns";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import { useStockUnits } from "@/lib/hooks/useStockUnits";
import { generateUUID } from "@/lib/utils/uuidUtils";
import { AggregatedStockItem } from "../../SingleWarehouseStock";
import {
  OutgoingStockDocument,
  OutgoingStockItem,
} from "../OutgoingDocumentList";
import { Recipient } from "../../RecipientManagement";

interface StockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  stockLevel: "low" | "medium" | "high";
}

interface SelectedStockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

interface QuickAddRecipientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export const useOutgoingStockState = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Outgoing stock functionality state
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [outgoingDocuments, setOutgoingDocuments] = useState<
    OutgoingStockDocument[]
  >([]);
  const [selectedOutgoingDocument, setSelectedOutgoingDocument] =
    useState<OutgoingStockDocument | null>(null);
  const [isViewOutgoingDialogOpen, setIsViewOutgoingDialogOpen] =
    useState(false);
  const [availableStock, setAvailableStock] = useState<AggregatedStockItem[]>(
    [],
  );
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [selectedStockItems, setSelectedStockItems] = useState<
    SelectedStockItem[]
  >([]);

  // Mass upload functionality state
  const [isMassUploadDialogOpen, setIsMassUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadValidationData, setUploadValidationData] = useState<{
    validItems: any[];
    invalidItems: any[];
  } | null>(null);
  const [showValidationResults, setShowValidationResults] = useState(false);
  const [processingUpload, setProcessingUpload] = useState(false);

  // New outgoing document form state
  // Define document number generation before using it
  const documentNumber = `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [newOutgoingDocument, setNewOutgoingDocument] = useState({
    documentNumber: documentNumber,
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm:ss"),
    recipientId: "",
    recipient: "",
    notes: "",
    items: [] as OutgoingStockItem[],
  });

  // Recipients state
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] =
    useState(false);

  // Quick add recipient form state
  const [quickAddRecipientForm, setQuickAddRecipientForm] =
    useState<QuickAddRecipientFormData>({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });

  // Get stock units hook with all necessary functions
  const { stockUnits } = useStockUnits();

  // Function to generate a new document number
  function generateDocumentNumber() {
    return `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

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

      // Set initial document number
      setNewOutgoingDocument((prev) => ({
        ...prev,
        documentNumber: generateDocumentNumber(),
      }));

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

  return {
    // State
    stockItems,
    searchTerm,
    isIssueDialogOpen,
    outgoingDocuments,
    selectedOutgoingDocument,
    isViewOutgoingDialogOpen,
    availableStock,
    stockSearchTerm,
    selectedStockItems,
    isMassUploadDialogOpen,
    isUploading,
    uploadError,
    uploadValidationData,
    showValidationResults,
    processingUpload,
    newOutgoingDocument,
    recipients,
    isAddRecipientDialogOpen,
    quickAddRecipientForm,
    stockUnits,

    // Setters
    setStockItems,
    setSearchTerm,
    setIsIssueDialogOpen,
    setOutgoingDocuments,
    setSelectedOutgoingDocument,
    setIsViewOutgoingDialogOpen,
    setAvailableStock,
    setStockSearchTerm,
    setSelectedStockItems,
    setIsMassUploadDialogOpen,
    setIsUploading,
    setUploadError,
    setUploadValidationData,
    setShowValidationResults,
    setProcessingUpload,
    setNewOutgoingDocument,
    setRecipients,
    setIsAddRecipientDialogOpen,
    setQuickAddRecipientForm,

    // Utility functions
    generateDocumentNumber,
  };
};
