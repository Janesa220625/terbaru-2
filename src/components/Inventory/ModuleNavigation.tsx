import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  PackagePlus,
  ClipboardCheck,
  PackageOpen,
  Boxes,
  Box,
  Ruler,
} from "lucide-react";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const ModuleCard = ({
  icon,
  title,
  description,
  onClick = () => {},
}: ModuleCardProps) => {
  return (
    <Card
      className="bg-white cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="flex items-center p-4 gap-3">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface ModuleNavigationProps {
  onModuleSelect?: (moduleName: string) => void;
}

const ModuleNavigation = ({
  onModuleSelect = () => {},
}: ModuleNavigationProps) => {
  const modules = [
    {
      icon: <PackagePlus size={20} />,
      title: "Incoming Box Stock",
      description: "Record new box deliveries",
      onClick: () => onModuleSelect("Incoming Box Stock"),
    },
    {
      icon: <ClipboardCheck size={20} />,
      title: "Stock Opname",
      description: "Verify physical inventory counts",
      onClick: () => onModuleSelect("Stock Opname"),
    },
    {
      icon: <PackageOpen size={20} />,
      title: "Outgoing Stock",
      description: "Record unit sales and shipments",
      onClick: () => onModuleSelect("Outgoing Stock"),
    },
    {
      icon: <Boxes size={20} />,
      title: "Box Stock",
      description: "View current box inventory levels",
      onClick: () => onModuleSelect("Box Stock"),
    },
    {
      icon: <Ruler size={20} />,
      title: "Stock Units",
      description: "Manage unit inventory by size and color",
      onClick: () => onModuleSelect("Stock Units"),
    },
    {
      icon: <Box size={20} />,
      title: "Single Warehouse Stock",
      description: "View unit inventory by SKU, color and size",
      onClick: () => onModuleSelect("Single Warehouse Stock"),
    },
  ];

  return (
    <div className="w-full bg-background p-4">
      <h2 className="text-lg font-semibold mb-4">Inventory Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <ModuleCard
            key={index}
            icon={module.icon}
            title={module.title}
            description={module.description}
            onClick={module.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleNavigation;
