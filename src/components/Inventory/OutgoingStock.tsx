import React, { useState, useEffect, useRef } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Plus,
  Printer,
  FileText,
  X,
  ClipboardList,
  Upload,
  Download,
  AlertCircle,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AggregatedStockItem } from "./SingleWarehouseStock";
import { useStockUnits, StockUnitItem } from "@/lib/hooks/useStockUnits";
import { printOutgoingStockDocument } from "@/lib/utils/printUtils";
import {
  generateOutgoingStockExcelTemplate,
  parseOutgoingStockExcelTemplate,
} from "@/lib/utils/excelUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ValidationDisplay, { ValidationItem } from "./ValidationDisplay";
import { Recipient } from "./RecipientManagement";

// Using a simple UUID generator since the imported one might cause issues
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface StockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  stockLevel: "low" | "medium" | "high";
}

interface OutgoingStockItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface OutgoingStockDocument {
  id: string;
  documentNumber: string;
  date: string;
  time?: string; // Optional for backward compatibility
  recipientId?: string; // ID of the recipient from RecipientManagement
  recipient: string; // Name of the recipient (for backward compatibility)
  notes: string;
  items: OutgoingStockItem[];
  totalItems: number;
}

const OutgoingStock = () => {
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
    Array<{
      id: string;
      sku: string;
      name: string;
      size: string;
      color: string;
      quantity: number;
      maxQuantity: number;
    }>
  >([]);

  // Mass upload functionality state
  const [isMassUploadDialogOpen, setIsMassUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadValidationData, setUploadValidationData] = useState<{
    validItems: any[];
    invalidItems: any[];
  } | null>(null);
  const [showValidationResults, setShowValidationResults] = useState(false);
  const [processingUpload, setProcessingUpload] = useState(false);

  // New outgoing document form state
  const [newOutgoingDocument, setNewOutgoingDocument] = useState({
    documentNumber: `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: format(new Date(), "yyyy-MM-dd"), // Automatically set to current date
    time: format(new Date(), "HH:mm:ss"), // Also track time
    recipientId: "", // ID of the selected recipient
    recipient: "", // Name of the recipient (for display and backward compatibility)
    notes: "",
    items: [] as OutgoingStockItem[],
  });

  // Recipients state
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] =
    useState(false);
  // Quick add recipient form state
  const [quickAddRecipientForm, setQuickAddRecipientForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Get stock units hook with all necessary functions
  const { stockUnits, updateStockUnit, addStockUnits, deleteStockUnit } =
    useStockUnits();

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
    const outgoingDocuments = loadFromLocalStorage<any[]>(
      "warehouse-outgoing-documents",
      [],
    );

    outgoingDocuments.forEach((doc) => {
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

  // Function to generate a new document number
  const generateDocumentNumber = () => {
    return `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

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
          {
            id: "1",
            sku: "SKU-123-BLK-40",
            name: "Men's Casual Shoes",
            size: "40",
            color: "Black",
            quantity: 45,
            stockLevel: "high",
          },
          {
            id: "2",
            sku: "SKU-123-BLK-41",
            name: "Men's Casual Shoes",
            size: "41",
            color: "Black",
            quantity: 38,
            stockLevel: "high",
          },
          {
            id: "3",
            sku: "SKU-456-RED-37",
            name: "Women's Heels",
            size: "37",
            color: "Red",
            quantity: 22,
            stockLevel: "medium",
          },
          {
            id: "4",
            sku: "SKU-456-RED-38",
            name: "Women's Heels",
            size: "38",
            color: "Red",
            quantity: 18,
            stockLevel: "medium",
          },
          {
            id: "5",
            sku: "SKU-789-BRN-42",
            name: "Men's Sandals",
            size: "42",
            color: "Brown",
            quantity: 8,
            stockLevel: "low",
          },
          {
            id: "6",
            sku: "SKU-101-WHT-36",
            name: "Women's Sandals",
            size: "36",
            color: "White",
            quantity: 12,
            stockLevel: "low",
          },
          {
            id: "7",
            sku: "SKU-202-BLU-30",
            name: "Kids' Sport Shoes",
            size: "30",
            color: "Blue",
            quantity: 15,
            stockLevel: "medium",
          },
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

  const filteredAvailableStock = availableStock.filter(
    (item) =>
      item.sku.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(stockSearchTerm.toLowerCase()),
  );

  const handleAddStockItemToOutgoing = (item: AggregatedStockItem) => {
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

  const handleRemoveStockItemFromOutgoing = (itemId: string) => {
    setSelectedStockItems(
      selectedStockItems.filter((item) => item.id !== itemId),
    );
  };

  const handleUpdateStockItemQuantity = (itemId: string, quantity: number) => {
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

  const handleCreateOutgoingDocument = () => {
    if (!newOutgoingDocument.recipientId || selectedStockItems.length === 0) {
      return;
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
      return;
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

    // Always use current date/time when creating the document
    const currentDate = new Date();
    // Find the recipient name from the selected recipient ID
    const selectedRecipient = recipients.find(
      (r) => r.id === newOutgoingDocument.recipientId,
    );
    const recipientName = selectedRecipient
      ? selectedRecipient.name
      : newOutgoingDocument.recipient;

    const newOutgoingDoc: OutgoingStockDocument = {
      id: generateUUID(),
      documentNumber: newOutgoingDocument.documentNumber,
      date: format(currentDate, "yyyy-MM-dd"),
      time: format(currentDate, "HH:mm:ss"),
      recipientId: newOutgoingDocument.recipientId,
      recipient: recipientName,
      notes: newOutgoingDocument.notes,
      items: outgoingItems,
      totalItems,
    };

    const updatedOutgoingDocuments = [newOutgoingDoc, ...outgoingDocuments];
    setOutgoingDocuments(updatedOutgoingDocuments);
    saveToLocalStorage(
      "warehouse-outgoing-documents",
      updatedOutgoingDocuments,
    );

    // We no longer update Stock Units or Box Stock directly from Outgoing Stock
    // Instead, we'll just log the outgoing transaction for reference
    console.log(
      `Created outgoing document #${newOutgoingDoc.documentNumber} with ${newOutgoingDoc.totalItems} items for ${newOutgoingDoc.recipient}`,
    );

    // Log each item in the outgoing document for debugging purposes
    normalizedSelectedItems.forEach((item) => {
      console.log(
        `Outgoing item: SKU: ${item.sku}, Size: ${item.size}, Color: ${item.color}, Quantity: ${item.quantity}`,
      );
    });

    // Note: The stock reduction now only affects SingleWarehouseStock which reads from
    // the outgoingDocuments in localStorage to calculate available stock

    // Reset form with a new document number and current date/time
    setNewOutgoingDocument({
      documentNumber: `AKS-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm:ss"),
      recipientId: "",
      recipient: "",
      notes: "",
      items: [],
    });
    setSelectedStockItems([]);
    setIsIssueDialogOpen(false);
  };

  // Function to handle creating outgoing documents from uploaded data
  const handleCreateOutgoingDocumentsFromUpload = () => {
    if (!uploadValidationData || uploadValidationData.validItems.length === 0)
      return;

    setProcessingUpload(true);

    try {
      // Group items by recipient to create separate documents
      const itemsByRecipient: Record<string, any[]> = {};

      uploadValidationData.validItems.forEach((item) => {
        const recipient = item.recipient || "Unknown Recipient";
        if (!itemsByRecipient[recipient]) {
          itemsByRecipient[recipient] = [];
        }
        itemsByRecipient[recipient].push(item);
      });

      // Create a document for each recipient
      const newDocuments: OutgoingStockDocument[] = [];

      Object.entries(itemsByRecipient).forEach(([recipient, items]) => {
        // Create outgoing items from the valid items
        const outgoingItems = items.map((item) => ({
          id: generateUUID(),
          sku: item.sku,
          name: item.name || item.sku.split("-").slice(0, 3).join("-"),
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }));

        const totalItems = outgoingItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        // Use the recipientId from the item if it exists, otherwise try to find a match
        let recipientId = items[0].recipientId || "";
        let recipientName = recipient;

        // If we don't have a recipientId yet, try to find a matching recipient by name
        if (!recipientId) {
          const matchingRecipient = recipients.find(
            (r) => r.name.toLowerCase() === recipient.toLowerCase(),
          );

          if (matchingRecipient) {
            recipientId = matchingRecipient.id;
            recipientName = matchingRecipient.name; // Use the exact case from the database
          }
        }

        // Create the document
        const newDocument: OutgoingStockDocument = {
          id: generateUUID(),
          documentNumber: generateDocumentNumber(),
          date: format(new Date(), "yyyy-MM-dd"),
          time: format(new Date(), "HH:mm:ss"),
          recipientId: recipientId, // Add the recipient ID if found
          recipient: recipientName,
          notes: items[0].notes || "", // Use notes from the first item or empty string
          items: outgoingItems,
          totalItems,
        };

        newDocuments.push(newDocument);
      });

      // Add the new documents to the existing ones
      const updatedOutgoingDocuments = [...newDocuments, ...outgoingDocuments];
      setOutgoingDocuments(updatedOutgoingDocuments);
      saveToLocalStorage(
        "warehouse-outgoing-documents",
        updatedOutgoingDocuments,
      );

      // Show success message
      const validItemsForDisplay = uploadValidationData.validItems.map(
        (item) => ({
          sku: item.sku,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          isValid: true,
        }),
      );

      const invalidItemsForDisplay = uploadValidationData.invalidItems.map(
        (item) => ({
          sku: item.sku || "Unknown SKU",
          size: item.size || "",
          color: item.color || "",
          quantity: item.quantity || 0,
          isValid: false,
          reason: item.reason || "Unknown error",
        }),
      );

      // Close the dialog and show validation results
      setIsMassUploadDialogOpen(false);
      setShowValidationResults(true);
      setUploadValidationData({
        validItems: validItemsForDisplay,
        invalidItems: invalidItemsForDisplay,
      });

      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = "";

      console.log(
        `Created ${newDocuments.length} outgoing documents with ${uploadValidationData.validItems.length} items`,
      );
    } catch (error) {
      console.error("Error creating outgoing documents:", error);
      setUploadError("Failed to create outgoing documents. Please try again.");
    } finally {
      setProcessingUpload(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Outgoing Stock</h2>
          <p className="text-muted-foreground">
            Manage stock issues and goods release
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              generateOutgoingStockExcelTemplate(availableStock, recipients)
            }
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsMassUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Mass Upload
          </Button>
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => setIsIssueDialogOpen(true)}
          >
            <ClipboardList className="h-4 w-4" />
            New Delivery
          </Button>
        </div>
      </div>

      {showValidationResults && uploadValidationData && (
        <ValidationDisplay
          validItems={uploadValidationData.validItems as ValidationItem[]}
          invalidItems={uploadValidationData.invalidItems as ValidationItem[]}
          onClose={() => setShowValidationResults(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Stock Issue Documents</CardTitle>
            <CardDescription>
              Manage stock issues and goods release
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-9 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value="all"
                  onValueChange={(value) => {
                    // Filter by recipient would go here
                    console.log("Filter by recipient:", value);
                  }}
                >
                  <SelectTrigger className="w-[200px] h-10">
                    <SelectValue placeholder="Filter by recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recipients</SelectItem>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {outgoingDocuments.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-slate-50">
                  <p className="text-muted-foreground">
                    No stock issue documents yet
                  </p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setIsIssueDialogOpen(true)}
                  >
                    Create your first delivery
                  </Button>
                </div>
              ) : (
                outgoingDocuments
                  .filter(
                    (document) =>
                      document.documentNumber
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      document.recipient
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center p-4 border rounded-md hover:bg-slate-50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={() => {
                        setSelectedOutgoingDocument(document);
                        setIsViewOutgoingDialogOpen(true);
                      }}
                    >
                      <div className="p-2 rounded-full bg-primary/10 mr-4">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            Document #{document.documentNumber}
                          </h3>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {document.time
                              ? `${new Date(document.date).toLocaleDateString()} ${document.time}`
                              : new Date(document.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {document.recipient}
                            </span>
                            {document.recipientId &&
                              recipients.find(
                                (r) => r.id === document.recipientId,
                              )?.phone && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {
                                    recipients.find(
                                      (r) => r.id === document.recipientId,
                                    )?.phone
                                  }
                                </span>
                              )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {document.totalItems} items
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issue Stock Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              New Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-md border shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-primary">
                  Delivery Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="documentNumber"
                      className="text-sm font-medium mb-2 block"
                    >
                      Document Number{" "}
                      <span className="text-xs text-muted-foreground ml-1">
                        (Auto-generated)
                      </span>
                    </Label>
                    <Input
                      id="documentNumber"
                      value={newOutgoingDocument.documentNumber}
                      className="h-10 text-base bg-slate-100 cursor-not-allowed font-mono text-sm"
                      disabled
                      readOnly
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="date"
                      className="text-sm font-medium mb-2 block"
                    >
                      Date & Time
                    </Label>
                    <div className="h-10 text-base bg-slate-100 p-2 rounded-md border">
                      {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically set to current date and time
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        htmlFor="recipient"
                        className="text-sm font-medium"
                      >
                        Recipient
                        <span className="text-xs text-amber-600 ml-2">
                          (Cannot be changed after creation)
                        </span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs flex items-center gap-1 text-primary"
                        onClick={() => setIsAddRecipientDialogOpen(true)}
                      >
                        <UserPlus className="h-3 w-3" />
                        Add New
                      </Button>
                    </div>
                    {recipients.length === 0 ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          id="recipient"
                          className="h-10 text-base"
                          value={newOutgoingDocument.recipient}
                          onChange={(e) =>
                            setNewOutgoingDocument({
                              ...newOutgoingDocument,
                              recipient: e.target.value,
                            })
                          }
                          placeholder="Enter recipient name"
                        />
                        <p className="text-xs text-amber-600">
                          No saved recipients found. Add recipients in the
                          Recipient Management module for easier selection.
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={newOutgoingDocument.recipientId}
                        onValueChange={(value) => {
                          const selectedRecipient = recipients.find(
                            (r) => r.id === value,
                          );
                          setNewOutgoingDocument({
                            ...newOutgoingDocument,
                            recipientId: value,
                            recipient: selectedRecipient
                              ? selectedRecipient.name
                              : "",
                          });
                        }}
                      >
                        <SelectTrigger className="h-10 text-base">
                          <SelectValue placeholder="Select a recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipients.map((recipient) => (
                            <SelectItem key={recipient.id} value={recipient.id}>
                              {recipient.name}
                              {recipient.phone && ` • ${recipient.phone}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium mb-2 block"
                    >
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      className="h-10 text-base"
                      value={newOutgoingDocument.notes}
                      onChange={(e) =>
                        setNewOutgoingDocument({
                          ...newOutgoingDocument,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Enter notes (optional)"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-5 bg-slate-50 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-primary">
                  Selected Items
                </h3>
                {selectedStockItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md border border-dashed border-slate-300 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No items selected yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select items from the available stock list
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {selectedStockItems.length > 0 && (
                      <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Total Items:{" "}
                          {selectedStockItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive/90"
                          onClick={() => setSelectedStockItems([])}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                    {selectedStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-white p-3.5 rounded-md border border-slate-200 shadow-sm hover:border-primary/30 transition-colors duration-200"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sku} | Size: {item.size} | Color: {item.color}
                          </p>
                          <div className="mt-1 text-xs">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-sm ${item.quantity === item.maxQuantity ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}
                            >
                              {item.quantity} of {item.maxQuantity} available
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-r-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStockItemQuantity(
                                  item.id,
                                  item.quantity - 1,
                                );
                              }}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              className="h-6 w-12 rounded-none text-center p-0 text-xs"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  handleUpdateStockItemQuantity(item.id, val);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-l-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStockItemQuantity(
                                  item.id,
                                  item.quantity + 1,
                                );
                              }}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveStockItemFromOutgoing(item.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-md shadow-sm">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-primary">
                  Available Stock
                </h3>
                <div className="relative w-[220px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9 h-10 text-base"
                    value={stockSearchTerm}
                    onChange={(e) => setStockSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 max-h-[450px] overflow-y-auto pr-3">
                {filteredAvailableStock.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-dashed border-slate-300 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No items found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailableStock.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-primary/30 cursor-pointer transition-all duration-200 shadow-sm mb-2.5"
                        onClick={() => handleAddStockItemToOutgoing(item)}
                      >
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sku} | Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`
                            ${item.totalPairs > 30 ? "bg-green-100 text-green-800" : ""}
                            ${item.totalPairs > 10 && item.totalPairs <= 30 ? "bg-yellow-100 text-yellow-800" : ""}
                            ${item.totalPairs <= 10 ? "bg-red-100 text-red-800" : ""}
                          `}
                          >
                            {item.totalPairs} pairs
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddStockItemToOutgoing(item);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 pt-5 border-t">
            <Button
              variant="outline"
              onClick={() => setIsIssueDialogOpen(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOutgoingDocument}
              disabled={
                !newOutgoingDocument.recipient ||
                selectedStockItems.length === 0
              }
              className="h-11 px-6 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
            >
              Create Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Outgoing Document Dialog */}
      <Dialog
        open={isViewOutgoingDialogOpen}
        onOpenChange={setIsViewOutgoingDialogOpen}
      >
        {selectedOutgoingDocument && (
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Proof of Goods Release
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                #{selectedOutgoingDocument.documentNumber}
              </p>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-md border">
                <div>
                  <p className="text-sm font-medium text-primary">Date:</p>
                  <p className="text-sm mt-1">
                    {selectedOutgoingDocument.time
                      ? `${new Date(selectedOutgoingDocument.date).toLocaleDateString()} ${selectedOutgoingDocument.time}`
                      : new Date(
                          selectedOutgoingDocument.date,
                        ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    Document Number:
                  </p>
                  <p className="text-sm mt-1 font-mono">
                    {selectedOutgoingDocument.documentNumber}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">Recipient:</p>
                  {/* Removed Edit Recipient button to prevent changes after creation */}
                </div>
                <div className="mt-2 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                  <p className="text-sm font-medium mb-2">
                    {selectedOutgoingDocument.recipient}
                  </p>
                  {selectedOutgoingDocument.recipientId && (
                    <div className="space-y-2 border-t pt-2">
                      {recipients.find(
                        (r) => r.id === selectedOutgoingDocument.recipientId,
                      )?.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2 text-primary" />
                          {
                            recipients.find(
                              (r) =>
                                r.id === selectedOutgoingDocument.recipientId,
                            )?.email
                          }
                        </div>
                      )}
                      {recipients.find(
                        (r) => r.id === selectedOutgoingDocument.recipientId,
                      )?.phone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-2 text-primary" />
                          {
                            recipients.find(
                              (r) =>
                                r.id === selectedOutgoingDocument.recipientId,
                            )?.phone
                          }
                        </div>
                      )}
                      {recipients.find(
                        (r) => r.id === selectedOutgoingDocument.recipientId,
                      )?.address && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-2 text-primary" />
                          {
                            recipients.find(
                              (r) =>
                                r.id === selectedOutgoingDocument.recipientId,
                            )?.address
                          }
                        </div>
                      )}
                      {recipients.find(
                        (r) => r.id === selectedOutgoingDocument.recipientId,
                      )?.notes && (
                        <div className="flex items-start text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                          <span>
                            {
                              recipients.find(
                                (r) =>
                                  r.id === selectedOutgoingDocument.recipientId,
                              )?.notes
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedOutgoingDocument.notes && (
                <div className="p-4 bg-slate-50 rounded-md border">
                  <p className="text-sm font-medium text-primary">Notes:</p>
                  <p className="text-sm mt-1">
                    {selectedOutgoingDocument.notes}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-3 text-primary">
                  Items:
                </h3>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold">
                          SKU
                        </th>
                        <th className="text-left p-3 text-xs font-semibold">
                          Product
                        </th>
                        <th className="text-left p-3 text-xs font-semibold">
                          Size
                        </th>
                        <th className="text-left p-3 text-xs font-semibold">
                          Color
                        </th>
                        <th className="text-right p-3 text-xs font-semibold">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOutgoingDocument.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-muted-foreground"
                          >
                            No items added yet
                          </td>
                        </tr>
                      ) : (
                        selectedOutgoingDocument.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t hover:bg-slate-50"
                          >
                            <td className="p-3 text-xs font-mono">
                              {item.sku}
                            </td>
                            <td className="p-3 text-xs">{item.name}</td>
                            <td className="p-3 text-xs">{item.size}</td>
                            <td className="p-3 text-xs">{item.color}</td>
                            <td className="p-3 text-xs text-right font-medium">
                              {item.quantity} pairs
                            </td>
                          </tr>
                        ))
                      )}
                      <tr className="border-t bg-slate-100">
                        <td
                          colSpan={4}
                          className="p-3 text-xs font-semibold text-right"
                        >
                          Total:
                        </td>
                        <td className="p-3 text-xs font-semibold text-right text-primary">
                          {selectedOutgoingDocument.totalItems} pairs
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                className="gap-2 h-10"
                onClick={() => {
                  if (selectedOutgoingDocument) {
                    printOutgoingStockDocument(selectedOutgoingDocument);
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print Document
              </Button>
              <Button
                onClick={() => setIsViewOutgoingDialogOpen(false)}
                className="h-10 bg-primary"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Mass Upload Dialog */}
      <Dialog
        open={isMassUploadDialogOpen}
        onOpenChange={setIsMassUploadDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Mass Upload Outgoing Stock
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold mb-1">
                    Upload Excel Template
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload the filled Excel template to create multiple outgoing
                    stock documents at once.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() =>
                    generateOutgoingStockExcelTemplate(
                      availableStock,
                      recipients,
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  Get Template
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    setUploadError(null);
                    setUploadValidationData(null);
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      parseOutgoingStockExcelTemplate(
                        file,
                        availableStock,
                        recipients,
                      )
                        .then((result) => {
                          setUploadValidationData(result);
                        })
                        .catch((error) => {
                          setUploadError(error.message);
                        })
                        .finally(() => {
                          setIsUploading(false);
                        });
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  className="flex-1 h-20 border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-slate-100"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-6 w-6 mb-2 text-slate-400" />
                    <span className="text-sm font-medium">
                      {isUploading
                        ? "Uploading..."
                        : "Click to upload Excel file"}
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadValidationData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Validation Results</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {uploadValidationData.validItems.length} Valid
                    </Badge>
                    {uploadValidationData.invalidItems.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {uploadValidationData.invalidItems.length} Invalid
                      </Badge>
                    )}
                  </div>
                </div>

                {uploadValidationData.invalidItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-red-50 p-3 border-b">
                      <h4 className="text-sm font-medium text-red-800">
                        Invalid Items
                      </h4>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {uploadValidationData.invalidItems.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 border-b last:border-b-0 text-sm"
                        >
                          <div className="flex justify-between">
                            <span>
                              {item.sku} | Size: {item.size} | Color:{" "}
                              {item.color} | Qty: {item.quantity}
                            </span>
                            <span className="text-red-600 font-medium">
                              {item.reason}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadValidationData.validItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-green-50 p-3 border-b">
                      <h4 className="text-sm font-medium text-green-800">
                        Valid Items
                      </h4>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {uploadValidationData.validItems.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 border-b last:border-b-0 text-sm"
                        >
                          <div className="flex justify-between">
                            <span>
                              {item.sku} | Size: {item.size} | Color:{" "}
                              {item.color} | Qty: {item.quantity}
                            </span>
                            <span className="text-slate-500">
                              Recipient: {item.recipient}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsMassUploadDialogOpen(false);
                setUploadValidationData(null);
                setUploadError(null);
                setProcessingUpload(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !uploadValidationData ||
                uploadValidationData.validItems.length === 0 ||
                isUploading ||
                processingUpload
              }
              className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
              onClick={handleCreateOutgoingDocumentsFromUpload}
            >
              {processingUpload
                ? "Processing..."
                : `Create ${uploadValidationData?.validItems.length || 0} Deliveries`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Recipient Dialog */}
      <Dialog
        open={isAddRecipientDialogOpen}
        onOpenChange={setIsAddRecipientDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add New Recipient
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quick-name"
                name="name"
                value={quickAddRecipientForm.name}
                onChange={(e) =>
                  setQuickAddRecipientForm({
                    ...quickAddRecipientForm,
                    name: e.target.value,
                  })
                }
                placeholder="Enter recipient name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-email">Email</Label>
              <Input
                id="quick-email"
                name="email"
                type="email"
                value={quickAddRecipientForm.email}
                onChange={(e) =>
                  setQuickAddRecipientForm({
                    ...quickAddRecipientForm,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-phone">Phone</Label>
              <Input
                id="quick-phone"
                name="phone"
                value={quickAddRecipientForm.phone}
                onChange={(e) =>
                  setQuickAddRecipientForm({
                    ...quickAddRecipientForm,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-address">Address</Label>
              <Input
                id="quick-address"
                name="address"
                value={quickAddRecipientForm.address}
                onChange={(e) =>
                  setQuickAddRecipientForm({
                    ...quickAddRecipientForm,
                    address: e.target.value,
                  })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-notes">Notes</Label>
              <Input
                id="quick-notes"
                name="notes"
                value={quickAddRecipientForm.notes}
                onChange={(e) =>
                  setQuickAddRecipientForm({
                    ...quickAddRecipientForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Enter additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQuickAddRecipientForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  notes: "",
                });
                setIsAddRecipientDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!quickAddRecipientForm.name.trim()) return;

                // Create new recipient object
                const newRecipient: Recipient = {
                  id: generateUUID(),
                  name: quickAddRecipientForm.name.trim(),
                  email: quickAddRecipientForm.email.trim() || undefined,
                  phone: quickAddRecipientForm.phone.trim() || undefined,
                  address: quickAddRecipientForm.address.trim() || undefined,
                  notes: quickAddRecipientForm.notes.trim() || undefined,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                // Update recipients state
                const updatedRecipients = [newRecipient, ...recipients];
                setRecipients(updatedRecipients);

                // Save to localStorage
                saveToLocalStorage("warehouse-recipients", updatedRecipients);

                // Update the outgoing document form with the new recipient
                setNewOutgoingDocument({
                  ...newOutgoingDocument,
                  recipientId: newRecipient.id,
                  recipient: newRecipient.name,
                });

                // Reset form and close dialog
                setQuickAddRecipientForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  notes: "",
                });
                setIsAddRecipientDialogOpen(false);
              }}
              disabled={!quickAddRecipientForm.name.trim()}
              className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
            >
              Add Recipient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutgoingStock;
