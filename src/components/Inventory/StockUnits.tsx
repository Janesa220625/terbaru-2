import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Package,
  AlertCircle,
  FileDown,
  Search,
  Trash2,
  Info,
  CalendarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { loadFromLocalStorage } from "../../lib/storage";

// Import custom hooks and utilities
import { useProductData, BoxItem } from "../../lib/hooks/useProductData";
import { useStockUnits, StockUnitItem } from "../../lib/hooks/useStockUnits";
import {
  generateStockUnitsExcelTemplate,
  parseExcelTemplate,
} from "../../lib/utils/excelUtils";
import StockUnitTable from "./StockUnitTable";
import ValidationDisplay, { ValidationItem } from "./ValidationDisplay";
import { format, isSameDay } from "date-fns";

// Import BoxStock interfaces
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

const StockUnits = () => {
  // State for file upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    validItems: ValidationItem[];
    invalidItems: ValidationItem[];
  }>({ validItems: [], invalidItems: [] });
  const [showValidation, setShowValidation] = useState(false);
  // Use custom hooks
  const { products, boxes, error, getProductForSku } = useProductData();
  const {
    stockUnits,
    addStockUnits,
    updateStockUnit,
    deleteStockUnit,
    stockBySku,
  } = useStockUnits();

  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<BoxItem | null>(null);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [availableBoxStock, setAvailableBoxStock] =
    useState<BoxStockItem | null>(null);
  const [allocatedPairs, setAllocatedPairs] = useState<number>(0);
  const [exceedsAvailableStock, setExceedsAvailableStock] =
    useState<boolean>(false);
  const [alertTimeout, setAlertTimeout] = useState<number | null>(null);

  // Form state
  const [newUnit, setNewUnit] = useState({
    sku: "",
    size: "",
    color: "",
    quantity: 0,
    boxId: "", // Keeping for backward compatibility
    addedBy: "", // Will be filled by user
    dateAdded: new Date(), // Automatically set to current date/time
    manufactureDate: undefined as Date | undefined, // Optional manufacture date
  });

  // Load the last used name from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem("warehouse-last-user");
    if (savedName) {
      setNewUnit((prev) => ({ ...prev, addedBy: savedName }));
    }

    // Cleanup function to clear any timeouts when component unmounts
    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, []);

  // State for multiple variants
  const [variants, setVariants] = useState<
    Array<{ size: string; color: string; quantity: number }>
  >([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSearchTerm, setDateSearchTerm] = useState<Date | undefined>(
    undefined,
  );

  // Function to validate if the total quantity exceeds available stock
  const validateStockQuantity = (totalQuantity: number): boolean => {
    if (!availableBoxStock) return true; // No box stock data to validate against

    // Calculate the total quantity that would be allocated after this addition
    const totalAllocated = allocatedPairs + totalQuantity;

    // Check if the total allocated would exceed the available pairs
    const isValid = totalAllocated <= availableBoxStock.totalPairs;

    // If not valid, show the global alert
    if (!isValid) {
      setExceedsAvailableStock(true);

      // Clear any existing timeout
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }

      // Set a new timeout to clear the alert after 5 seconds
      const timeout = window.setTimeout(() => {
        setExceedsAvailableStock(false);
      }, 5000);

      setAlertTimeout(timeout);
    }

    return isValid;
  };

  const handleAddStockUnit = () => {
    // If using single variant mode
    if (variants.length === 0) {
      if (
        !newUnit.sku ||
        !newUnit.size ||
        !newUnit.color ||
        newUnit.quantity <= 0 ||
        skuError
      )
        return;

      // Get the product to ensure it exists
      const product = getProductForSku(newUnit.sku);
      if (!product) {
        setSkuError("Product not found. Please check the SKU.");
        return;
      }

      // Validate against available box stock
      if (!validateStockQuantity(newUnit.quantity)) {
        setSkuError(
          `Cannot add ${newUnit.quantity} pairs. Only ${availableBoxStock?.totalPairs - allocatedPairs} pairs available.`,
        );
        setExceedsAvailableStock(true);
        return;
      }

      addStockUnits([
        {
          sku: newUnit.sku,
          size: newUnit.size,
          color: newUnit.color,
          quantity: newUnit.quantity,
          boxId: newUnit.boxId || "", // Use empty string if no boxId
          dateAdded: newUnit.dateAdded,
          addedBy: newUnit.addedBy,
          manufactureDate: newUnit.manufactureDate,
        },
      ]);
    } else {
      // Using multi-variant mode
      if (!newUnit.sku || skuError || !productName || variants.length === 0)
        return;

      // Filter out empty variants
      const validVariants = variants.filter(
        (v) => v.size && v.color && v.quantity > 0,
      );

      if (validVariants.length === 0) return;

      // Calculate total quantity across all variants
      const totalQuantity = validVariants.reduce(
        (sum, variant) => sum + variant.quantity,
        0,
      );

      // Validate against available box stock
      if (!validateStockQuantity(totalQuantity)) {
        setSkuError(
          `Cannot add ${totalQuantity} pairs. Only ${availableBoxStock?.totalPairs - allocatedPairs} pairs available.`,
        );
        setExceedsAvailableStock(true);
        return;
      }

      const newStockUnits = validVariants.map((variant) => ({
        sku: newUnit.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        boxId: newUnit.boxId || "", // Use empty string if no boxId
        dateAdded: newUnit.dateAdded,
        addedBy: newUnit.addedBy,
        manufactureDate: newUnit.manufactureDate,
      }));

      addStockUnits(newStockUnits);
    }

    // Save the user name for future use
    if (newUnit.addedBy) {
      localStorage.setItem("warehouse-last-user", newUnit.addedBy);
    }

    // Reset form state
    setIsDialogOpen(false);
    setNewUnit({
      sku: "",
      size: "",
      color: "",
      quantity: 0,
      boxId: "",
      addedBy: newUnit.addedBy, // Keep the user name for next time
      dateAdded: new Date(), // Always use current date/time
      manufactureDate: undefined, // Reset manufacture date
    });
    setVariants([]);
    setSelectedBox(null);
    setSkuError(null);
    setProductName(null);
    setExceedsAvailableStock(false);

    // Clear any existing timeout
    if (alertTimeout) {
      clearTimeout(alertTimeout);
      setAlertTimeout(null);
    }
  };

  // Function to fetch box stock data for a given SKU
  const fetchBoxStockForSku = (sku: string) => {
    const boxStockItems = loadFromLocalStorage<BoxStockItem[]>(
      "warehouse-box-stock",
      [],
    );
    return (
      boxStockItems.find(
        (item) => item.sku.toLowerCase() === sku.toLowerCase(),
      ) || null
    );
  };

  // Function to calculate total allocated pairs for a SKU
  const calculateAllocatedPairs = (sku: string) => {
    // Get existing stock units for this SKU
    const existingUnits = stockUnits.filter(
      (unit) => unit.sku.toLowerCase() === sku.toLowerCase(),
    );
    return existingUnits.reduce((total, unit) => total + unit.quantity, 0);
  };

  // Handle SKU input change
  const handleSkuChange = (sku: string) => {
    setNewUnit({ ...newUnit, sku });

    // Find product by SKU
    const product = products.find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase(),
    );

    if (product) {
      setProductName(product.name);
      setNewUnit((prev) => ({
        ...prev,
        sku: product.sku,
        size: "", // Reset size when SKU changes
        color: "", // Reset color when SKU changes
        quantity: 0, // Reset quantity when SKU changes
        // Find a matching box for this SKU if available
        boxId: boxes.find((box) => box.sku === product.sku)?.id || "",
      }));
      setSkuError(null);

      // Reset variants when SKU changes
      setVariants([]);

      // Fetch box stock data for this SKU
      const boxStock = fetchBoxStockForSku(product.sku);
      setAvailableBoxStock(boxStock);

      // Calculate already allocated pairs for this SKU
      const allocated = calculateAllocatedPairs(product.sku);
      setAllocatedPairs(allocated);

      // Check if we have box stock data and if allocated pairs exceed available pairs
      if (boxStock && allocated >= boxStock.totalPairs) {
        setSkuError(
          `All available pairs (${boxStock.totalPairs}) for this SKU have already been allocated.`,
        );
        setExceedsAvailableStock(true);

        // Clear any existing timeout
        if (alertTimeout) {
          clearTimeout(alertTimeout);
        }

        // Set a new timeout to clear the alert after 5 seconds
        const timeout = window.setTimeout(() => {
          setExceedsAvailableStock(false);
        }, 5000);

        setAlertTimeout(timeout);
      } else {
        setExceedsAvailableStock(false);

        // Clear any existing timeout
        if (alertTimeout) {
          clearTimeout(alertTimeout);
          setAlertTimeout(null);
        }
      }
    } else if (sku.trim() !== "") {
      setSkuError("Product not found. Please check the SKU.");
      setProductName(null);
      setAvailableBoxStock(null);
      setAllocatedPairs(0);
      setExceedsAvailableStock(false);
    } else {
      setSkuError(null);
      setProductName(null);
      setAvailableBoxStock(null);
      setAllocatedPairs(0);
      setExceedsAvailableStock(false);
    }
  };

  // Handle update stock unit
  const handleUpdateStockUnit = (unit: StockUnitItem, userName: string) => {
    updateStockUnit(unit, userName);
  };

  // Handle delete stock unit
  const handleDeleteStockUnit = (unitId: string) => {
    deleteStockUnit(unitId);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setShowValidation(false);

    try {
      const results = await parseExcelTemplate(file);
      setValidationResults(results);

      if (
        results.validItems.length === 0 &&
        results.invalidItems.length === 0
      ) {
        setUploadError("No data found in the uploaded file.");
        return;
      }

      // Add only the valid stock units
      if (results.validItems.length > 0) {
        addStockUnits(
          results.validItems.map((item) => ({
            ...item,
            dateAdded: new Date(),
            addedBy:
              newUnit.addedBy ||
              localStorage.getItem("warehouse-last-user") ||
              "Unknown",
            boxId: "",
            manufactureDate: undefined,
          })),
        );
      }

      // Reset the file input
      if (e.target) e.target.value = "";

      // Show validation results
      setShowValidation(true);

      // Show error message if there are invalid items
      if (results.invalidItems.length > 0) {
        setUploadError(
          "Some items could not be processed. See validation results below.",
        );

        // Show error for 5 seconds
        setExceedsAvailableStock(true);

        // Clear any existing timeout
        if (alertTimeout) {
          clearTimeout(alertTimeout);
        }

        // Set a new timeout to clear the alert after 5 seconds
        const timeout = window.setTimeout(() => {
          setExceedsAvailableStock(false);
        }, 5000);

        setAlertTimeout(timeout);
      } else {
        // Show success message
        setExceedsAvailableStock(false);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to process the uploaded file.",
      );

      // Show error for 5 seconds
      setExceedsAvailableStock(true);

      // Clear any existing timeout
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }

      // Set a new timeout to clear the alert after 5 seconds
      const timeout = window.setTimeout(() => {
        setExceedsAvailableStock(false);
      }, 5000);

      setAlertTimeout(timeout);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to group stock units by manufacture date
  const groupStockUnitsByDate = (
    stockBySku: Record<string, StockUnitItem[]>,
    skuSearchTerm: string,
    dateSearchTerm: Date | undefined,
  ) => {
    // Filter by SKU first
    const filteredStockBySku: Record<string, StockUnitItem[]> = {};

    Object.entries(stockBySku)
      .filter(([sku]) =>
        sku.toLowerCase().includes(skuSearchTerm.toLowerCase()),
      )
      .forEach(([sku, units]) => {
        filteredStockBySku[sku] = units;
      });

    // Group by date
    const groupedByDate: Record<string, Record<string, StockUnitItem[]>> = {};

    Object.entries(filteredStockBySku).forEach(([sku, units]) => {
      units.forEach((unit) => {
        // Use manufacture date if available, otherwise fall back to dateAdded
        const dateToUse = unit.manufactureDate || unit.dateAdded;
        const dateStr = format(new Date(dateToUse), "MMMM d, yyyy");
        const unitDate = new Date(dateToUse);

        // Filter by date if dateSearchTerm is provided
        if (dateSearchTerm && !isSameDay(unitDate, dateSearchTerm)) {
          return;
        }

        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = {};
        }

        if (!groupedByDate[dateStr][sku]) {
          groupedByDate[dateStr][sku] = [];
        }

        groupedByDate[dateStr][sku].push(unit);
      });
    });

    return groupedByDate;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Stock Units</h2>
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by SKU..."
                className="pl-8 w-[150px] md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-[150px] md:w-[200px] lg:w-[250px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal pl-8 truncate"
                  >
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    {dateSearchTerm ? (
                      <span className="truncate">
                        {format(dateSearchTerm, "PPP")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground truncate">
                        Filter by date...
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateSearchTerm}
                    onSelect={setDateSearchTerm}
                    initialFocus
                    className="rounded-md border shadow-sm bg-white"
                  />
                  {dateSearchTerm && (
                    <div className="p-3 border-t border-border flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateSearchTerm(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => generateStockUnitsExcelTemplate(products)}
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span> Template
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  document.getElementById("upload-excel-input")?.click()
                }
              >
                <input
                  id="upload-excel-input"
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <FileDown className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">Upload</span> Template
              </Button>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span> Stock Units
            </Button>
          </div>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {exceedsAvailableStock && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadError ||
              "Cannot allocate more stock than available. Please reduce the quantity or check box stock levels."}
          </AlertDescription>
        </Alert>
      )}
      {isUploading && (
        <Alert>
          <AlertDescription className="flex items-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Processing uploaded template...
          </AlertDescription>
        </Alert>
      )}
      {showValidation && (
        <ValidationDisplay
          validItems={validationResults.validItems}
          invalidItems={validationResults.invalidItems}
          onClose={() => setShowValidation(false)}
        />
      )}
      <Card className="bg-white w-full">
        <CardHeader>
          <CardTitle>Current Stock Units</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(stockBySku).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(
                groupStockUnitsByDate(stockBySku, searchTerm, dateSearchTerm),
              ).map(([dateStr, skuGroups]) => (
                <div key={dateStr} className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 bg-muted/30 p-2 rounded-md">
                    {dateStr}
                  </h3>
                  <StockUnitTable
                    stockBySku={skuGroups}
                    searchTerm={searchTerm}
                    getProductForSku={getProductForSku}
                    onUpdateUnit={handleUpdateStockUnit}
                    onDeleteUnit={handleDeleteStockUnit}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No stock units found. Add some units to get started.
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add Stock Units Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Stock Units</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="relative">
                  <Input
                    id="sku"
                    placeholder="Enter product SKU"
                    value={newUnit.sku}
                    onChange={(e) => handleSkuChange(e.target.value)}
                    className={skuError ? "border-destructive" : ""}
                    list="product-skus"
                  />
                  <datalist id="product-skus">
                    {products.map((product) => (
                      <option key={product.id} value={product.sku}>
                        {product.name}
                      </option>
                    ))}
                  </datalist>
                  {newUnit.sku && !skuError && productName && (
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                  )}
                  {skuError && (
                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-destructive" />
                  )}
                </div>
                {productName && !skuError && (
                  <p className="text-xs text-muted-foreground">{productName}</p>
                )}
                {skuError && (
                  <p className="text-xs text-destructive">{skuError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="addedBy" className="text-right">
                Added By
              </Label>
              <Input
                id="addedBy"
                placeholder="Enter your name"
                className="col-span-3"
                value={newUnit.addedBy}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, addedBy: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateAdded" className="text-right">
                Date Added
              </Label>
              <div className="col-span-3">
                <div className="p-2 border rounded-md bg-slate-50 text-sm">
                  {newUnit.dateAdded.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically set to current date and time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufactureDate" className="text-right">
                Manufacture Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal truncate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newUnit.manufactureDate ? (
                        <span className="truncate">
                          {format(newUnit.manufactureDate, "PPP")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground truncate">
                          Pick a date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={newUnit.manufactureDate}
                      onSelect={(date) =>
                        setNewUnit({ ...newUnit, manufactureDate: date })
                      }
                      initialFocus
                      className="rounded-md border shadow-sm bg-white"
                    />
                    {newUnit.manufactureDate && (
                      <div className="p-3 border-t border-border flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setNewUnit({
                              ...newUnit,
                              manufactureDate: undefined,
                            })
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Select the date when the product was manufactured.
                </p>
              </div>
            </div>

            {newUnit.sku && !skuError && productName && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Product</Label>
                  <div className="col-span-3">
                    <div className="font-medium">{productName}</div>
                    {getProductForSku(newUnit.sku) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Category: {getProductForSku(newUnit.sku)?.category} |
                        Pairs per box:{" "}
                        {getProductForSku(newUnit.sku)?.pairsPerBox}
                      </div>
                    )}

                    {/* Display available box stock information */}
                    {availableBoxStock && (
                      <div className="mt-3 p-3 border rounded-md bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Available Box Stock:
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  This shows the available pairs from box stock
                                  for this SKU
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Box Count:
                            </span>
                            <span className="ml-2 font-medium">
                              {availableBoxStock.boxCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Pairs Per Box:
                            </span>
                            <span className="ml-2 font-medium">
                              {availableBoxStock.pairsPerBox}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Total Pairs:
                            </span>
                            <span className="ml-2 font-medium">
                              {availableBoxStock.totalPairs}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Already Allocated:
                            </span>
                            <span className="ml-2 font-medium">
                              {allocatedPairs}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge
                            className={`w-full justify-center py-1 ${allocatedPairs >= availableBoxStock.totalPairs ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}
                          >
                            {allocatedPairs >= availableBoxStock.totalPairs
                              ? "No pairs available"
                              : `${availableBoxStock.totalPairs - allocatedPairs} pairs available`}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Add Multiple Variants</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const product = getProductForSku(newUnit.sku);
                      if (product) {
                        setVariants([
                          ...variants,
                          { size: "", color: "", quantity: 1 },
                        ]);
                      }
                    }}
                  >
                    Add Variant
                  </Button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded-md bg-background"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">
                            Variant {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newVariants = [...variants];
                              newVariants.splice(index, 1);
                              setVariants(newVariants);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label
                              htmlFor={`size-${index}`}
                              className="text-xs"
                            >
                              Size
                            </Label>
                            <Select
                              value={variant.size}
                              onValueChange={(value) => {
                                const newVariants = [...variants];
                                newVariants[index].size = value;
                                setVariants(newVariants);
                              }}
                            >
                              <SelectTrigger id={`size-${index}`}>
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {getProductForSku(newUnit.sku)
                                  ?.sizes.split(",")
                                  .map((size) => (
                                    <SelectItem
                                      key={size.trim()}
                                      value={size.trim()}
                                    >
                                      {size.trim()}
                                    </SelectItem>
                                  )) || (
                                  <SelectItem value="" disabled>
                                    No sizes available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor={`color-${index}`}
                              className="text-xs"
                            >
                              Color
                            </Label>
                            <Select
                              value={variant.color}
                              onValueChange={(value) => {
                                const newVariants = [...variants];
                                newVariants[index].color = value;
                                setVariants(newVariants);
                              }}
                            >
                              <SelectTrigger id={`color-${index}`}>
                                <SelectValue placeholder="Color" />
                              </SelectTrigger>
                              <SelectContent>
                                {getProductForSku(newUnit.sku)
                                  ?.colors.split(",")
                                  .map((color) => (
                                    <SelectItem
                                      key={color.trim()}
                                      value={color.trim()}
                                    >
                                      {color.trim()}
                                    </SelectItem>
                                  )) || (
                                  <SelectItem value="" disabled>
                                    No colors available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label
                              htmlFor={`quantity-${index}`}
                              className="text-xs"
                            >
                              Quantity
                            </Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min={1}
                              value={variant.quantity || ""}
                              className={
                                exceedsAvailableStock
                                  ? "border-destructive"
                                  : ""
                              }
                              onChange={(e) => {
                                const newVariants = [...variants];
                                newVariants[index].quantity =
                                  parseInt(e.target.value) || 0;
                                setVariants(newVariants);

                                // Calculate total quantity across all variants
                                const totalQuantity = newVariants.reduce(
                                  (sum, v) => sum + (v.quantity || 0),
                                  0,
                                );

                                // Validate against available box stock
                                if (
                                  availableBoxStock &&
                                  allocatedPairs + totalQuantity >
                                    availableBoxStock.totalPairs
                                ) {
                                  setSkuError(
                                    `Total quantity (${totalQuantity}) exceeds available stock (${availableBoxStock.totalPairs - allocatedPairs} pairs available).`,
                                  );
                                  setExceedsAvailableStock(true);

                                  // Clear any existing timeout
                                  if (alertTimeout) {
                                    clearTimeout(alertTimeout);
                                  }

                                  // Set a new timeout to clear the alert after 5 seconds
                                  const timeout = window.setTimeout(() => {
                                    setExceedsAvailableStock(false);
                                  }, 5000);

                                  setAlertTimeout(timeout);
                                } else {
                                  setSkuError(null);
                                  setExceedsAvailableStock(false);

                                  // Clear any existing timeout
                                  if (alertTimeout) {
                                    clearTimeout(alertTimeout);
                                    setAlertTimeout(null);
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="size" className="text-right">
                        Size
                      </Label>
                      <Select
                        value={newUnit.size}
                        onValueChange={(value) =>
                          setNewUnit({ ...newUnit, size: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getProductForSku(newUnit.sku)
                            ?.sizes.split(",")
                            .map((size) => (
                              <SelectItem key={size.trim()} value={size.trim()}>
                                {size.trim()}
                              </SelectItem>
                            )) || (
                            <SelectItem value="" disabled>
                              No sizes available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="color" className="text-right">
                        Color
                      </Label>
                      <Select
                        value={newUnit.color}
                        onValueChange={(value) =>
                          setNewUnit({ ...newUnit, color: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {getProductForSku(newUnit.sku)
                            ?.colors.split(",")
                            .map((color) => (
                              <SelectItem
                                key={color.trim()}
                                value={color.trim()}
                              >
                                {color.trim()}
                              </SelectItem>
                            )) || (
                            <SelectItem value="" disabled>
                              No colors available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        className={`col-span-3 ${exceedsAvailableStock ? "border-destructive" : ""}`}
                        value={newUnit.quantity || ""}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0;
                          setNewUnit({
                            ...newUnit,
                            quantity: quantity,
                          });

                          // Validate against available box stock
                          if (
                            availableBoxStock &&
                            allocatedPairs + quantity >
                              availableBoxStock.totalPairs
                          ) {
                            setSkuError(
                              `Quantity (${quantity}) exceeds available stock (${availableBoxStock.totalPairs - allocatedPairs} pairs available).`,
                            );
                            setExceedsAvailableStock(true);

                            // Clear any existing timeout
                            if (alertTimeout) {
                              clearTimeout(alertTimeout);
                            }

                            // Set a new timeout to clear the alert after 5 seconds
                            const timeout = window.setTimeout(() => {
                              setExceedsAvailableStock(false);
                            }, 5000);

                            setAlertTimeout(timeout);
                          } else {
                            setSkuError(null);
                            setExceedsAvailableStock(false);

                            // Clear any existing timeout
                            if (alertTimeout) {
                              clearTimeout(alertTimeout);
                              setAlertTimeout(null);
                            }
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStockUnit}
              disabled={!!skuError || exceedsAvailableStock}
            >
              Add Stock Units
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockUnits;
