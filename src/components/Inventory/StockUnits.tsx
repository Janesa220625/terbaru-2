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
    if (availableBoxStock.totalPairs === undefined) return true; // No total pairs data to validate against

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
          `Cannot add ${newUnit.quantity} pairs. Only ${availableBoxStock?.totalPairs ? availableBoxStock.totalPairs - allocatedPairs : 0} pairs available.`,
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
        } as any,
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
          `Cannot add ${totalQuantity} pairs. Only ${availableBoxStock?.totalPairs ? availableBoxStock.totalPairs - allocatedPairs : 0} pairs available.`,
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

      addStockUnits(newStockUnits as any[]);
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

    try {
      const result = await parseExcelTemplate(file);
      setValidationResults(result);
      setShowValidation(true);

      // If there are valid items, add them to stock
      if (result.validItems.length > 0) {
        const stockItems = result.validItems
          .filter((item) => item.isValid)
          .map((item) => ({
            sku: item.sku,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            boxId: "",
            dateAdded: new Date(),
            addedBy: newUnit.addedBy || "System Import",
            manufactureDate: undefined,
          }));

        addStockUnits(stockItems as any[]);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsUploading(false);
    }
  };
  };

  return (
    <div className="bg-white p-4">{/* Component JSX would go here */}</div>
  );
};

export default StockUnits;
