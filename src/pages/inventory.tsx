import React, { useState, useEffect } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleNavigation from "@/components/Inventory/ModuleNavigation";
import IncomingBoxStock from "@/components/Inventory/IncomingBoxStock";
import OutgoingStock from "@/components/Inventory/OutgoingStock";
import BoxStock from "@/components/Inventory/BoxStock";
import StockOpname from "@/components/Inventory/StockOpname";
import SingleWarehouseStock from "@/components/Inventory/SingleWarehouseStock";
import StockUnits from "@/components/Inventory/StockUnits";
import BatchOperations from "@/components/Inventory/BatchOperations";
import InventorySearch from "@/components/Inventory/InventorySearch";
import DetailedShippingReport from "@/components/Inventory/DetailedShippingReport";
import RecipientManagement from "@/components/Inventory/RecipientManagement";
import {
  Package,
  Search,
  FileText,
  TruckIcon,
  BarChart,
  Users,
} from "lucide-react";

const Inventory = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("modules");

  const renderModuleContent = () => {
    switch (activeModule) {
      case "Incoming Box Stock":
        return <IncomingBoxStock />;
      case "Outgoing Stock":
        return <OutgoingStock />;
      case "Box Stock":
        return <BoxStock />;
      case "Stock Opname":
        return <StockOpname />;
      case "Stock Units":
        return <StockUnits />;
      case "Single Warehouse Stock":
        return <SingleWarehouseStock />;
      case "Recipient Management":
        return <RecipientManagement />;
      default:
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Current Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select a module above to manage inventory.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Inventory Management
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            Shipping Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6">
          <ModuleNavigation onModuleSelect={setActiveModule} />
          <div className="mt-6">{renderModuleContent()}</div>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <InventorySearch />
        </TabsContent>

        <TabsContent value="batch" className="mt-6">
          <BatchOperations />
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <DetailedShippingReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
