import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryMetrics from "./Dashboard/InventoryMetrics";
import InventoryTrends from "./Dashboard/InventoryTrends";
import CategoryMatrix from "./Dashboard/CategoryMatrix";
import InventorySummary from "./Dashboard/InventorySummary";
import ModuleNavigation from "./Inventory/ModuleNavigation";
import {
  PackageOpen,
  BarChart3,
  Grid3X3,
  RefreshCw,
  Activity,
  Package,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadFromLocalStorage } from "@/lib/storage";
import { exportDashboardSummary } from "@/lib/utils/shippingReportUtils";

export default function Home() {
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");

  // Load recent activity data
  React.useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = () => {
    try {
      setIsLoading(true);

      // Get recent incoming deliveries
      const incomingDeliveries = loadFromLocalStorage<any[]>(
        "warehouse-deliveries",
        [],
      );

      // Get recent outgoing deliveries
      const outgoingDeliveries = loadFromLocalStorage<any[]>(
        "warehouse-deliveries-outgoing",
        [],
      );

      // Combine and sort by date
      const combinedActivity = [
        ...(Array.isArray(incomingDeliveries)
          ? incomingDeliveries.map((delivery) => ({
              id: `in-${delivery.id}`,
              type: "incoming",
              date: new Date(delivery.date),
              details: `${delivery.boxCount} boxes of ${delivery.sku} received`,
              rawDate: delivery.date,
            }))
          : []),
        ...(Array.isArray(outgoingDeliveries)
          ? outgoingDeliveries.map((delivery) => ({
              id: `out-${delivery.id}`,
              type: "outgoing",
              date: new Date(delivery.date),
              details: `${delivery.totalItems} pairs shipped to ${delivery.customerName || "Unknown"}`,
              rawDate: delivery.date,
            }))
          : []),
      ]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      setRecentActivity(combinedActivity);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading recent activity:", error);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Tabs */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1 hidden md:block">
            Manage your warehouse inventory efficiently
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Last updated: {lastUpdated.toLocaleString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Export dashboard summary
              const metrics = {
                totalBoxes: 120, // Example data - would come from actual metrics
                totalPairs: 720,
                lowStockItems: 5,
                categories: [
                  { name: "Men's Shoes", count: 45 },
                  { name: "Women's Shoes", count: 38 },
                  { name: "Kids' Shoes", count: 22 },
                  { name: "Sports", count: 15 },
                ],
              };
              exportDashboardSummary({
                metrics,
                recentActivity,
              });
            }}
            title="Export dashboard summary"
            className="gap-2 mr-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadRecentActivity()}
            title="Refresh data"
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <div className="border-b sticky top-0 bg-background z-10 pb-0">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Modules</span>
              <span className="sm:hidden">Modules</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Row: Metrics and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Inventory Metrics</h3>
                <InventoryMetrics />
              </div>
            </div>
            <div className="lg:col-span-1">
              <InventorySummary className="h-full" />
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <PackageOpen className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadRecentActivity()}
                className="h-8 gap-1"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Loading activity data...
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-lg mb-2 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full ${item.type === "incoming" ? "bg-green-100" : "bg-blue-100"} shrink-0`}
                      >
                        <PackageOpen
                          className={`h-5 w-5 ${item.type === "incoming" ? "text-green-600" : "text-blue-600"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium flex items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {item.type === "incoming" ? "Incoming" : "Outgoing"}
                          </span>
                          <span className="hidden sm:inline">Stock</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.details}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-md mt-2 sm:mt-0">
                        {new Date(item.rawDate).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab Content */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Visualization Tabs */}
          <Tabs defaultValue="trends" className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Inventory Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Track inventory trends and category distribution
                </p>
              </div>
              <TabsList className="self-start sm:self-center">
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventory Trends</span>
                  <span className="sm:hidden">Trends</span>
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Category Matrix</span>
                  <span className="sm:hidden">Categories</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="trends">
              <Card className="bg-white shadow-sm">
                <CardContent className="pt-6">
                  <InventoryTrends />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categories">
              <Card className="bg-white shadow-sm">
                <CardContent className="pt-6">
                  <CategoryMatrix />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Modules Tab Content */}
        <TabsContent value="modules">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Inventory Management Modules
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Access all inventory management functions from a single location
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Quick Access
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select a module to access its functionality
                </p>
                <ModuleNavigation />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
