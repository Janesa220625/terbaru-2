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
import { format, subDays, isWithinInterval } from "date-fns";
import { loadFromLocalStorage } from "@/lib/storage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  BarChart3,
  Table as TableIcon,
  Download,
  PieChart as PieChartIcon,
  Filter,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

interface ShippingTrafficProps {
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

interface TrafficDataItem {
  product: string;
  recipient: string;
  totalPairs: number;
  shipments: number;
  color?: string;
}

type ChartViewType = "bar" | "pie" | "table";
type DataDisplayType = "pairs" | "shipments";

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
];

const ShippingTraffic: React.FC<ShippingTrafficProps> = ({ className }) => {
  // State for filters
  const [productFilter, setProductFilter] = useState<string>("all-products");
  const [recipientFilter, setRecipientFilter] =
    useState<string>("all-recipients");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ChartViewType>("table");
  const [groupBy, setGroupBy] = useState<"product" | "recipient">("product");
  const [dataDisplay, setDataDisplay] = useState<DataDisplayType>("pairs");

  // State for data
  const [outgoingDocuments, setOutgoingDocuments] = useState<
    OutgoingStockDocument[]
  >([]);
  const [products, setProducts] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalShippedPairs, setTotalShippedPairs] = useState<number>(0);

  // Map to store product and recipient display names by their IDs
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [recipientMap, setRecipientMap] = useState<Record<string, string>>({});

  // Initialize product and recipient maps
  useEffect(() => {
    // Pre-populate maps with default values
    setProductMap((prev) => ({
      ...prev,
      "all-products": "all-products",
      "product-no_products": "no_products",
      "product-unknown_product": "unknown_product",
    }));

    setRecipientMap((prev) => ({
      ...prev,
      "all-recipients": "all-recipients",
      "recipient-no_recipients": "no_recipients",
      "recipient-unknown_recipient": "unknown_recipient",
    }));

    loadData();
  }, []);

  // Recalculate traffic data when filters change
  useEffect(() => {
    aggregateTrafficData();
  }, [
    outgoingDocuments,
    productFilter,
    recipientFilter,
    startDate,
    endDate,
    groupBy,
    productMap,
    recipientMap,
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
      const tempProductMap: Record<string, string> = {};
      const tempRecipientMap: Record<string, string> = {};

      savedOutgoingDocuments.forEach((doc) => {
        if (doc.recipient && doc.recipient.trim() !== "") {
          uniqueRecipients.add(doc.recipient);
        }
        doc.items.forEach((item) => {
          // Use the product name or extract from SKU if name is not available
          const productName = item.name || item.sku.split("-")[0];
          if (productName && productName.trim() !== "") {
            uniqueProducts.add(productName);
          }
        });
      });

      // Create arrays from sets with guaranteed non-empty values
      const safeProducts = Array.from(uniqueProducts)
        .filter((product) => product && String(product).trim() !== "") // Remove falsy values and empty strings
        .map((product) => {
          const trimmedProduct = String(product).trim();
          // Always return a non-empty string
          return trimmedProduct || "unknown_product";
        })
        .filter((product) => product && String(product).trim() !== "") // Extra safety filter
        .sort();

      const safeRecipients = Array.from(uniqueRecipients)
        .filter((recipient) => recipient && String(recipient).trim() !== "") // Remove falsy values and empty strings
        .map((recipient) => {
          const trimmedRecipient = String(recipient).trim();
          // Always return a non-empty string
          return trimmedRecipient || "unknown_recipient";
        })
        .filter((recipient) => recipient && String(recipient).trim() !== "") // Extra safety filter
        .sort();

      // Use default placeholders if no valid items exist
      const finalProducts =
        safeProducts.length > 0 ? safeProducts : ["no_products"];

      // Set state with guaranteed non-empty values
      setProducts(finalProducts);
      setRecipients(
        safeRecipients.length > 0 ? safeRecipients : ["no_recipients"],
      );

      // Ensure default filter values are not empty strings
      setProductFilter("all-products");
      setRecipientFilter("all-recipients");
    } catch (error) {
      console.error("Error loading shipping traffic data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    if (trafficData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(trafficData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipping Traffic");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file
    const fileName = `shipping-traffic-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    saveAs(data, fileName);
  };

  // Aggregate traffic data based on filters
  const aggregateTrafficData = () => {
    if (outgoingDocuments.length === 0) {
      setTrafficData([]);
      setTotalShippedPairs(0);
      return;
    }

    // Filter documents by date range
    const filteredByDate = outgoingDocuments.filter((doc) => {
      const docDate = new Date(doc.date);
      return isWithinInterval(docDate, { start: startDate, end: endDate });
    });

    // Create a map to aggregate data
    const aggregatedData: Record<string, TrafficDataItem> = {};
    let totalPairs = 0;

    // Create a map to track unique shipments
    const shipmentTracker: Record<string, Set<string>> = {};

    filteredByDate.forEach((doc) => {
      // Skip if recipient filter is set and doesn't match
      if (
        recipientFilter &&
        recipientFilter !== "all-recipients" &&
        doc.recipient !== recipientFilter &&
        recipientMap[recipientFilter] !== doc.recipient
      ) {
        return;
      }

      doc.items.forEach((item) => {
        // Extract product name from item
        const productName = item.name || item.sku.split("-")[0] || "";

        // Skip if product name is empty or if product filter is set and doesn't match
        if (
          !productName ||
          productName.trim() === "" ||
          (productFilter &&
            productFilter !== "all-products" &&
            productName !== productFilter &&
            productMap[productFilter] !== productName)
        ) {
          return;
        }

        // Ensure we have valid values for both product and recipient
        const safeProductName = productName || "unknown_product";
        const safeRecipient = doc.recipient || "unknown_recipient";

        // Create a unique key based on grouping
        const key =
          groupBy === "product"
            ? `${safeProductName}|${safeRecipient}`
            : `${safeRecipient}|${safeProductName}`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            product: safeProductName,
            recipient: safeRecipient,
            totalPairs: 0,
            shipments: 0,
          };
          shipmentTracker[key] = new Set();
        }

        // Add the quantity to the total
        aggregatedData[key].totalPairs += item.quantity;
        totalPairs += item.quantity;

        // Track unique shipments by document ID
        shipmentTracker[key].add(doc.id);
      });
    });

    // Update shipments count from the tracker
    Object.keys(aggregatedData).forEach((key) => {
      if (shipmentTracker[key]) {
        aggregatedData[key].shipments = shipmentTracker[key].size;
      }
    });

    // Convert the map to an array and sort by total pairs (descending)
    const result = Object.values(aggregatedData)
      .sort((a, b) => b.totalPairs - a.totalPairs)
      .map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    setTrafficData(result);
    setTotalShippedPairs(totalPairs);
  };

  // Memoized data for pie chart
  const pieChartData = useMemo(() => {
    if (trafficData.length === 0) return [];

    // Group by the selected dimension (product or recipient)
    const groupedData: Record<string, { pairs: number; shipments: number }> =
      {};

    trafficData.forEach((item) => {
      const key = groupBy === "product" ? item.product : item.recipient;
      if (!groupedData[key]) {
        groupedData[key] = { pairs: 0, shipments: 0 };
      }
      groupedData[key].pairs += item.totalPairs;
      groupedData[key].shipments += item.shipments;
    });

    // Convert to array format for pie chart
    return Object.entries(groupedData)
      .map(([name, data], index) => ({
        name,
        value: data.pairs,
        shipmentValue: data.shipments,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) =>
        dataDisplay === "pairs"
          ? b.value - a.value
          : b.shipmentValue - a.shipmentValue,
      )
      .slice(0, 10); // Limit to top 10 for readability
  }, [trafficData, groupBy, dataDisplay]);

  // Get badge color based on quantity
  const getBadgeColor = (quantity: number) => {
    if (quantity > 30) return "bg-green-100 text-green-800";
    if (quantity > 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // We don't need these variables anymore as we're filtering directly in the render

  return (
    <TooltipProvider>
      <Card className={`bg-white shadow-sm ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Shipping Traffic Analysis
              </CardTitle>
              <CardDescription>
                Analyze shipping patterns by product, recipient, and time
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Buttons */}
              <div className="flex rounded-md border overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-none border-0"
                      onClick={() => setViewMode("table")}
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Table View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "bar" ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-none border-0"
                      onClick={() => setViewMode("bar")}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Bar Chart</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "pie" ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-none border-0"
                      onClick={() => setViewMode("pie")}
                    >
                      <PieChartIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Pie Chart</TooltipContent>
                </Tooltip>
              </div>

              {/* Action Buttons */}
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
                    disabled={trafficData.length === 0}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Product Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="product-filter"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  Product
                </Label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger id="product-filter" className="h-8">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-products">All Products</SelectItem>
                    {products
                      .filter(
                        (product) => product && String(product).trim() !== "",
                      )
                      .map((product) => {
                        // Generate a deterministic unique key for this item
                        const safeProduct =
                          String(product).trim() || "unknown_product";
                        const uniqueKey = `product-${safeProduct.replace(/\s+/g, "-").toLowerCase()}`;
                        // Use the product name directly - we've already filtered out empty strings
                        const displayValue =
                          safeProduct === "no_products"
                            ? "No Products"
                            : safeProduct;

                        // Update the product map outside of the render function
                        if (!productMap[uniqueKey]) {
                          // Only update if not already in the map
                          const newProductMap = { ...productMap };
                          newProductMap[uniqueKey] = safeProduct;
                          // Update outside of render to avoid re-renders
                          setTimeout(() => setProductMap(newProductMap), 0);
                        }

                        return (
                          <SelectItem key={uniqueKey} value={uniqueKey}>
                            {displayValue}
                          </SelectItem>
                        );
                      })}
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
                  <SelectTrigger id="recipient-filter" className="h-8">
                    <SelectValue placeholder="All Recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-recipients">
                      All Recipients
                    </SelectItem>
                    {recipients
                      .filter(
                        (recipient) =>
                          recipient && String(recipient).trim() !== "",
                      )
                      .map((recipient) => {
                        // Generate a deterministic unique key for this item
                        const safeRecipient =
                          String(recipient).trim() || "unknown_recipient";
                        const uniqueKey = `recipient-${safeRecipient.replace(/\s+/g, "-").toLowerCase()}`;
                        // Use the recipient name directly - we've already filtered out empty strings
                        const displayValue =
                          safeRecipient === "no_recipients"
                            ? "No Recipients"
                            : safeRecipient;

                        // Update the recipient map outside of the render function
                        if (!recipientMap[uniqueKey]) {
                          // Only update if not already in the map
                          const newRecipientMap = { ...recipientMap };
                          newRecipientMap[uniqueKey] = safeRecipient;
                          // Update outside of render to avoid re-renders
                          setTimeout(() => setRecipientMap(newRecipientMap), 0);
                        }

                        return (
                          <SelectItem key={uniqueKey} value={uniqueKey}>
                            {displayValue}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  Date Range
                </Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 justify-start text-left font-normal flex-1"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(startDate, "PPP")}
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
                        className="h-8 justify-start text-left font-normal flex-1"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(endDate, "PPP")}
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

            {/* Chart Controls - Only show when in chart mode */}
            {(viewMode === "bar" || viewMode === "pie") && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="group-by" className="text-xs font-medium">
                      Group By:
                    </Label>
                    <Select
                      value={groupBy}
                      onValueChange={(value: "product" | "recipient") =>
                        setGroupBy(value)
                      }
                    >
                      <SelectTrigger id="group-by" className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="recipient">Recipient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="data-display"
                      className="text-xs font-medium"
                    >
                      Display:
                    </Label>
                    <Select
                      value={dataDisplay}
                      onValueChange={(value: DataDisplayType) =>
                        setDataDisplay(value)
                      }
                    >
                      <SelectTrigger id="data-display" className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pairs">Total Pairs</SelectItem>
                        <SelectItem value="shipments">Shipments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    Showing top {Math.min(10, trafficData.length)} results
                  </span>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {trafficData.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="bg-slate-50 rounded-md p-3 flex-1 min-w-[150px]">
                  <div className="text-xs text-muted-foreground">
                    Total Shipped
                  </div>
                  <div className="text-2xl font-semibold">
                    {totalShippedPairs} pairs
                  </div>
                </div>
                <div className="bg-slate-50 rounded-md p-3 flex-1 min-w-[150px]">
                  <div className="text-xs text-muted-foreground">
                    Unique Products
                  </div>
                  <div className="text-2xl font-semibold">
                    {new Set(trafficData.map((item) => item.product)).size}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-md p-3 flex-1 min-w-[150px]">
                  <div className="text-xs text-muted-foreground">
                    Unique Recipients
                  </div>
                  <div className="text-2xl font-semibold">
                    {new Set(trafficData.map((item) => item.recipient)).size}
                  </div>
                </div>
              </div>
            )}

            {/* Data display section */}
            {trafficData.length === 0 ? (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p>No shipping data found for the selected filters.</p>
                <p className="text-sm mt-2">
                  Try adjusting your filters or check that outgoing stock
                  documents exist.
                </p>
              </div>
            ) : viewMode === "table" ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-medium">Product</TableHead>
                      <TableHead className="font-medium">Recipient</TableHead>
                      <TableHead className="font-medium text-right">
                        Total Pairs
                      </TableHead>
                      <TableHead className="font-medium text-right">
                        Shipments
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trafficData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
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
                            {item.shipments} shipment
                            {item.shipments !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : viewMode === "bar" ? (
              <div className="border rounded-md p-4 bg-white">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey={
                          groupBy === "product" ? "product" : "recipient"
                        }
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          value.length > 15
                            ? `${value.substring(0, 15)}...`
                            : value
                        }
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        formatter={(value, name, props) => [
                          dataDisplay === "pairs"
                            ? `${value} pairs`
                            : `${value} shipment${value !== 1 ? "s" : ""}`,
                          dataDisplay === "pairs" ? "Total Pairs" : "Shipments",
                        ]}
                        labelFormatter={(label) =>
                          groupBy === "product"
                            ? `Product: ${label}`
                            : `Recipient: ${label}`
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey={
                          dataDisplay === "pairs" ? "totalPairs" : "shipments"
                        }
                        name={
                          dataDisplay === "pairs" ? "Total Pairs" : "Shipments"
                        }
                        radius={[4, 4, 0, 0]}
                      >
                        {trafficData.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-4 bg-white">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey={
                          dataDisplay === "pairs" ? "value" : "shipmentValue"
                        }
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name.length > 15 ? `${name.substring(0, 15)}...` : name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [
                          dataDisplay === "pairs"
                            ? `${value} pairs`
                            : `${value} shipment${value !== 1 ? "s" : ""}`,
                          groupBy === "product" ? "Product" : "Recipient",
                        ]}
                      />
                      <Legend
                        formatter={(value, entry, index) =>
                          value.length > 20
                            ? `${value.substring(0, 20)}...`
                            : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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

export default ShippingTraffic;
