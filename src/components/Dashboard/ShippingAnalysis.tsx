import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { loadFromLocalStorage } from "@/lib/storage";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Download,
  Filter,
  Info,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

interface ShippingAnalysisProps {
  className?: string;
}

interface OutgoingStockItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface OutgoingStockDocument {
  id: string;
  documentNumber: string;
  date: string;
  time?: string;
  recipientId?: string;
  recipient: string;
  notes: string;
  items: OutgoingStockItem[];
  totalItems: number;
}

interface ProductShipmentData {
  recipient: string;
  recipientId?: string;
  product: string;
  sku: string;
  totalPairs: number;
  shipmentCount: number;
  lastShipmentDate: string;
  documents: string[];
}

const ShippingAnalysis: React.FC<ShippingAnalysisProps> = ({ className }) => {
  // State for filters
  const [productFilter, setProductFilter] = useState<string>("");
  const [recipientFilter, setRecipientFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // State for data
  const [outgoingDocuments, setOutgoingDocuments] = useState<
    OutgoingStockDocument[]
  >([]);
  const [products, setProducts] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [shipmentData, setShipmentData] = useState<ProductShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate shipment data when filters change
  useEffect(() => {
    aggregateShipmentData();
  }, [
    outgoingDocuments,
    productFilter,
    recipientFilter,
    startDate,
    endDate,
    searchTerm,
  ]);

  const loadData = () => {
    setIsLoading(true);
    try {
      // Load outgoing documents from localStorage
      const savedOutgoingDocuments = loadFromLocalStorage<
        OutgoingStockDocument[]
      >("warehouse-outgoing-documents", []);
      setOutgoingDocuments(savedOutgoingDocuments);

      // Extract unique products and recipients
      const uniqueProducts = new Set<string>();
      const uniqueRecipients = new Set<string>();

      savedOutgoingDocuments.forEach((doc) => {
        uniqueRecipients.add(doc.recipient);
        doc.items.forEach((item) => {
          // Use the product name or extract from SKU if name is not available
          const productName = item.name || item.sku.split("-")[0];
          uniqueProducts.add(productName);
        });
      });

      setProducts(Array.from(uniqueProducts).sort());
      setRecipients(Array.from(uniqueRecipients).sort());
    } catch (error) {
      console.error("Error loading shipping analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    if (shipmentData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(shipmentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Product Shipment Analysis",
    );

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file
    const fileName = `product-shipment-analysis-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    saveAs(data, fileName);
  };

  // Aggregate shipment data based on filters
  const aggregateShipmentData = () => {
    if (outgoingDocuments.length === 0) {
      setShipmentData([]);
      return;
    }

    // Filter documents by date range
    const filteredByDate = outgoingDocuments.filter((doc) => {
      const docDate = new Date(doc.date);
      return isWithinInterval(docDate, { start: startDate, end: endDate });
    });

    // Create a map to aggregate data
    const aggregatedData: Record<string, ProductShipmentData> = {};

    filteredByDate.forEach((doc) => {
      // Skip if recipient filter is set and doesn't match
      if (recipientFilter && doc.recipient !== recipientFilter) {
        return;
      }

      doc.items.forEach((item) => {
        // Extract product name from item
        const productName = item.name || item.sku.split("-")[0];

        // Skip if product filter is set and doesn't match
        if (productFilter && productName !== productFilter) {
          return;
        }

        // Create a unique key for each product-recipient combination
        const key = `${doc.recipient}|${productName}|${item.sku}`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            recipient: doc.recipient,
            recipientId: doc.recipientId,
            product: productName,
            sku: item.sku,
            totalPairs: 0,
            shipmentCount: 0,
            lastShipmentDate: doc.date,
            documents: [],
          };
        }

        // Add the quantity to the total
        aggregatedData[key].totalPairs += item.quantity;

        // Track unique shipments by document ID
        if (!aggregatedData[key].documents.includes(doc.id)) {
          aggregatedData[key].documents.push(doc.id);
          aggregatedData[key].shipmentCount += 1;
        }

        // Update last shipment date if this document is newer
        const currentLastDate = new Date(aggregatedData[key].lastShipmentDate);
        const docDate = new Date(doc.date);
        if (docDate > currentLastDate) {
          aggregatedData[key].lastShipmentDate = doc.date;
        }
      });
    });

    // Apply search filter
    let result = Object.values(aggregatedData);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.recipient.toLowerCase().includes(searchLower) ||
          item.product.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower),
      );
    }

    // Sort by recipient and then by product
    result.sort((a, b) => {
      if (a.recipient !== b.recipient) {
        return a.recipient.localeCompare(b.recipient);
      }
      return a.product.localeCompare(b.product);
    });

    setShipmentData(result);
  };

  // Get badge color based on quantity
  const getBadgeColor = (quantity: number) => {
    if (quantity > 30) return "bg-green-100 text-green-800";
    if (quantity > 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <TooltipProvider>
      <Card className={`bg-white shadow-sm ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                Product Shipment Analysis
              </CardTitle>
              <CardDescription>
                Detailed analysis of products shipped to each recipient
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={loadData}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Refresh Data</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={exportToExcel}
                    disabled={shipmentData.length === 0}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Export to Excel</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search Filter */}
              <div className="lg:col-span-2 space-y-2">
                <Label
                  htmlFor="search-filter"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-filter"
                    placeholder="Search by recipient, product or SKU"
                    className="pl-8 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Product Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="product-filter"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  Product
                </Label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger id="product-filter" className="h-9">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="recipient-filter"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  Recipient
                </Label>
                <Select
                  value={recipientFilter}
                  onValueChange={setRecipientFilter}
                >
                  <SelectTrigger id="recipient-filter" className="h-9">
                    <SelectValue placeholder="All Recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Recipients</SelectItem>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient} value={recipient}>
                        {recipient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  Date Range
                </Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 justify-start text-left font-normal w-[120px]"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(startDate, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 justify-start text-left font-normal w-[120px]"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(endDate, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Data display section */}
            {isLoading ? (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p>Loading shipment data...</p>
              </div>
            ) : shipmentData.length === 0 ? (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p>No shipment data found for the selected filters.</p>
                <p className="text-sm mt-2">
                  Try adjusting your filters or check that outgoing stock
                  documents exist.
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-medium">Recipient</TableHead>
                      <TableHead className="font-medium">Product</TableHead>
                      <TableHead className="font-medium">SKU</TableHead>
                      <TableHead className="font-medium text-right">
                        Total Pairs
                      </TableHead>
                      <TableHead className="font-medium text-right">
                        Shipments
                      </TableHead>
                      <TableHead className="font-medium text-right">
                        Last Shipment
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell>{item.recipient}</TableCell>
                        <TableCell>{item.product}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.sku}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={getBadgeColor(item.totalPairs)}
                          >
                            {item.totalPairs} pairs
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                          >
                            {item.shipmentCount} shipment
                            {item.shipmentCount !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {format(
                            new Date(item.lastShipmentDate),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Data from outgoing stock documents</span>
          </div>
          <div>Last updated: {format(new Date(), "PPP p")}</div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default ShippingAnalysis;
