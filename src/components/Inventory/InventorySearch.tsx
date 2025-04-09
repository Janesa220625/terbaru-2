import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Package, Ruler, Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadFromLocalStorage } from "@/lib/storage";

interface StockItem {
  id: string;
  sku: string;
  name?: string;
  size: string;
  color: string;
  quantity: number;
  stockLevel: "low" | "medium" | "high";
  boxId?: string;
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

const InventorySearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<
    (StockItem & { productName?: string })[]
  >([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const loadedStockItems = loadFromLocalStorage<StockItem[]>(
        "warehouse-unit-stock",
        [],
      );
      const loadedProducts = loadFromLocalStorage<Product[]>(
        "warehouse-products",
        [],
      );

      setStockItems(loadedStockItems);
      setProducts(loadedProducts);

      // Extract unique sizes and colors
      const sizes = Array.from(
        new Set(loadedStockItems.map((item) => item.size)),
      );
      const colors = Array.from(
        new Set(loadedStockItems.map((item) => item.color)),
      );

      setAvailableSizes(sizes);
      setAvailableColors(colors);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  }, []);

  // Apply filters whenever search criteria changes
  useEffect(() => {
    const enrichedItems = stockItems.map((item) => {
      const product = products.find(
        (p) => p.sku === item.sku.split("-").slice(0, 3).join("-"),
      );
      return {
        ...item,
        productName: product?.name,
      };
    });

    const filtered = enrichedItems.filter((item) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.productName &&
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const product = products.find(
        (p) => p.sku === item.sku.split("-").slice(0, 3).join("-"),
      );
      const matchesCategory =
        categoryFilter === "all" ||
        (product && product.category === categoryFilter);

      // Size filter
      const matchesSize = sizeFilter === "all" || item.size === sizeFilter;

      // Color filter
      const matchesColor = colorFilter === "all" || item.color === colorFilter;

      // Stock level filter
      const matchesStockLevel =
        stockLevelFilter === "all" || item.stockLevel === stockLevelFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesColor &&
        matchesStockLevel
      );
    });

    setFilteredItems(filtered);
  }, [
    searchTerm,
    categoryFilter,
    sizeFilter,
    colorFilter,
    stockLevelFilter,
    stockItems,
    products,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSizeFilter("all");
    setColorFilter("all");
    setStockLevelFilter("all");
  };

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
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Inventory Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by SKU or product name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="men_shoes">Men's Shoes</SelectItem>
                  <SelectItem value="women_shoes">Women's Shoes</SelectItem>
                  <SelectItem value="men_sandals">Men's Sandals</SelectItem>
                  <SelectItem value="women_sandals">Women's Sandals</SelectItem>
                  <SelectItem value="kids_shoes">Kids' Shoes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {availableColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={stockLevelFilter}
                onValueChange={setStockLevelFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="medium">Medium Stock</SelectItem>
                  <SelectItem value="high">High Stock</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm ||
            categoryFilter !== "all" ||
            sizeFilter !== "all" ||
            colorFilter !== "all" ||
            stockLevelFilter !== "all") && (
            <div className="flex flex-wrap gap-2 py-2">
              <div className="text-sm text-muted-foreground mr-2 flex items-center">
                <Filter className="h-3 w-3 mr-1" /> Active Filters:
              </div>

              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}

              {categoryFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Category: {categoryFilter.replace("_", " ")}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setCategoryFilter("all")}
                  />
                </Badge>
              )}

              {sizeFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Size: {sizeFilter}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSizeFilter("all")}
                  />
                </Badge>
              )}

              {colorFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Color: {colorFilter}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setColorFilter("all")}
                  />
                </Badge>
              )}

              {stockLevelFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Stock: {stockLevelFilter}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setStockLevelFilter("all")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Results */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">
              Search Results ({filteredItems.length} items)
            </h3>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Loading inventory data...
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">
                  No items match your search criteria
                </p>
                {(searchTerm ||
                  categoryFilter !== "all" ||
                  sizeFilter !== "all" ||
                  colorFilter !== "all" ||
                  stockLevelFilter !== "all") && (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">
                        {item.productName || item.sku}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.sku}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Ruler className="h-3.5 w-3.5" /> Size:
                        </span>
                        <Badge variant="outline">{item.size}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Palette className="h-3.5 w-3.5" /> Color:
                        </span>
                        <Badge variant="outline">{item.color}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Quantity:</span>
                        <span className="font-semibold">
                          {item.quantity} pairs
                        </span>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventorySearch;
