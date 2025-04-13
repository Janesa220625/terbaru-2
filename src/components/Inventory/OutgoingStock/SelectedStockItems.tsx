import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SelectedStockItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

interface SelectedStockItemsProps {
  items: SelectedStockItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearAll: () => void;
}

const SelectedStockItems: React.FC<SelectedStockItemsProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
}) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md border border-dashed border-slate-300 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          No items selected yet
        </p>
        <p className="text-xs text-muted-foreground">
          Select items from the available stock list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-xs font-medium text-muted-foreground">
          Total Items: {totalItems}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-destructive hover:text-destructive/90"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      </div>

      {items.map((item) => (
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
                  onUpdateQuantity(item.id, item.quantity - 1);
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
                    onUpdateQuantity(item.id, val);
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-l-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(item.id, item.quantity + 1);
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
                onRemoveItem(item.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectedStockItems;
