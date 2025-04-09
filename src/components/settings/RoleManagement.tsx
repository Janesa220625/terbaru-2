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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const RoleManagement = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Admin",
      description: "Full system access",
      permissions: ["all"],
    },
    {
      id: "2",
      name: "Warehouse Manager",
      description: "Manages warehouse inventory",
      permissions: ["inventory.read", "inventory.write", "reports.read"],
    },
    {
      id: "3",
      name: "Staff",
      description: "Regular staff member",
      permissions: ["inventory.read"],
    },
    {
      id: "4",
      name: "Viewer",
      description: "Read-only access",
      permissions: ["inventory.read", "reports.read"],
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const availablePermissions = [
    { id: "inventory.read", label: "View Inventory" },
    { id: "inventory.write", label: "Edit Inventory" },
    { id: "users.read", label: "View Users" },
    { id: "users.write", label: "Manage Users" },
    { id: "roles.read", label: "View Roles" },
    { id: "roles.write", label: "Manage Roles" },
    { id: "reports.read", label: "View Reports" },
    { id: "reports.write", label: "Create Reports" },
    { id: "products.read", label: "View Products" },
    { id: "products.write", label: "Manage Products" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((id) => id !== permissionId),
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleAddRole = () => {
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name is required.",
      });
      return;
    }

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
    };

    setRoles([...roles, newRole]);
    resetForm();
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: "Role created successfully.",
    });
  };

  const handleEditRole = () => {
    if (!selectedRole || !formData.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name is required.",
      });
      return;
    }

    const updatedRoles = roles.map((role) =>
      role.id === selectedRole.id
        ? {
            ...role,
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions,
          }
        : role,
    );

    setRoles(updatedRoles);
    resetForm();
    setIsEditDialogOpen(false);

    toast({
      title: "Success",
      description: "Role updated successfully.",
    });
  };

  const handleDeleteRole = (roleId: string) => {
    // Don't allow deleting the Admin role
    if (roleId === "1") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The Admin role cannot be deleted.",
      });
      return;
    }

    const updatedRoles = roles.filter((role) => role.id !== roleId);
    setRoles(updatedRoles);

    toast({
      title: "Success",
      description: "Role deleted successfully.",
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Create and manage roles with specific permissions
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>
                  Create a new role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission.id,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-normal"
                        >
                          {permission.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    {role.permissions.includes("all") ? (
                      <span className="text-primary font-medium">
                        All Permissions
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission) => {
                          const permLabel =
                            availablePermissions.find(
                              (p) => p.id === permission,
                            )?.label || permission;
                          return (
                            <span
                              key={permission}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {permLabel}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(role)}
                        title="Edit Role"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                        title="Delete Role"
                        className="text-destructive"
                        disabled={role.id === "1"} // Prevent deleting Admin role
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role information and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="editName">Role Name</Label>
                <Input
                  id="editName"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={selectedRole?.id === "1"} // Prevent editing Admin role name
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-permission-${permission.id}`}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            permission.id,
                            checked as boolean,
                          )
                        }
                        disabled={selectedRole?.id === "1"} // Prevent editing Admin permissions
                      />
                      <Label
                        htmlFor={`edit-permission-${permission.id}`}
                        className="text-sm font-normal"
                      >
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
