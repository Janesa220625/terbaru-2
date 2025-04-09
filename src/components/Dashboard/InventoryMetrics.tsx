import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  AlertCircleIcon,
  PackageIcon,
  Footprints,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  trend: "up" | "down" | "neutral";
  trendValue: number;
  icon: React.ReactNode;
  bgColor?: string;
}

const MetricCard = ({
  title = "Metric",
  value = 0,
  trend = "neutral",
  trendValue = 0,
  icon = <PackageIcon />,
  bgColor = "bg-white",
}: MetricCardProps) => {
  return (
    <Card className={`${bgColor} shadow-md hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
            <div className="flex items-center mt-2">
              {trend === "up" && (
                <div className="flex items-center text-emerald-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">{trendValue}%</span>
                </div>
              )}
              {trend === "down" && (
                <div className="flex items-center text-rose-600">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">{trendValue}%</span>
                </div>
              )}
              {trend === "neutral" && (
                <div className="flex items-center text-gray-500">
                  <span className="text-xs font-medium">No change</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground ml-2">
                from last month
              </span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

interface InventoryMetricsProps {
  totalBoxes?: number;
  totalUnits?: number;
  lowBoxAlerts?: number;
  lowUnitAlerts?: number;
  boxTrend?: "up" | "down" | "neutral";
  unitTrend?: "up" | "down" | "neutral";
  boxTrendValue?: number;
  unitTrendValue?: number;
}

const InventoryMetrics = ({
  totalBoxes = 1250,
  totalUnits = 7500,
  lowBoxAlerts = 15,
  lowUnitAlerts = 42,
  boxTrend = "up",
  unitTrend = "up",
  boxTrendValue = 12,
  unitTrendValue = 8,
}: InventoryMetricsProps) => {
  return (
    <div className="w-full bg-background p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Boxes"
          value={totalBoxes}
          trend={boxTrend}
          trendValue={boxTrendValue}
          icon={<PackageIcon className="h-6 w-6 text-primary" />}
        />

        <MetricCard
          title="Total Units (Pairs)"
          value={totalUnits}
          trend={unitTrend}
          trendValue={unitTrendValue}
          icon={<Footprints className="h-6 w-6 text-primary" />}
        />

        <MetricCard
          title="Low Box Stock Alerts"
          value={lowBoxAlerts}
          trend="neutral"
          trendValue={0}
          icon={<AlertCircleIcon className="h-6 w-6 text-amber-500" />}
          bgColor="bg-amber-50"
        />

        <MetricCard
          title="Low Unit Stock Alerts"
          value={lowUnitAlerts}
          trend="neutral"
          trendValue={0}
          icon={<AlertCircleIcon className="h-6 w-6 text-rose-500" />}
          bgColor="bg-rose-50"
        />
      </div>
    </div>
  );
};

export default InventoryMetrics;
