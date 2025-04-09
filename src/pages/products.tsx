import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import ProductList, { Product } from "@/components/Products/ProductList";
import ProductForm from "@/components/Products/ProductForm";
import { v4 as uuidv4 } from "uuid";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";

// Default products data
const defaultProducts: Product[] = [
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
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = loadFromLocalStorage<Product[]>(
      "warehouse-products",
      defaultProducts,
    );
    // Ensure products is always an array
    setProducts(Array.isArray(savedProducts) ? savedProducts : defaultProducts);
  }, []);

  const handleAddProduct = (formData: Omit<Product, "id">) => {
    const newProduct = {
      id: uuidv4(),
      ...formData,
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveToLocalStorage("warehouse-products", updatedProducts);
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = (formData: Omit<Product, "id">) => {
    if (!currentProduct) return;

    const updatedProducts = products.map((product) =>
      product.id === currentProduct.id ? { ...product, ...formData } : product,
    );

    setProducts(updatedProducts);
    saveToLocalStorage("warehouse-products", updatedProducts);
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!currentProduct) return;

    const filteredProducts = products.filter(
      (product) => product.id !== currentProduct.id,
    );

    setProducts(filteredProducts);
    saveToLocalStorage("warehouse-products", filteredProducts);
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(product.category)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const getCategoryLabel = (categoryValue: string): string => {
    const categories: Record<string, string> = {
      men_shoes: "Men's Shoes",
      women_shoes: "Women's Shoes",
      men_sandals: "Men's Sandals",
      women_sandals: "Women's Sandals",
      kids_shoes: "Kids' Shoes",
      sports: "Sports Footwear",
    };

    return categories[categoryValue] || categoryValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Product Master</h2>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="box-specs">Box Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Add Product
                  </button>
                </div>
                <ProductList
                  products={filteredProducts}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  onAdd={() => setIsAddDialogOpen(true)}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="box-specs" className="mt-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Box Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Box specifications and packaging details will be implemented
                here.
              </p>
              <div className="h-[400px] flex items-center justify-center border rounded-md mt-4">
                <p className="text-muted-foreground">
                  Box specification management will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <ProductForm
              initialData={currentProduct}
              onSubmit={handleEditProduct}
            />
          )}
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
              This will permanently delete the product "{currentProduct?.name}"
              ({currentProduct?.sku}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
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

export default Products;
