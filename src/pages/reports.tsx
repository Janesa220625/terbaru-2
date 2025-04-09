import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Inventory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Reporting module will be implemented here.
          </p>
          <div className="h-[400px] flex items-center justify-center border rounded-md mt-4">
            <p className="text-muted-foreground">Reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
