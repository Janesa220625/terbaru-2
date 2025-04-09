import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryData {
  category: string;
  boxCount: number;
  unitCount: number;
  stockLevel: "low" | "medium" | "high";
}

interface CategoryMatrixProps {
  data?: CategoryData[];
}

const CategoryMatrix = ({ data = defaultData }: CategoryMatrixProps) => {
  return (
    <Card className="w-full h-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Category Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.map((item, index) => (
            <CategoryCard key={index} data={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface CategoryCardProps {
  data: CategoryData;
}

const CategoryCard = ({ data }: CategoryCardProps) => {
  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-2">{data.category}</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Boxes:</span>
          <span className="font-semibold">{data.boxCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Units:</span>
          <span className="font-semibold">{data.unitCount}</span>
        </div>
        <div className="mt-2">
          <Badge
            className={`${getStockLevelColor(data.stockLevel)} w-full justify-center py-1`}
          >
            {data.stockLevel.charAt(0).toUpperCase() + data.stockLevel.slice(1)}{" "}
            Stock
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Default mock data
const defaultData: CategoryData[] = [
  {
    category: "Men's Shoes",
    boxCount: 45,
    unitCount: 270,
    stockLevel: "high",
  },
  {
    category: "Women's Shoes",
    boxCount: 32,
    unitCount: 192,
    stockLevel: "medium",
  },
  {
    category: "Men's Sandals",
    boxCount: 12,
    unitCount: 72,
    stockLevel: "low",
  },
  {
    category: "Women's Sandals",
    boxCount: 28,
    unitCount: 168,
    stockLevel: "medium",
  },
];

export default CategoryMatrix;
