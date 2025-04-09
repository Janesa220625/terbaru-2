import React, { useState, useEffect } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PackagePlus,
  Truck,
  Barcode,
  Calendar,
  Pencil,
  Trash2,
  AlertCircle,
  Search,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  pairsPerBox: number;
  sizes: string;
  colors: string;
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

const IncomingBoxStock = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deliveryToEdit, setDeliveryToEdit] = useState<string | null>(null);
  const [deliveryToDelete, setDeliveryToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  // Filter states
  const [filterSku, setFilterSku] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryItem[]>(
    [],
  );
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const savedDeliveries = loadFromLocalStorage<DeliveryItem[]>(
      "warehouse-deliveries",
      [
        {
          id: "1001",
          date: new Date(Date.now() - 86400000).toISOString(),
          sku: "SKU-123-BLK",
          boxCount: 5,
          pairsPerBox: 6,
          totalPairs: 30,
          productName: "Men's Casual Shoes",
          account: "John Doe",
        },
        {
          id: "1002",
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          sku: "SKU-456-RED",
          boxCount: 10,
          pairsPerBox: 8,
          totalPairs: 80,
          productName: "Women's Heels",
          account: "Jane Smith",
        },
        {
          id: "1003",
          date: new Date(Date.now() - 3 * 86400000).toISOString(),
          sku: "SKU-789-BRN",
          boxCount: 15,
          pairsPerBox: 10,
          totalPairs: 150,
          productName: "Men's Sandals",
          account: "Mike Johnson",
        },
      ],
    );
    setDeliveries(savedDeliveries);
    setFilteredDeliveries(savedDeliveries);

    // Load products from localStorage
    const savedProducts = loadFromLocalStorage<Product[]>(
      "warehouse-products",
      [
        {
          id: "1",
          sku: "SKU-123-BLK",
          name: "Men's Casual Shoes",
          category: "men_shoes",
          pairsPerBox: 6,
          sizes: "40,41,42,43,44,45",
          colors: "Black,Brown,Navy",
        },
        {
          id: "2",
          sku: "SKU-456-RED",
          name: "Women's Heels",
          category: "women_shoes",
          pairsPerBox: 8,
          sizes: "36,37,38,39,40",
          colors: "Red,Black,Beige",
        },
        {
          id: "3",
          sku: "SKU-789-BRN",
          name: "Men's Sandals",
          category: "men_sandals",
          pairsPerBox: 10,
          sizes: "39,40,41,42,43,44",
          colors: "Brown,Black",
        },
        {
          id: "4",
          sku: "SKU-101-WHT",
          name: "Women's Sandals",
          category: "women_sandals",
          pairsPerBox: 12,
          sizes: "36,37,38,39,40",
          colors: "White,Pink,Blue",
        },
        {
          id: "5",
          sku: "SKU-202-BLU",
          name: "Kids' Sport Shoes",
          category: "kids_shoes",
          pairsPerBox: 8,
          sizes: "28,29,30,31,32,33,34",
          colors: "Blue,Red,Green",
        },
      ],
    );
    setProducts(savedProducts);
  }, []);

  const [newDelivery, setNewDelivery] = useState({
    sku: "",
    boxCount: 0,
    pairsPerBox: 0,
    account: "",
  });

  const resetForm = () => {
    setNewDelivery({ sku: "", boxCount: 0, pairsPerBox: 0, account: "" });
    setIsEditing(false);
    setDeliveryToEdit(null);
    setSkuError(null);
    setProductName(null);
  };

  const handleEditDelivery = (id: string) => {
    const deliveryToEdit = deliveries.find((delivery) => delivery.id === id);
    if (deliveryToEdit) {
      setNewDelivery({
        sku: deliveryToEdit.sku,
        boxCount: deliveryToEdit.boxCount,
        pairsPerBox: deliveryToEdit.pairsPerBox,
        account: deliveryToEdit.account || "",
      });
      setIsEditing(true);
      setDeliveryToEdit(id);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteDelivery = (id: string) => {
    setDeliveryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDelivery = () => {
    if (deliveryToDelete) {
      const updatedDeliveries = deliveries.filter(
        (delivery) => delivery.id !== deliveryToDelete,
      );
      setDeliveries(updatedDeliveries);
      setFilteredDeliveries(applyFilters(updatedDeliveries));
      saveToLocalStorage("warehouse-deliveries", updatedDeliveries);
      setIsDeleteDialogOpen(false);
      setDeliveryToDelete(null);
    }
  };

  const findProductBySku = (sku: string) => {
    return products.find(
      (product) => product.sku.toLowerCase() === sku.toLowerCase(),
    );
  };

  const handleSkuChange = (sku: string) => {
    setNewDelivery({ ...newDelivery, sku });
    setSkuError(null);
    setProductName(null);

    if (sku.trim() === "") return;

    const product = findProductBySku(sku);
    if (product) {
      setNewDelivery((prev) => ({
        ...prev,
        sku,
        pairsPerBox: product.pairsPerBox,
      }));
      setProductName(product.name);
    } else {
      setSkuError("Product not found. Please check the SKU.");
    }
  };

  const handleAddDelivery = () => {
    if (!newDelivery.sku || newDelivery.boxCount <= 0 || !newDelivery.account)
      return;
    if (skuError) return;

    let updatedDeliveries;

    if (isEditing && deliveryToEdit) {
      // Update existing delivery
      updatedDeliveries = deliveries.map((delivery) => {
        if (delivery.id === deliveryToEdit) {
          return {
            ...delivery,
            sku: newDelivery.sku,
            boxCount: newDelivery.boxCount,
            pairsPerBox: newDelivery.pairsPerBox,
            totalPairs: newDelivery.boxCount * newDelivery.pairsPerBox,
            productName: productName || undefined,
            account: newDelivery.account || undefined,
          };
        }
        return delivery;
      });
    } else {
      // Add new delivery
      const delivery: DeliveryItem = {
        id: `${1000 + deliveries.length + 1}`,
        date: new Date().toISOString(),
        sku: newDelivery.sku,
        boxCount: newDelivery.boxCount,
        pairsPerBox: newDelivery.pairsPerBox,
        totalPairs: newDelivery.boxCount * newDelivery.pairsPerBox,
        productName: productName || undefined,
        account: newDelivery.account || undefined,
      };
      updatedDeliveries = [delivery, ...deliveries];
    }

    setDeliveries(updatedDeliveries);
    setFilteredDeliveries(applyFilters(updatedDeliveries));
    saveToLocalStorage("warehouse-deliveries", updatedDeliveries);
    setIsDialogOpen(false);
    resetForm();
  };

  // Apply all filters to the deliveries
  const applyFilters = (items: DeliveryItem[]) => {
    let results = [...items];

    // Filter by SKU or product name
    if (filterSku) {
      results = results.filter(
        (item) =>
          item.sku.toLowerCase().includes(filterSku.toLowerCase()) ||
          (item.productName &&
            item.productName.toLowerCase().includes(filterSku.toLowerCase())),
      );
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      results = results.filter((item) => new Date(item.date) >= fromDate);
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter((item) => new Date(item.date) <= toDate);
    }

    // Filter by account
    if (filterAccount) {
      results = results.filter(
        (item) =>
          item.account &&
          item.account.toLowerCase().includes(filterAccount.toLowerCase()),
      );
    }

    return results;
  };

  // Update filtered deliveries when filters change
  useEffect(() => {
    setFilteredDeliveries(applyFilters(deliveries));
    setIsFiltering(
      filterSku !== "" ||
        filterDateFrom !== "" ||
        filterDateTo !== "" ||
        filterAccount !== "",
    );
  }, [deliveries, filterSku, filterDateFrom, filterDateTo, filterAccount]);

  // Clear all filters
  const clearFilters = () => {
    setFilterSku("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterAccount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Incoming Box Stock
        </h2>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <PackagePlus className="h-4 w-4" />
          Record New Delivery
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Filter Deliveries</CardTitle>
            {isFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterSku">Product SKU/Name</Label>
              <div className="relative mt-1">
                <Input
                  id="filterSku"
                  placeholder="Search by SKU or name"
                  value={filterSku}
                  onChange={(e) => setFilterSku(e.target.value)}
                  className="pr-8"
                />
                {filterSku && (
                  <button
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilterSku("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="filterDateFrom">From Date</Label>
              <div className="relative mt-1">
                <Input
                  id="filterDateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="pr-8"
                />
                {filterDateFrom && (
                  <button
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilterDateFrom("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="filterDateTo">To Date</Label>
              <div className="relative mt-1">
                <Input
                  id="filterDateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="pr-8"
                />
                {filterDateTo && (
                  <button
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilterDateTo("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="filterAccount">Account</Label>
              <div className="relative mt-1">
                <Input
                  id="filterAccount"
                  placeholder="Search by account"
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="pr-8"
                />
                {filterAccount && (
                  <button
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilterAccount("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {isFiltering && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredDeliveries.length} of {deliveries.length}{" "}
              deliveries
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center p-4 border rounded-md"
                >
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Delivery #{delivery.id}</h3>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(delivery.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm flex items-center gap-1">
                        <Barcode className="h-3 w-3" />
                        {delivery.sku}
                        {delivery.productName && (
                          <span className="ml-1 text-muted-foreground">
                            ({delivery.productName})
                          </span>
                        )}
                      </span>
                      <span className="text-sm">{delivery.boxCount} boxes</span>
                      <span className="text-sm">
                        {delivery.totalPairs} pairs
                      </span>
                      {delivery.account && (
                        <span className="text-sm flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {delivery.account}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditDelivery(delivery.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDelivery(delivery.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No deliveries found matching your filters.
                {isFiltering && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Delivery Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Delivery" : "Record New Delivery"}
            </DialogTitle>
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
                    placeholder="SKU-123-BLK"
                    className={`pr-8 ${skuError ? "border-destructive" : ""}`}
                    value={newDelivery.sku}
                    onChange={(e) => handleSkuChange(e.target.value)}
                  />
                  {newDelivery.sku && !skuError && productName && (
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
              <Label htmlFor="boxCount" className="text-right">
                Box Count
              </Label>
              <Input
                id="boxCount"
                type="number"
                min={1}
                className="col-span-3"
                value={newDelivery.boxCount || ""}
                onChange={(e) =>
                  setNewDelivery({
                    ...newDelivery,
                    boxCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pairsPerBox" className="text-right">
                Pairs Per Box
              </Label>
              <div className="col-span-3">
                <Input
                  id="pairsPerBox"
                  type="number"
                  min={1}
                  className="col-span-3"
                  value={newDelivery.pairsPerBox || ""}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      pairsPerBox: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={!!productName}
                />
                {productName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-populated from product master
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="account"
                  placeholder="Enter account name"
                  className={`${!newDelivery.account && "border-destructive"}`}
                  value={newDelivery.account}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      account: e.target.value,
                    })
                  }
                  required
                />
                {!newDelivery.account && (
                  <p className="text-xs text-destructive">
                    Account name is required
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total Pairs</Label>
              <div className="col-span-3 font-medium">
                {newDelivery.boxCount * newDelivery.pairsPerBox || 0}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDelivery}
              disabled={
                !newDelivery.sku ||
                newDelivery.boxCount <= 0 ||
                !!skuError ||
                !newDelivery.account
              }
            >
              {isEditing ? "Save Changes" : "Add Delivery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              delivery record from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeliveryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDelivery}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomingBoxStock;
