import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AuthWrapper from "@/components/Auth/AuthWrapper";
import DatabaseChecklist from "@/components/PreLaunchReview/DatabaseChecklist";
import APIChecklist from "@/components/PreLaunchReview/APIChecklist";
import SecurityChecklist from "@/components/PreLaunchReview/SecurityChecklist";
import PerformanceChecklist from "@/components/PreLaunchReview/PerformanceChecklist";
import DeploymentChecklist from "@/components/PreLaunchReview/DeploymentChecklist";
import DocumentationChecklist from "@/components/PreLaunchReview/DocumentationChecklist";

const PreLaunchReview = () => {
  const [activeTab, setActiveTab] = useState("database");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pre-Launch Review</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search checklists..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <Tabs
        defaultValue="database"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="database">
            <AuthWrapper requiredPermission="canManageSettings">
              <DatabaseChecklist />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="api">
            <AuthWrapper requiredPermission="canManageSettings">
              <APIChecklist />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="security">
            <AuthWrapper requiredPermission="canManageSettings">
              <SecurityChecklist />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="performance">
            <AuthWrapper requiredPermission="canManageSettings">
              <PerformanceChecklist />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="deployment">
            <AuthWrapper requiredPermission="canManageSettings">
              <DeploymentChecklist />
            </AuthWrapper>
          </TabsContent>

          <TabsContent value="documentation">
            <AuthWrapper requiredPermission="canManageSettings">
              <DocumentationChecklist />
            </AuthWrapper>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PreLaunchReview;
