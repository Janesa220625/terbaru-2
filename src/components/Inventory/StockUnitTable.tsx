import React, { useState, useMemo } from "react";
import {
  Boxes,
  Ruler,
  Palette,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  User,
  ArrowUpDown,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { StockUnitItem } from "@/lib/hooks/useStockUnits";
import { useProductData } from "@/lib/hooks/useProductData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface StockUnitTableProps {
  stockBySku: Record<string, StockUnitItem[]>;
  searchTerm: string;
  getProductForSku: (sku: string) => any;
  onUpdateUnit: (unit: StockUnitItem, userName: string) => void;
  onDeleteUnit: (unitId: string) => void;
}

type SortField = "date" | "quantity" | "size" | "color";
type SortDirection = "asc" | "desc";

const StockUnitTable: React.FC<StockUnitTableProps> = ({
  stockBySku,
  searchTerm,
  getProductForSku,
  onUpdateUnit,
  onDeleteUnit,
}) => {
  const [editingUnit, setEditingUnit] = useState<StockUnitItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedValues, setEditedValues] = useState<Partial<StockUnitItem>>({});
  const [userName, setUserName] = useState(
    localStorage.getItem("warehouse-last-user") || "",
  );
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleEditClick = (unit: StockUnitItem) => {
    setEditingUnit(unit);
    setEditedValues({
      size: unit.size,
      color: unit.color,
      quantity: unit.quantity,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUnit) return;

    const updatedUnit: StockUnitItem = {
      ...editingUnit,
      size: editedValues.size || editingUnit.size,
      color: editedValues.color || editingUnit.color,
      quantity: editedValues.quantity || editingUnit.quantity,
    };

    onUpdateUnit(updatedUnit, userName);
    setEditDialogOpen(false);
    setEditingUnit(null);

    // Save the user name for future use
    if (userName) {
      localStorage.setItem("warehouse-last-user", userName);
    }
  };

  // Function to toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort units based on current sort field and direction
  const sortedStockBySku = useMemo(() => {
    const result: Record<string, StockUnitItem[]> = {};

    Object.entries(stockBySku)
      .filter(([sku]) => sku.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(([sku, units]) => {
        // Create a sorted copy of the units array
        const sortedUnits = [...units].sort((a, b) => {
          if (sortField === "date") {
            // Ensure we're handling both Date objects and string dates
            const dateA =
              a.dateAdded instanceof Date
                ? a.dateAdded.getTime()
                : new Date(a.dateAdded).getTime();
            const dateB =
              b.dateAdded instanceof Date
                ? b.dateAdded.getTime()
                : new Date(b.dateAdded).getTime();
            // For date sorting, always prioritize newest dates first when desc
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
          } else if (sortField === "quantity") {
            return sortDirection === "asc"
              ? a.quantity - b.quantity
              : b.quantity - a.quantity;
          } else if (sortField === "size") {
            return sortDirection === "asc"
              ? a.size.localeCompare(b.size)
              : b.size.localeCompare(a.size);
          } else if (sortField === "color") {
            return sortDirection === "asc"
              ? a.color.localeCompare(b.color)
              : b.color.localeCompare(a.color);
          }
          return 0;
        });

        result[sku] = sortedUnits;
      });

    return result;
  }, [stockBySku, searchTerm, sortField, sortDirection]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort("date")}
          className={`flex items-center gap-1 ${sortField === "date" ? "border-primary" : ""}`}
        >
          <Clock className="h-4 w-4" />
          Date
          {sortField === "date" && (
            <ArrowUpDown
              className={`h-3 w-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`}
            />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort("quantity")}
          className={`flex items-center gap-1 ${sortField === "quantity" ? "border-primary" : ""}`}
        >
          <Boxes className="h-4 w-4" />
          Quantity
          {sortField === "quantity" && (
            <ArrowUpDown
              className={`h-3 w-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`}
            />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort("size")}
          className={`flex items-center gap-1 ${sortField === "size" ? "border-primary" : ""}`}
        >
          <Ruler className="h-4 w-4" />
          Size
          {sortField === "size" && (
            <ArrowUpDown
              className={`h-3 w-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`}
            />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort("color")}
          className={`flex items-center gap-1 ${sortField === "color" ? "border-primary" : ""}`}
        >
          <Palette className="h-4 w-4" />
          Color
          {sortField === "color" && (
            <ArrowUpDown
              className={`h-3 w-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`}
            />
          )}
        </Button>
      </div>

      {Object.entries(sortedStockBySku).map(([sku, units]) => {
        // Get product details for this SKU
        const product = getProductForSku(sku);
        const totalQuantity = units.reduce(
          (sum, unit) => sum + unit.quantity,
          0,
        );

        return (
          <div key={sku} className="border rounded-md p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">{sku}</h3>
                {product && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.name}
                  </span>
                )}
              </div>
              <div className="mt-2 md:mt-0 flex items-center gap-2">
                <span className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                  Total: {totalQuantity} pairs
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="border rounded-md p-3 bg-background hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Size: {unit.size}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Color: {unit.color}
                      </span>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded-md">
                    <span className="font-bold">{unit.quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      pairs
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    {unit.dateAdded && unit.addedBy && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Added by {unit.addedBy}</span>
                      </div>
                    )}
                    {unit.manufactureDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          Manufactured on{" "}
                          {format(
                            new Date(unit.manufactureDate),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </div>
                    )}
                    {!unit.manufactureDate && unit.dateAdded && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Added on{" "}
                          {format(
                            new Date(unit.dateAdded),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </span>
                      </div>
                    )}
                    {unit.lastModified && unit.modifiedBy && (
                      <div className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        <span>
                          Modified by {unit.modifiedBy} on{" "}
                          {format(
                            new Date(unit.lastModified),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleEditClick(unit)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => onDeleteUnit(unit.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingUnit && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-sku" className="text-right">
                    SKU
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-sku"
                      value={editingUnit.sku}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">
                    Date Added
                  </Label>
                  <div className="col-span-3">
                    <div className="text-sm text-muted-foreground">
                      {editingUnit.dateAdded
                        ? format(new Date(editingUnit.dateAdded), "PPP p")
                        : "Not available"}
                      <span className="text-xs block mt-1">
                        (Original date preserved for tracking)
                      </span>
                    </div>
                  </div>
                </div>

                {editingUnit.manufactureDate && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="edit-manufacture-date"
                      className="text-right"
                    >
                      Manufacture Date
                    </Label>
                    <div className="col-span-3">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(editingUnit.manufactureDate), "PPP p")}
                        <span className="text-xs block mt-1">
                          (Manufacture date preserved for tracking)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-size" className="text-right">
                    Size
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-size"
                      value={editedValues.size || ""}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          size: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-color" className="text-right">
                    Color
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-color"
                      value={editedValues.color || ""}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          color: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Quantity
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-quantity"
                      type="number"
                      min={1}
                      value={editedValues.quantity || ""}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-user" className="text-right">
                    Your Name
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-user"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Check className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockUnitTable;
