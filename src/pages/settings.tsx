import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleManagement from "@/components/settings/RoleManagement";
import AccessSettings from "@/components/settings/AccessSettings";
import LanguageSettings from "@/components/settings/LanguageSettings";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import UserManagement from "@/components/settings/UserManagement";
import AuthWrapper from "@/components/Auth/AuthWrapper";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <Tabs
        defaultValue="users"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="access">Access Settings</TabsTrigger>
          <TabsTrigger value="language">Language Settings</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="users">
            <AuthWrapper requiredPermission="canManageUsers">
              <UserManagement searchTerm={searchTerm} />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="roles">
            <AuthWrapper requiredPermission="canManageSettings">
              <RoleManagement />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="access">
            <AuthWrapper requiredPermission="canManageSettings">
              <AccessSettings />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="language">
            <AuthWrapper requiredPermission="canManageSettings">
              <LanguageSettings />
            </AuthWrapper>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
