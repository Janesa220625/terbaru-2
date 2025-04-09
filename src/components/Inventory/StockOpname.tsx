import React, { useState, useEffect } from "react";
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
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  CalculatorIcon,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";

interface StockOpnameItem {
  id: string;
  date: string;
  status: "completed" | "pending" | "discrepancy";
  totalItems: number;
  matchedItems: number;
  discrepancies: number;
  warehouse: string;
  adjustmentApplied: boolean;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  systemQuantity: number;
  countedQuantity?: number;
  source?: string;
  category?: string;
  size?: string;
  color?: string;
}

const StockOpname = () => {
  const [opnameHistory, setOpnameHistory] = useState<StockOpnameItem[]>([]);

  useEffect(() => {
    const savedOpnameHistory = loadFromLocalStorage<StockOpnameItem[]>(
      "warehouse-opname-history",
      [
        {
          id: "1",
          date: "2023-06-15",
          status: "completed",
          totalItems: 120,
          matchedItems: 120,
          discrepancies: 0,
          warehouse: "main",
          adjustmentApplied: true,
        },
        {
          id: "2",
          date: "2023-05-01",
          status: "discrepancy",
          totalItems: 115,
          matchedItems: 112,
          discrepancies: 3,
          warehouse: "secondary",
          adjustmentApplied: true,
        },
        {
          id: "3",
          date: "2023-04-01",
          status: "completed",
          totalItems: 105,
          matchedItems: 105,
          discrepancies: 0,
          warehouse: "main",
          adjustmentApplied: true,
        },
        {
          id: "4",
          date: "2023-03-01",
          status: "discrepancy",
          totalItems: 98,
          matchedItems: 95,
          discrepancies: 3,
          warehouse: "outlet",
          adjustmentApplied: false,
        },
      ],
    );
    setOpnameHistory(savedOpnameHistory);
  }, []);

  // Sample products for the stock count - in a real app, this would come from API
  const [products] = useState<ProductItem[]>([
    {
      id: "1",
      sku: "SKU-123-BLK-40",
      name: "Men's Casual Shoes",
      systemQuantity: 45,
      source: "Incoming Box (7 boxes × 6 pairs)",
      category: "men_shoes",
      size: "40",
      color: "Black",
    },
    {
      id: "2",
      sku: "SKU-123-BLK-41",
      name: "Men's Casual Shoes",
      systemQuantity: 38,
      source: "Incoming Box (6 boxes × 6 pairs)",
      category: "men_shoes",
      size: "41",
      color: "Black",
    },
    {
      id: "3",
      sku: "SKU-456-RED-37",
      name: "Women's Heels",
      systemQuantity: 22,
      source: "Incoming Box (3 boxes × 8 pairs) - 2 pairs sold",
      category: "women_shoes",
      size: "37",
      color: "Red",
    },
    {
      id: "4",
      sku: "SKU-456-RED-38",
      name: "Women's Heels",
      systemQuantity: 18,
      source: "Incoming Box (3 boxes × 8 pairs) - 6 pairs sold",
      category: "women_shoes",
      size: "38",
      color: "Red",
    },
    {
      id: "5",
      sku: "SKU-789-BRN-42",
      name: "Men's Sandals",
      systemQuantity: 8,
      source: "Incoming Box (1 box × 10 pairs) - 2 pairs sold",
      category: "men_sandals",
      size: "42",
      color: "Brown",
    },
  ]);

  // State for the new stock count dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockCountName, setStockCountName] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [stockCountNote, setStockCountNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State for the active stock count
  const [activeStockCount, setActiveStockCount] = useState<{
    id: string;
    name: string;
    warehouse: string;
    note: string;
    date: string;
    products: ProductItem[];
    isActive: boolean;
  } | null>(null);

  // State for adjustment dialog
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedOpnameForAdjustment, setSelectedOpnameForAdjustment] =
    useState<string | null>(null);
  const [adjustmentSummary, setAdjustmentSummary] = useState<{
    totalAdjustments: number;
    increaseCount: number;
    decreaseCount: number;
    details: Array<{ sku: string; difference: number }>;
  }>({ totalAdjustments: 0, increaseCount: 0, decreaseCount: 0, details: [] });

  // Filter products based on selected category
  const filteredProducts = activeStockCount
    ? activeStockCount.products.filter(
        (product) =>
          selectedCategory === "all" || product.category === selectedCategory,
      )
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "discrepancy":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Discrepancy
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleStartNewStockCount = () => {
    setIsDialogOpen(true);
  };

  const handleCreateStockCount = () => {
    if (!stockCountName || !selectedWarehouse) return;

    const newStockCount = {
      id: uuidv4(),
      name: stockCountName,
      warehouse: selectedWarehouse,
      note: stockCountNote,
      date: new Date().toISOString(),
      products: [...products], // Clone the products for this stock count
      isActive: true,
    };

    setActiveStockCount(newStockCount);

    // Add to history as pending
    const newHistoryItem: StockOpnameItem = {
      id: newStockCount.id,
      date: newStockCount.date,
      status: "pending",
      totalItems: products.length,
      matchedItems: 0,
      discrepancies: 0,
      warehouse: selectedWarehouse,
      adjustmentApplied: false,
    };

    const updatedHistory = [newHistoryItem, ...opnameHistory];
    setOpnameHistory(updatedHistory);
    saveToLocalStorage("warehouse-opname-history", updatedHistory);

    // Reset form and close dialog
    setStockCountName("");
    setSelectedWarehouse("");
    setStockCountNote("");
    setIsDialogOpen(false);
  };

  const handleUpdateCountedQuantity = (productId: string, quantity: number) => {
    if (!activeStockCount) return;

    setActiveStockCount({
      ...activeStockCount,
      products: activeStockCount.products.map((product) =>
        product.id === productId
          ? { ...product, countedQuantity: quantity }
          : product,
      ),
    });
  };

  const handleCompleteStockCount = () => {
    if (!activeStockCount) return;

    // Calculate matches and discrepancies
    let matches = 0;
    let discrepancies = 0;

    activeStockCount.products.forEach((product) => {
      if (product.countedQuantity === undefined) {
        discrepancies++;
      } else if (product.countedQuantity === product.systemQuantity) {
        matches++;
      } else {
        discrepancies++;
      }
    });

    // Update history item
    const updatedHistory = opnameHistory.map((item) => {
      if (item.id === activeStockCount.id) {
        return {
          ...item,
          status: discrepancies > 0 ? "discrepancy" : "completed",
          matchedItems: matches,
          discrepancies: discrepancies,
        };
      }
      return item;
    });

    setOpnameHistory(updatedHistory);
    saveToLocalStorage("warehouse-opname-history", updatedHistory);
    setActiveStockCount(null);
  };

  const handleOpenAdjustmentDialog = (opnameId: string) => {
    const opname = opnameHistory.find((item) => item.id === opnameId);
    if (!opname || opname.adjustmentApplied) return;

    // Find the completed stock count data
    const stockCountData = activeStockCount?.products || products;

    // Calculate adjustment summary
    const details: Array<{ sku: string; difference: number }> = [];
    let increases = 0;
    let decreases = 0;

    stockCountData.forEach((product) => {
      if (
        product.countedQuantity !== undefined &&
        product.countedQuantity !== product.systemQuantity
      ) {
        const difference = product.countedQuantity - product.systemQuantity;
        details.push({
          sku: product.sku,
          difference: difference,
        });

        if (difference > 0) increases++;
        if (difference < 0) decreases++;
      }
    });

    setAdjustmentSummary({
      totalAdjustments: details.length,
      increaseCount: increases,
      decreaseCount: decreases,
      details: details,
    });

    setSelectedOpnameForAdjustment(opnameId);
    setIsAdjustmentDialogOpen(true);
  };

  const handleApplyAdjustment = () => {
    if (!selectedOpnameForAdjustment) return;

    // Mark the opname as adjusted
    const updatedHistory = opnameHistory.map((item) =>
      item.id === selectedOpnameForAdjustment
        ? { ...item, adjustmentApplied: true }
        : item,
    );

    setOpnameHistory(updatedHistory);
    saveToLocalStorage("warehouse-opname-history", updatedHistory);
    setIsAdjustmentDialogOpen(false);
    setSelectedOpnameForAdjustment(null);
  };

  const getWarehouseName = (code: string) => {
    switch (code) {
      case "main":
        return "Main Warehouse";
      case "secondary":
        return "Secondary Warehouse";
      case "outlet":
        return "Retail Outlet";
      default:
        return code;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Stock Opname</h2>
          <Button
            className="flex items-center gap-2"
            onClick={handleStartNewStockCount}
            disabled={activeStockCount !== null}
          >
            <ClipboardCheck className="h-4 w-4" />
            Start New Stock Count
          </Button>
        </div>
        <p className="text-muted-foreground">
          Calculate the actual physical number of product units and compare with
          system records. Stock Opname helps validate inventory accuracy by
          comparing physical counts with calculated values from incoming box
          records.
        </p>
      </div>

      {activeStockCount && (
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Stock Count: {activeStockCount.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Warehouse: {getWarehouseName(activeStockCount.warehouse)}
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="men_shoes">Men's Shoes</SelectItem>
                  <SelectItem value="women_shoes">Women's Shoes</SelectItem>
                  <SelectItem value="men_sandals">Men's Sandals</SelectItem>
                  <SelectItem value="women_sandals">Women's Sandals</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={handleCompleteStockCount}
              >
                Complete Count
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeStockCount.note && (
                <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                  <p className="font-medium mb-1">Note:</p>
                  <p>{activeStockCount.note}</p>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-800">
                <p className="font-medium mb-1">How to perform Stock Opname:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Count the actual physical units (pairs) of each product in
                    the warehouse
                  </li>
                  <li>Enter the counted quantity in the "Counted Qty" field</li>
                  <li>
                    The system will automatically compare with the calculated
                    system quantity
                  </li>
                  <li>
                    After completing the count, you can apply adjustments to
                    correct inventory records
                  </li>
                </ol>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">SKU</th>
                      <th className="text-left p-3">Product Details</th>
                      <th className="text-left p-3">System Qty</th>
                      <th className="text-left p-3">Source</th>
                      <th className="text-left p-3">Counted Qty</th>
                      <th className="text-left p-3">Difference</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const isMatched =
                        product.countedQuantity === product.systemQuantity;
                      const hasDiscrepancy =
                        product.countedQuantity !== undefined && !isMatched;
                      const difference =
                        product.countedQuantity !== undefined
                          ? product.countedQuantity - product.systemQuantity
                          : null;

                      return (
                        <tr key={product.id} className="border-t">
                          <td className="p-3">{product.sku}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Size: {product.size}, Color: {product.color}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            {product.systemQuantity} pairs
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {product.source}
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={product.countedQuantity || ""}
                              onChange={(e) =>
                                handleUpdateCountedQuantity(
                                  product.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-24"
                            />
                          </td>
                          <td className="p-3">
                            {difference !== null && (
                              <span
                                className={
                                  difference > 0
                                    ? "text-green-600"
                                    : difference < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }
                              >
                                {difference > 0 ? "+" : ""}
                                {difference}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {product.countedQuantity === undefined ? (
                              <Badge variant="outline">Not Counted</Badge>
                            ) : isMatched ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Match
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />{" "}
                                Discrepancy
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Stock Opname History</CardTitle>
          <CardDescription>
            History of physical inventory counts and their reconciliation with
            system records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opnameHistory.map((item) => (
              <div key={item.id} className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    Stock Count #{item.id.substring(0, 8)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <span>Warehouse: {getWarehouseName(item.warehouse)}</span>
                  {item.adjustmentApplied && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-50 text-blue-800 border-blue-200"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Adjusted
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="font-semibold">{item.totalItems}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">Matched</p>
                    <p className="font-semibold">{item.matchedItems}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">
                      Discrepancies
                    </p>
                    <p className="font-semibold">{item.discrepancies}</p>
                  </div>
                </div>
                {item.status === "discrepancy" && (
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-red-800">
                      Discrepancies found between physical count and system
                      records.
                    </p>
                    {!item.adjustmentApplied && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleOpenAdjustmentDialog(item.id)}
                      >
                        Apply Adjustments
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Stock Count Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start New Stock Count</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={stockCountName}
                onChange={(e) => setStockCountName(e.target.value)}
                className="col-span-3"
                placeholder="Monthly Stock Count"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warehouse" className="text-right">
                Warehouse
              </Label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Warehouse</SelectItem>
                  <SelectItem value="secondary">Secondary Warehouse</SelectItem>
                  <SelectItem value="outlet">Retail Outlet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input
                id="note"
                value={stockCountNote}
                onChange={(e) => setStockCountNote(e.target.value)}
                className="col-span-3"
                placeholder="Optional note"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreateStockCount}
              disabled={!stockCountName || !selectedWarehouse}
            >
              Start Count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply Inventory Adjustments</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                About Stock Adjustments
              </h4>
              <p className="text-sm text-blue-700">
                Stock Opname provides information on the actual physical number
                of units in your warehouse. Applying these adjustments will
                update your inventory records to match the physical count,
                ensuring accurate stock levels for future operations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  Total Adjustments
                </p>
                <p className="text-xl font-semibold">
                  {adjustmentSummary.totalAdjustments}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-md text-center">
                <p className="text-sm text-green-700">Quantity Increases</p>
                <p className="text-xl font-semibold text-green-700">
                  {adjustmentSummary.increaseCount}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-md text-center">
                <p className="text-sm text-red-700">Quantity Decreases</p>
                <p className="text-xl font-semibold text-red-700">
                  {adjustmentSummary.decreaseCount}
                </p>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2">SKU</th>
                    <th className="text-left p-2">Adjustment</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustmentSummary.details.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.sku}</td>
                      <td className="p-2">
                        <span
                          className={
                            item.difference > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.difference > 0 ? "+" : ""}
                          {item.difference} pairs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleApplyAdjustment} className="bg-primary">
              Apply Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockOpname;
