import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadFromLocalStorage } from "@/lib/storage";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Boxes,
  Package,
} from "lucide-react";

interface InventorySummaryProps {
  className?: string;
}

const InventorySummary = ({ className = "" }: InventorySummaryProps) => {
  // State to store data loaded from Supabase
  const [boxStock, setBoxStock] = useState<any[]>([]);
  const [unitStock, setUnitStock] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [outgoingDeliveries, setOutgoingDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage when component mounts
  useEffect(() => {
    const fetchData = () => {
      try {
        setIsLoading(true);
        const boxStockData = loadFromLocalStorage<any[]>(
          "warehouse-box-stock",
          [],
        );
        const unitStockData = loadFromLocalStorage<any[]>(
          "warehouse-unit-stock",
          [],
        );
        const deliveriesData = loadFromLocalStorage<any[]>(
          "warehouse-deliveries",
          [],
        );
        const outgoingDeliveriesData = loadFromLocalStorage<any[]>(
          "warehouse-deliveries-outgoing",
          [],
        );

        setBoxStock(boxStockData);
        setUnitStock(unitStockData);
        setDeliveries(deliveriesData);
        setOutgoingDeliveries(outgoingDeliveriesData);
      } catch (error) {
        console.error("Error loading inventory data:", error);
        // Set empty arrays as fallback
        setBoxStock([]);
        setUnitStock([]);
        setDeliveries([]);
        setOutgoingDeliveries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary metrics
  const totalBoxes = boxStock.reduce((sum, item) => sum + item.boxCount, 0);
  const totalUnits = unitStock.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate recent activity
  const recentIncoming = deliveries.slice(0, 3);
  const recentOutgoing = outgoingDeliveries.slice(0, 3);

  // Calculate low stock items
  const lowStockItems = unitStock.filter((item) => item.stockLevel === "low");

  // Calculate inventory value (simplified calculation)
  const estimatedValue = totalUnits * 25; // Assuming average value of $25 per pair

  if (isLoading) {
    return (
      <Card className={`bg-white ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Inventory Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Boxes</p>
              <p className="text-2xl font-bold">{totalBoxes}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-2xl font-bold">{totalUnits}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Est. Value</p>
              <p className="text-2xl font-bold">
                ${estimatedValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentIncoming.map((delivery, index) => (
                <div
                  key={`in-${index}`}
                  className="flex items-center gap-2 p-2 border-b last:border-0"
                >
                  <div className="p-1.5 rounded-full bg-green-100">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Incoming: {delivery.boxCount} boxes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {delivery.sku}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {new Date(delivery.date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}

              {recentOutgoing.map((delivery, index) => (
                <div
                  key={`out-${index}`}
                  className="flex items-center gap-2 p-2 border-b last:border-0"
                >
                  <div className="p-1.5 rounded-full bg-red-100">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Outgoing: {delivery.totalItems} units
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {delivery.customerName}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {new Date(delivery.date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
              <h3 className="text-sm font-medium text-amber-800 mb-2">
                Low Stock Alert
              </h3>
              <div className="space-y-1">
                {lowStockItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      {item.sku} - {item.quantity} pairs remaining
                    </p>
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <p className="text-xs text-amber-700 mt-1">
                    +{lowStockItems.length - 3} more items with low stock
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventorySummary;
