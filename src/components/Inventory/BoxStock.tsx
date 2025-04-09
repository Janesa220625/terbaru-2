import React, { useState, useEffect } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Search, RefreshCw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface DeliveryItem {
  id: string;
  date: string;
  sku: string;
  boxCount: number;
  pairsPerBox: number;
  totalPairs: number;
  productName?: string;
  account?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  pairsPerBox: number;
  sizes: string;
  colors: string;
}

interface StockUnit {
  id: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  boxId: string;
}

const BoxStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockItems, setStockItems] = useState<BoxStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<string>("boxCount-desc");

  // Function to calculate stock level based on box count
  const calculateStockLevel = (boxCount: number): "low" | "medium" | "high" => {
    if (boxCount <= 15) return "low";
    if (boxCount <= 30) return "medium";
    return "high";
  };

  // Function to sync box stock with incoming deliveries
  const syncBoxStock = () => {
    setIsLoading(true);

    // Load incoming deliveries
    const deliveries = loadFromLocalStorage<DeliveryItem[]>(
      "warehouse-deliveries",
      [],
    );

    // Load products for additional info
    const products = loadFromLocalStorage<Product[]>("warehouse-products", []);

    // Load existing stock units to account for allocated pairs
    const stockUnits = loadFromLocalStorage<StockUnit[]>(
      "warehouse-stock-units",
      [],
    );

    // Load outgoing documents to account for items that have been shipped out
    const outgoingDocuments = loadFromLocalStorage(
      "warehouse-outgoing-documents",
      [],
    );

    // Calculate allocated pairs by SKU
    const allocatedPairsBySku: Record<string, number> = {};
    stockUnits.forEach((unit) => {
      const sku = unit.sku.toLowerCase();
      if (!allocatedPairsBySku[sku]) {
        allocatedPairsBySku[sku] = 0;
      }
      allocatedPairsBySku[sku] += unit.quantity;
    });

    // Group deliveries by SKU and calculate totals
    const stockBySku = deliveries.reduce(
      (acc, delivery) => {
        const sku = delivery.sku;
        if (!acc[sku]) {
          const product = products.find((p) => p.sku === sku);
          acc[sku] = {
            id: `box-${sku}`,
            sku: sku,
            name: delivery.productName || product?.name || sku,
            category: product?.category || "unknown",
            boxCount: 0,
            pairsPerBox: delivery.pairsPerBox,
            totalPairs: 0,
            stockLevel: "low",
          };
        }

        acc[sku].boxCount += delivery.boxCount;
        acc[sku].totalPairs += delivery.totalPairs;

        return acc;
      },
      {} as Record<string, BoxStockItem>,
    );

    // Adjust box counts and total pairs based on allocated stock units
    Object.entries(stockBySku).forEach(([sku, item]) => {
      const lowerSku = sku.toLowerCase();
      const allocatedPairs = allocatedPairsBySku[lowerSku] || 0;

      if (allocatedPairs > 0 && item.pairsPerBox > 0) {
        // Calculate how many pairs should be subtracted from the total
        const pairsToSubtract = Math.min(allocatedPairs, item.totalPairs);

        // Calculate how many boxes that represents (round up to ensure we don't over-allocate)
        const boxesToReduce = Math.ceil(pairsToSubtract / item.pairsPerBox);

        // Ensure we don't reduce below zero
        item.boxCount = Math.max(0, item.boxCount - boxesToReduce);
        item.totalPairs = Math.max(0, item.totalPairs - pairsToSubtract);
      }
    });

    // Convert to array and calculate stock levels
    const updatedStockItems = Object.values(stockBySku).map((item) => ({
      ...item,
      stockLevel: calculateStockLevel(item.boxCount),
    }));

    // Save to localStorage and update state
    saveToLocalStorage("warehouse-box-stock", updatedStockItems);
    setStockItems(updatedStockItems);
    setIsLoading(false);
  };

  useEffect(() => {
    // First try to load from localStorage
    const savedStockItems = loadFromLocalStorage<BoxStockItem[]>(
      "warehouse-box-stock",
      [],
    );

    // If no data or empty, sync with incoming deliveries
    if (savedStockItems.length === 0) {
      syncBoxStock();
    } else {
      setStockItems(savedStockItems);
      setIsLoading(false);
    }
  }, []);

  // Sort and filter items
  const sortAndFilterItems = () => {
    // First filter the items
    let filtered = stockItems.filter(
      (item) =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Then sort the filtered items
    const [sortField, sortDirection] = sortOption.split("-");

    return filtered.sort((a, b) => {
      if (sortField === "boxCount") {
        return sortDirection === "desc"
          ? b.boxCount - a.boxCount
          : a.boxCount - b.boxCount;
      } else if (sortField === "name") {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortDirection === "desc"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }
      return 0;
    });
  };

  const filteredItems = sortAndFilterItems();

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Box Stock</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={syncBoxStock}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          Sync with Deliveries
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by SKU or name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boxCount-desc">
                Box Count: Most to Least
              </SelectItem>
              <SelectItem value="boxCount-asc">
                Box Count: Least to Most
              </SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Current Box Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Loading inventory data...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No items match your search"
                  : "No box stock found. Add deliveries to see box stock."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Boxes className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">{item.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.sku}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Box Count:</span>
                      <span className="font-semibold">{item.boxCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Pairs Per Box:
                      </span>
                      <span className="font-semibold">{item.pairsPerBox}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Total Pairs:
                      </span>
                      <span className="font-semibold">{item.totalPairs}</span>
                    </div>
                    <div className="mt-2">
                      <Badge
                        className={`${getStockLevelColor(
                          item.stockLevel,
                        )} w-full justify-center py-1`}
                      >
                        {item.stockLevel.charAt(0).toUpperCase() +
                          item.stockLevel.slice(1)}{" "}
                        Stock
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BoxStock;
