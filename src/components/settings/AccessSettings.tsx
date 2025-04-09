import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Save } from "lucide-react";

interface Module {
  id: string;
  name: string;
  features: Feature[];
}

interface Feature {
  id: string;
  name: string;
}

interface RoleAccess {
  roleId: string;
  roleName: string;
  access: Record<string, boolean>;
}

const AccessSettings = () => {
  const { toast } = useToast();

  const modules: Module[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      features: [
        { id: "dashboard.view", name: "View Dashboard" },
        { id: "dashboard.metrics", name: "View Metrics" },
        { id: "dashboard.trends", name: "View Trends" },
      ],
    },
    {
      id: "inventory",
      name: "Inventory",
      features: [
        { id: "inventory.view", name: "View Inventory" },
        { id: "inventory.add", name: "Add Items" },
        { id: "inventory.edit", name: "Edit Items" },
        { id: "inventory.delete", name: "Delete Items" },
        { id: "inventory.export", name: "Export Inventory" },
      ],
    },
    {
      id: "products",
      name: "Products",
      features: [
        { id: "products.view", name: "View Products" },
        { id: "products.add", name: "Add Products" },
        { id: "products.edit", name: "Edit Products" },
        { id: "products.delete", name: "Delete Products" },
      ],
    },
    {
      id: "reports",
      name: "Reports",
      features: [
        { id: "reports.view", name: "View Reports" },
        { id: "reports.generate", name: "Generate Reports" },
        { id: "reports.export", name: "Export Reports" },
      ],
    },
    {
      id: "settings",
      name: "Settings",
      features: [
        { id: "settings.users", name: "User Management" },
        { id: "settings.roles", name: "Role Management" },
        { id: "settings.access", name: "Access Settings" },
        { id: "settings.language", name: "Language Settings" },
      ],
    },
  ];

  const [roleAccess, setRoleAccess] = useState<RoleAccess[]>([
    {
      roleId: "1",
      roleName: "Admin",
      access: {
        // All permissions set to true for admin
        "dashboard.view": true,
        "dashboard.metrics": true,
        "dashboard.trends": true,
        "inventory.view": true,
        "inventory.add": true,
        "inventory.edit": true,
        "inventory.delete": true,
        "inventory.export": true,
        "products.view": true,
        "products.add": true,
        "products.edit": true,
        "products.delete": true,
        "reports.view": true,
        "reports.generate": true,
        "reports.export": true,
        "settings.users": true,
        "settings.roles": true,
        "settings.access": true,
        "settings.language": true,
      },
    },
    {
      roleId: "2",
      roleName: "Warehouse Manager",
      access: {
        "dashboard.view": true,
        "dashboard.metrics": true,
        "dashboard.trends": true,
        "inventory.view": true,
        "inventory.add": true,
        "inventory.edit": true,
        "inventory.delete": false,
        "inventory.export": true,
        "products.view": true,
        "products.add": false,
        "products.edit": false,
        "products.delete": false,
        "reports.view": true,
        "reports.generate": true,
        "reports.export": true,
        "settings.users": false,
        "settings.roles": false,
        "settings.access": false,
        "settings.language": true,
      },
    },
    {
      roleId: "3",
      roleName: "Staff",
      access: {
        "dashboard.view": true,
        "dashboard.metrics": false,
        "dashboard.trends": false,
        "inventory.view": true,
        "inventory.add": true,
        "inventory.edit": false,
        "inventory.delete": false,
        "inventory.export": false,
        "products.view": true,
        "products.add": false,
        "products.edit": false,
        "products.delete": false,
        "reports.view": false,
        "reports.generate": false,
        "reports.export": false,
        "settings.users": false,
        "settings.roles": false,
        "settings.access": false,
        "settings.language": true,
      },
    },
    {
      roleId: "4",
      roleName: "Viewer",
      access: {
        "dashboard.view": true,
        "dashboard.metrics": false,
        "dashboard.trends": false,
        "inventory.view": true,
        "inventory.add": false,
        "inventory.edit": false,
        "inventory.delete": false,
        "inventory.export": false,
        "products.view": true,
        "products.add": false,
        "products.edit": false,
        "products.delete": false,
        "reports.view": true,
        "reports.generate": false,
        "reports.export": false,
        "settings.users": false,
        "settings.roles": false,
        "settings.access": false,
        "settings.language": true,
      },
    },
  ]);

  const handleAccessChange = (
    roleId: string,
    featureId: string,
    checked: boolean,
  ) => {
    setRoleAccess((prevAccess) =>
      prevAccess.map((role) =>
        role.roleId === roleId
          ? {
              ...role,
              access: {
                ...role.access,
                [featureId]: checked,
              },
            }
          : role,
      ),
    );
  };

  const handleSaveChanges = () => {
    // In a real application, this would save to the database
    toast({
      title: "Success",
      description: "Access settings saved successfully.",
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Access Settings</CardTitle>
            <CardDescription>
              Configure which features each role can access
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleSaveChanges}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                {roleAccess.map((role) => (
                  <TableHead key={role.roleId} className="text-center">
                    {role.roleName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <React.Fragment key={module.id}>
                  <TableRow className="bg-muted/50">
                    <TableCell
                      colSpan={roleAccess.length + 1}
                      className="font-medium"
                    >
                      {module.name}
                    </TableCell>
                  </TableRow>
                  {module.features.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell className="pl-6">{feature.name}</TableCell>
                      {roleAccess.map((role) => (
                        <TableCell key={role.roleId} className="text-center">
                          <Checkbox
                            checked={role.access[feature.id] || false}
                            onCheckedChange={(checked) =>
                              handleAccessChange(
                                role.roleId,
                                feature.id,
                                checked as boolean,
                              )
                            }
                            disabled={role.roleId === "1"} // Admin role always has all permissions
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessSettings;
