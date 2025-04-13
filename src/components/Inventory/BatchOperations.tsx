import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileUp,
  FileDown,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useProductData } from "@/lib/hooks/useProductData";
import { useStockUnits } from "@/lib/hooks/useStockUnits";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import {
  generateStockUnitsExcelTemplate,
  parseExcelTemplate,
  generateBoxStockExcelTemplate,
  parseBoxStockExcelTemplate,
  generateInventoryExportExcel,
  ValidationResult,
  BoxStockValidationResult,
} from "@/lib/utils/excelUtils";
import ValidationDisplay, { ValidationItem } from "./ValidationDisplay";

const BatchOperations = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [importType, setImportType] = useState("stockUnits");
  const [exportType, setExportType] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult>({
    validItems: [],
    invalidItems: [],
  });
  const [showValidation, setShowValidation] = useState(false);

  // Get product data and stock units hooks
  const { products } = useProductData();
  const { stockUnits, addStockUnits } = useStockUnits();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setImportStatus({
        success: false,
        message: "Please select a file to import",
      });
      return;
    }

    try {
      if (importType === "stockUnits") {
        const results = await parseExcelTemplate(file);
        setValidationResults(results);
        setShowValidation(true);

        if (
          results.validItems.length === 0 &&
          results.invalidItems.length === 0
        ) {
          setImportStatus({
            success: false,
            message: "No data found in the uploaded file",
          });
          return;
        }

        // Add only the valid stock units
        if (results.validItems.length > 0) {
          addStockUnits(
            results.validItems.map((item) => ({
              sku: item.sku,
              size: item.size || "",
              color: item.color || "",
              quantity: item.quantity || 0,
              boxId: "",
              dateAdded: new Date(),
              addedBy: "Batch Import",
            })),
          );

          setImportStatus({
            success: true,
            message: `Successfully imported ${results.validItems.length} stock units`,
            count: results.validItems.length,
          });
        }

        // Show error message if there are invalid items
        if (results.invalidItems.length > 0) {
          setImportStatus({
            success: false,
            message: `${results.invalidItems.length} items failed validation`,
            count: results.invalidItems.length,
          });
        }
      } else if (importType === "boxStock") {
        const results: BoxStockValidationResult =
          await parseBoxStockExcelTemplate(file);

        if (
          results.validItems.length === 0 &&
          results.invalidItems.length === 0
        ) {
          setImportStatus({
            success: false,
            message: "No data found in the uploaded file",
          });
          return;
        }

        // Add only the valid box stock items
        if (results.validItems.length > 0) {
          // Get existing box stock
          const existingBoxStock = loadFromLocalStorage(
            "warehouse-box-stock",
            [],
          );

          // Merge with new items (replace existing ones with same SKU)
          const mergedBoxStock = [...existingBoxStock];

          results.validItems.forEach((newItem: Record<string, any>) => {
            const existingIndex = mergedBoxStock.findIndex(
              (item) => item.sku.toLowerCase() === newItem.sku.toLowerCase(),
            );

            if (existingIndex >= 0) {
              mergedBoxStock[existingIndex] = {
                ...mergedBoxStock[existingIndex],
                ...newItem,
                id: mergedBoxStock[existingIndex].id, // Preserve original ID
              };
            } else {
              mergedBoxStock.push({
                ...newItem,
                id: `box-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate new ID
              });
            }
          });

          // Save updated box stock
          saveToLocalStorage("warehouse-box-stock", mergedBoxStock);

          setImportStatus({
            success: true,
            message: `Successfully imported ${results.validItems.length} box stock items`,
            count: results.validItems.length,
          });
        }

        // Convert validation results to the format expected by ValidationDisplay
        const validItems: ValidationItem[] = results.validItems.map((item) => ({
          sku: item.sku,
          isValid: true,
          quantity: item.boxCount,
        }));

        const invalidItems: ValidationItem[] = results.invalidItems.map(
          (item) => ({
            sku: item.sku || "Unknown SKU",
            isValid: false,
            reason: item.reason || "Unknown error",
          }),
        );

        setValidationResults({ validItems, invalidItems });
        setShowValidation(true);

        // Show error message if there are invalid items
        if (results.invalidItems.length > 0) {
          setImportStatus({
            success: false,
            message: `${results.invalidItems.length} items failed validation`,
            count: results.invalidItems.length,
          });
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus({
        success: false,
        message: `Error importing data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const handleExport = () => {
    try {
      switch (exportType) {
        case "all":
          const boxStock = loadFromLocalStorage("warehouse-box-stock", []);
          generateInventoryExportExcel(products, stockUnits, boxStock);
          break;
        case "stockUnits":
          generateStockUnitsExcelTemplate(products, stockUnits);
          break;
        case "boxStock":
          const boxStockData = loadFromLocalStorage("warehouse-box-stock", []);
          generateBoxStockExcelTemplate(products, boxStockData);
          break;
        default:
          throw new Error("Invalid export type");
      }

      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      setImportStatus({
        success: false,
        message: `Error exporting data: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Batch Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileUp className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Import Data</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Import product data, stock units, or delivery records from Excel
              files
            </p>
            <Button
              onClick={() => setIsImportDialogOpen(true)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" /> Import Data
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileDown className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Export Data</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Export your inventory data to Excel for reporting or backup
            </p>
            <Button
              onClick={() => setIsExportDialogOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" /> Export Data
            </Button>
          </div>
        </div>

        {showValidation && (
          <div className="mt-4">
            <ValidationDisplay
              validItems={validationResults.validItems}
              invalidItems={validationResults.invalidItems}
              onClose={() => setShowValidation(false)}
            />
          </div>
        )}
      </CardContent>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="stockUnits"
            onValueChange={(value) => setImportType(value)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stockUnits">Stock Units</TabsTrigger>
              <TabsTrigger value="boxStock">Box Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="stockUnits" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Import stock unit data including SKUs, sizes, colors, and
                quantities.
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Required columns: SKU, Size, Color, Quantity
              </p>
            </TabsContent>

            <TabsContent value="boxStock" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Import box stock data including SKUs, names, categories, box
                counts, and pairs per box.
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Required columns: SKU, Name, Category, BoxCount, PairsPerBox
              </p>
            </TabsContent>
          </Tabs>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Select Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-md ${importStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              <div className="flex items-center gap-2">
                {importStatus.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="text-sm font-medium">{importStatus.message}</p>
              </div>
              {importStatus.success && importStatus.count && (
                <p className="text-xs mt-1">
                  {importStatus.count} records imported successfully
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select the type of data you want to export to Excel:
            </p>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={exportType === "all" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setExportType("all")}
              >
                Complete Inventory (All Data)
              </Button>
              <Button
                variant={exportType === "stockUnits" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setExportType("stockUnits")}
              >
                Stock Units Only
              </Button>
              <Button
                variant={exportType === "boxStock" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setExportType("boxStock")}
              >
                Box Stock Only
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>Export to Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BatchOperations;
