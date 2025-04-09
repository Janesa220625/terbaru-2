import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStockUnits } from "@/lib/hooks/useStockUnits";
import { useProductData } from "@/lib/hooks/useProductData";
import { exportSingleWarehouseStock } from "@/lib/utils/singleWarehouseExport";
import { loadFromLocalStorage } from "@/lib/storage";

export interface AggregatedStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  totalPairs: number;
}

const SingleWarehouseStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof AggregatedStockItem>("sku");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [aggregatedStock, setAggregatedStock] = useState<AggregatedStockItem[]>(
    [],
  );

  // Get stock units and product data
  const { stockUnits } = useStockUnits();
  const { products, getProductForSku } = useProductData();

  // Aggregate stock units by SKU, color, and size, and account for outgoing stock
  useEffect(() => {
    if (stockUnits.length === 0 || products.length === 0) return;

    const aggregated: Record<string, AggregatedStockItem> = {};

    // First, aggregate all stock units
    stockUnits.forEach((unit) => {
      // Normalize color to lowercase for consistent matching
      const normalizedColor = unit.color.toLowerCase();
      const key = `${unit.sku}-${normalizedColor}-${unit.size}`;
      const product = getProductForSku(
        unit.sku.split("-").slice(0, 3).join("-"),
      );

      if (!aggregated[key]) {
        aggregated[key] = {
          id: key,
          sku: unit.sku,
          name: product?.name || "Unknown Product",
          category: product?.category || "uncategorized",
          size: unit.size,
          color: unit.color,
          totalPairs: 0,
        };
      }

      aggregated[key].totalPairs += unit.quantity;
    });

    // Then, subtract quantities from outgoing documents
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
              console.log(
                `Found matching key ${key} for outgoing item ${item.sku}-${item.color}-${item.size}`,
              );
            }
          }

          if (aggregated[key]) {
            // Subtract the outgoing quantity, ensuring we don't go below zero
            aggregated[key].totalPairs = Math.max(
              0,
              aggregated[key].totalPairs - item.quantity,
            );
            console.log(
              `Reduced ${item.quantity} from ${key}, remaining: ${aggregated[key].totalPairs}`,
            );
          } else {
            console.warn(
              `No matching stock found for outgoing item: ${item.sku}, size: ${item.size}, color: ${item.color}`,
            );
          }
        });
      }
    });

    setAggregatedStock(Object.values(aggregated));
  }, [stockUnits, products, getProductForSku]);

  // Filter items based on search term, category, and size
  const filteredItems = aggregatedStock.filter(
    (item) =>
      (searchTerm === "" ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (sizeFilter === "all" || item.size === sizeFilter) &&
      // Only show items with quantity greater than zero
      item.totalPairs > 0,
  );

  // Sort items based on sort field and direction
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === "totalPairs") {
      return sortDirection === "asc"
        ? a.totalPairs - b.totalPairs
        : b.totalPairs - a.totalPairs;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Handle sort change
  const handleSortChange = (field: keyof AggregatedStockItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort indicator
  const getSortIndicator = (field: keyof AggregatedStockItem) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "men_shoes", label: "Men's Shoes" },
    { value: "women_shoes", label: "Women's Shoes" },
    { value: "men_sandals", label: "Men's Sandals" },
    { value: "women_sandals", label: "Women's Sandals" },
    { value: "kids_shoes", label: "Kids' Shoes" },
  ];

  const sizes = [
    { value: "all", label: "All Sizes" },
    { value: "36", label: "36" },
    { value: "37", label: "37" },
    { value: "38", label: "38" },
    { value: "39", label: "39" },
    { value: "40", label: "40" },
    { value: "41", label: "41" },
    { value: "42", label: "42" },
    { value: "30", label: "30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Unit Stock</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => exportSingleWarehouseStock(sortedItems)}
        >
          <FileDown className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by SKU or name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="w-1/2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Aggregated Unit Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("sku")}
                  >
                    SKU{getSortIndicator("sku")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("name")}
                  >
                    Product Name{getSortIndicator("name")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("color")}
                  >
                    Color{getSortIndicator("color")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("size")}
                  >
                    Size{getSortIndicator("size")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSortChange("totalPairs")}
                  >
                    Total Pairs{getSortIndicator("totalPairs")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("category")}
                  >
                    Category{getSortIndicator("category")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No stock items found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.color}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.size}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.totalPairs}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleWarehouseStock;
