import React, { useState, useEffect, useRef } from "react";
import { loadFromLocalStorage } from "@/lib/storage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Download,
  FileText,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ShipmentItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface Shipment {
  id: string;
  documentNumber: string;
  date: string;
  time?: string;
  recipient: string;
  notes: string;
  items: ShipmentItem[];
  totalItems: number;
}

interface GroupedShipment {
  recipient: string;
  totalShipments: number;
  totalPairs: number;
  shipments: Shipment[];
}

interface ProductSummary {
  sku: string;
  name: string;
  totalPairs: number;
}

interface RecipientProductSummary {
  [recipient: string]: {
    [productKey: string]: ProductSummary;
  };
}

const DetailedShippingReport = () => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [groupedShipments, setGroupedShipments] = useState<GroupedShipment[]>(
    [],
  );
  const [productSummaries, setProductSummaries] =
    useState<RecipientProductSummary>({});
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load shipment data
  useEffect(() => {
    loadShipmentData();
  }, []);

  const loadShipmentData = () => {
    try {
      setIsLoading(true);
      const outgoingDocuments = loadFromLocalStorage<Shipment[]>(
        "warehouse-outgoing-documents",
        [],
      );
      setShipments(outgoingDocuments);
      toast({
        title: "Data loaded",
        description: `Loaded ${outgoingDocuments.length} shipment records`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error loading shipment data:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process and group shipment data
  useEffect(() => {
    if (shipments.length === 0) return;

    // Filter shipments based on search term and date range
    const filteredShipments = shipments.filter((shipment) => {
      const matchesSearch = searchTerm
        ? shipment.recipient.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const shipmentDate = new Date(shipment.date);
      const matchesStartDate = startDate
        ? shipmentDate >= new Date(startDate)
        : true;
      const matchesEndDate = endDate ? shipmentDate <= new Date(endDate) : true;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });

    // Group shipments by recipient
    const groupedByRecipient: { [key: string]: GroupedShipment } = {};
    const productSummariesByRecipient: RecipientProductSummary = {};

    filteredShipments.forEach((shipment) => {
      const recipient = shipment.recipient;

      // Initialize recipient group if it doesn't exist
      if (!groupedByRecipient[recipient]) {
        groupedByRecipient[recipient] = {
          recipient,
          totalShipments: 0,
          totalPairs: 0,
          shipments: [],
        };
      }

      // Initialize product summaries for this recipient if they don't exist
      if (!productSummariesByRecipient[recipient]) {
        productSummariesByRecipient[recipient] = {};
      }

      // Add shipment to the recipient group
      groupedByRecipient[recipient].shipments.push(shipment);
      groupedByRecipient[recipient].totalShipments += 1;
      groupedByRecipient[recipient].totalPairs += shipment.totalItems;

      // Process items in the shipment for product summaries
      shipment.items.forEach((item) => {
        const productKey = `${item.sku}-${item.name}`;

        if (!productSummariesByRecipient[recipient][productKey]) {
          productSummariesByRecipient[recipient][productKey] = {
            sku: item.sku,
            name: item.name,
            totalPairs: 0,
          };
        }

        productSummariesByRecipient[recipient][productKey].totalPairs +=
          item.quantity;
      });
    });

    // Convert grouped data to arrays for rendering
    setGroupedShipments(Object.values(groupedByRecipient));
    setProductSummaries(productSummariesByRecipient);
  }, [shipments, searchTerm, startDate, endDate]);

  // Print the report
  const printReport = () => {
    if (reportRef.current) {
      const printContents = reportRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      const printStyles = `
        <style>
          @media print {
            body { font-family: Arial, sans-serif; }
            .print-header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .page-break { page-break-before: always; }
            .recipient-header { margin-top: 20px; margin-bottom: 10px; font-size: 18px; font-weight: bold; }
            .summary-table { margin-bottom: 30px; }
          }
        </style>
      `;

      document.body.innerHTML = `
        <div class="print-container">
          <div class="print-header">
            <h1>Detailed Shipping Report</h1>
            <p>${startDate || endDate ? `Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : ""} ${startDate && endDate ? "to" : ""} ${endDate ? new Date(endDate).toLocaleDateString() : ""}` : `Generated on: ${new Date().toLocaleDateString()}`}</p>
          </div>
          ${printContents}
        </div>
        ${printStyles}
      `;

      window.print();
      document.body.innerHTML = originalContents;

      // Reload data after printing to restore the React components
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Detailed Shipping Report
          </h2>
          <p className="text-muted-foreground">
            View and analyze shipment data by recipient and date range
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={loadShipmentData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={printReport}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              // Import the export function dynamically to avoid circular dependencies
              import("@/lib/utils/shippingReportUtils").then(
                ({ exportDetailedShippingReport }) => {
                  exportDetailedShippingReport(
                    groupedShipments,
                    productSummaries,
                    { startDate, endDate },
                  );
                },
              );
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>
            Filter shipments by recipient name and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipient..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> For best results when printing, set specific
              date ranges to limit the report size.
            </p>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef}>
        {isLoading ? (
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center p-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50 animate-spin" />
                <h3 className="text-lg font-medium mb-2">
                  Loading shipment data...
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we retrieve your shipment records
                </p>
              </div>
            </CardContent>
          </Card>
        ) : groupedShipments.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center p-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No shipments found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or date range
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          groupedShipments.map((group) => (
            <Card key={group.recipient} className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{group.recipient}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {group.totalShipments} Shipments
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {group.totalPairs} Pairs
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Product Summary
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">
                            Total Pairs
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSummaries[group.recipient] &&
                          Object.values(productSummaries[group.recipient]).map(
                            (product, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono text-xs">
                                  {product.sku}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {product.totalPairs}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Shipment Details
                    </h3>
                    <div className="space-y-4">
                      {group.shipments.map((shipment) => (
                        <div
                          key={shipment.id}
                          className="border rounded-md p-4 hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                #{shipment.documentNumber}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(shipment.date).toLocaleDateString()}
                                {shipment.time && ` ${shipment.time}`}
                              </span>
                            </div>
                            <Badge>{shipment.totalItems} pairs</Badge>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead className="text-right">
                                  Quantity
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shipment.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-mono text-xs">
                                    {item.sku}
                                  </TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.size}</TableCell>
                                  <TableCell>{item.color}</TableCell>
                                  <TableCell className="text-right">
                                    {item.quantity}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DetailedShippingReport;
