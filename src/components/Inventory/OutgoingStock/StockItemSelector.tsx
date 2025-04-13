import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { AggregatedStockItem } from "../SingleWarehouseStock";

interface StockItemSelectorProps {
  availableStock: AggregatedStockItem[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddItem: (item: AggregatedStockItem) => void;
}

const StockItemSelector: React.FC<StockItemSelectorProps> = ({
  availableStock,
  searchTerm,
  onSearchChange,
  onAddItem,
}) => {
  const filteredStock = availableStock.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="border rounded-md shadow-sm">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-primary">Available Stock</h3>
        <div className="relative w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-10 text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 max-h-[450px] overflow-y-auto pr-3">
        {filteredStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-dashed border-slate-300 text-center">
            <p className="text-sm text-muted-foreground mb-2">No items found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-primary/30 cursor-pointer transition-all duration-200 shadow-sm mb-2.5"
                onClick={() => onAddItem(item)}
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
                      onAddItem(item);
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
  );
};

export default StockItemSelector;
