import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface InventoryTrendsProps {
  data?: {
    boxes: {
      incoming: Array<{ date: string; value: number }>;
      outgoing: Array<{ date: string; value: number }>;
    };
    units: {
      incoming: Array<{ date: string; value: number }>;
      outgoing: Array<{ date: string; value: number }>;
    };
  };
}

const defaultData = {
  boxes: {
    incoming: [
      { date: "Jan", value: 40 },
      { date: "Feb", value: 30 },
      { date: "Mar", value: 45 },
      { date: "Apr", value: 50 },
      { date: "May", value: 35 },
      { date: "Jun", value: 60 },
    ],
    outgoing: [
      { date: "Jan", value: 30 },
      { date: "Feb", value: 25 },
      { date: "Mar", value: 35 },
      { date: "Apr", value: 45 },
      { date: "May", value: 30 },
      { date: "Jun", value: 50 },
    ],
  },
  units: {
    incoming: [
      { date: "Jan", value: 240 },
      { date: "Feb", value: 180 },
      { date: "Mar", value: 270 },
      { date: "Apr", value: 300 },
      { date: "May", value: 210 },
      { date: "Jun", value: 360 },
    ],
    outgoing: [
      { date: "Jan", value: 180 },
      { date: "Feb", value: 150 },
      { date: "Mar", value: 210 },
      { date: "Apr", value: 270 },
      { date: "May", value: 180 },
      { date: "Jun", value: 300 },
    ],
  },
};

const InventoryTrends: React.FC<InventoryTrendsProps> = ({
  data = defaultData,
}) => {
  const [viewType, setViewType] = useState<"boxes" | "units">("boxes");
  const [timeRange, setTimeRange] = useState<string>("month");

  const chartData = viewType === "boxes" ? data.boxes : data.units;

  // Combine incoming and outgoing data for the chart
  const combinedData = chartData.incoming.map((item, index) => ({
    date: item.date,
    incoming: item.value,
    outgoing: chartData.outgoing[index]?.value || 0,
  }));

  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Inventory Trends</CardTitle>
        <div className="flex items-center space-x-2">
          <Tabs
            defaultValue="boxes"
            onValueChange={(value) => setViewType(value as "boxes" | "units")}
          >
            <TabsList>
              <TabsTrigger value="boxes">Boxes</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#4ade80"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Incoming"
              />
              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#f43f5e"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Outgoing"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryTrends;
