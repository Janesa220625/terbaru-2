import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Plus, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  pairsPerBox: number;
  sizes: string;
  colors: string;
}

interface ProductListProps {
  products?: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onAdd?: () => void;
}

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

const ProductList = ({
  products = defaultProducts,
  onEdit = () => {},
  onDelete = () => {},
  onAdd = () => {},
}: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, checkPermission } = useAuth();
  const [canManageProducts, setCanManageProducts] = useState(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      if (user) {
        const hasPermission = await checkPermission("canManageProducts");
        setCanManageProducts(hasPermission);
      }
    };
    checkUserPermissions();
  }, [user, checkPermission]);

  const filteredProducts = products.filter(
    (product) =>
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(product.category)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Pairs Per Box</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.pairsPerBox}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.split(",").map((size) => (
                        <Badge
                          key={size}
                          variant="secondary"
                          className="text-xs"
                        >
                          {size.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.split(",").map((color) => (
                        <Badge
                          key={color}
                          variant="outline"
                          className="text-xs"
                        >
                          {color.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canManageProducts ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" disabled>
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You don't have permission to edit products</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchTerm
                    ? "No products found matching your search."
                    : "No products added yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Default mock data
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

export default ProductList;
