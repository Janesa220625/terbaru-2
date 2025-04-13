import React, { useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Upload,
  Download,
  AlertCircle,
  Printer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { printOutgoingStockDocument } from "@/lib/utils/printUtils";
import {
  generateOutgoingStockExcelTemplate,
  parseOutgoingStockExcelTemplate,
} from "@/lib/utils/excelUtils";
import ValidationDisplay, { ValidationItem } from "../ValidationDisplay";
import { generateUUID } from "@/lib/utils/uuidUtils";
import OutgoingDocumentList from "./OutgoingDocumentList";
import StockItemSelector from "./StockItemSelector";
import SelectedStockItems from "./SelectedStockItems";
import DeliveryInfoForm from "./DeliveryInfoForm";
import { useOutgoingStockState } from "./hooks/useOutgoingStockState";
import { saveToLocalStorage } from "@/lib/storage";

const OutgoingStock = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook for state management
  const {
    // State
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

    // Setters
    setSearchTerm,
    setIsIssueDialogOpen,
    setOutgoingDocuments,
    setSelectedOutgoingDocument,
    setIsViewOutgoingDialogOpen,
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
  } = useOutgoingStockState();

  // Handler functions
  const handleAddStockItemToOutgoing = (item: any) => {
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
    if (!newOutgoingDocument.recipient || selectedStockItems.length === 0) {
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

    const newOutgoingDoc = {
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

    // Reset form with a new document number and current date/time
    setNewOutgoingDocument({
      documentNumber: generateDocumentNumber(),
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
      const newDocuments = [];

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
        const newDocument = {
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
    } catch (error) {
      console.error("Error creating outgoing documents:", error);
      setUploadError("Failed to create outgoing documents. Please try again.");
    } finally {
      setProcessingUpload(false);
    }
  };

  const handleAddRecipient = () => {
    if (!quickAddRecipientForm.name.trim()) return;

    // Create new recipient object
    const newRecipient = {
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadValidationData(null);
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      parseOutgoingStockExcelTemplate(file, availableStock, recipients)
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
            <OutgoingDocumentList
              documents={outgoingDocuments}
              recipients={recipients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDocumentSelect={(doc) => {
                setSelectedOutgoingDocument(doc);
                setIsViewOutgoingDialogOpen(true);
              }}
              onCreateNew={() => setIsIssueDialogOpen(true)}
            />
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
              <DeliveryInfoForm
                documentNumber={newOutgoingDocument.documentNumber}
                recipientId={newOutgoingDocument.recipientId}
                recipient={newOutgoingDocument.recipient}
                notes={newOutgoingDocument.notes}
                recipients={recipients}
                onRecipientChange={(id, name) =>
                  setNewOutgoingDocument({
                    ...newOutgoingDocument,
                    recipientId: id,
                    recipient: name,
                  })
                }
                onNotesChange={(notes) =>
                  setNewOutgoingDocument({
                    ...newOutgoingDocument,
                    notes,
                  })
                }
                onManualRecipientChange={(name) =>
                  setNewOutgoingDocument({
                    ...newOutgoingDocument,
                    recipient: name,
                  })
                }
                onAddRecipientClick={() => setIsAddRecipientDialogOpen(true)}
              />

              <div className="border rounded-md p-5 bg-slate-50 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-primary">
                  Selected Items
                </h3>
                <SelectedStockItems
                  items={selectedStockItems}
                  onUpdateQuantity={handleUpdateStockItemQuantity}
                  onRemoveItem={handleRemoveStockItemFromOutgoing}
                  onClearAll={() => setSelectedStockItems([])}
                />
              </div>
            </div>

            <StockItemSelector
              availableStock={availableStock}
              searchTerm={stockSearchTerm}
              onSearchChange={setStockSearchTerm}
              onAddItem={handleAddStockItemToOutgoing}
            />
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
      {selectedOutgoingDocument && (
        <Dialog
          open={isViewOutgoingDialogOpen}
          onOpenChange={setIsViewOutgoingDialogOpen}
        >
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
              {/* Document details */}
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

              {/* Recipient information */}
              <div className="p-4 bg-slate-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">Recipient:</p>
                </div>
                <div className="mt-2 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                  <p className="text-sm font-medium mb-2">
                    {selectedOutgoingDocument.recipient}
                  </p>
                  {selectedOutgoingDocument.recipientId && (
                    <div className="space-y-2 border-t pt-2">
                      {/* Recipient details */}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOutgoingDocument.notes && (
                <div className="p-4 bg-slate-50 rounded-md border">
                  <p className="text-sm font-medium text-primary">Notes:</p>
                  <p className="text-sm mt-1">
                    {selectedOutgoingDocument.notes}
                  </p>
                </div>
              )}

              {/* Items table */}
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
        </Dialog>
      )}

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
                  onChange={handleFileUpload}
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
              <div className="space-y-4">{/* Validation results UI */}</div>
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
          <div className="space-y-4 py-4">{/* Quick add recipient form */}</div>
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
              onClick={handleAddRecipient}
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
