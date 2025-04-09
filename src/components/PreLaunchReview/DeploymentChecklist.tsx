import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Server, Globe, Settings, FileCode, AlertTriangle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category:
    | "environment"
    | "configuration"
    | "testing"
    | "monitoring"
    | "rollback";
}

const deploymentChecklist: ChecklistItem[] = [
  // Environment Setup
  {
    id: "deploy-env-1",
    label: "Production environment is properly configured",
    description:
      "Server resources, networking, and security settings are configured correctly",
    priority: "high",
    category: "environment",
  },
  {
    id: "deploy-env-2",
    label: "Staging environment mirrors production",
    description:
      "Staging environment closely resembles production for accurate testing",
    priority: "high",
    category: "environment",
  },
  {
    id: "deploy-env-3",
    label: "Environment variables are properly set",
    description:
      "All required environment variables are configured with correct values",
    priority: "high",
    category: "environment",
  },
  {
    id: "deploy-env-4",
    label: "Database connections are configured correctly",
    description: "Database connection strings and credentials are properly set",
    priority: "high",
    category: "environment",
  },
  {
    id: "deploy-env-5",
    label: "SSL certificates are installed and configured",
    description: "HTTPS is enabled with valid SSL certificates",
    priority: "high",
    category: "environment",
  },

  // Configuration Management
  {
    id: "deploy-config-1",
    label: "Configuration files are environment-specific",
    description:
      "Different configurations exist for development, staging, and production",
    priority: "high",
    category: "configuration",
  },
  {
    id: "deploy-config-2",
    label: "Sensitive configuration is secured",
    description: "API keys, passwords, and other secrets are stored securely",
    priority: "high",
    category: "configuration",
  },
  {
    id: "deploy-config-3",
    label: "Build process is automated",
    description:
      "CI/CD pipeline is set up for automated builds and deployments",
    priority: "medium",
    category: "configuration",
  },
  {
    id: "deploy-config-4",
    label: "Deployment artifacts are versioned",
    description: "Each deployment has a unique version identifier",
    priority: "medium",
    category: "configuration",
  },
  {
    id: "deploy-config-5",
    label: "Infrastructure as code is implemented",
    description: "Server and environment configurations are defined in code",
    priority: "medium",
    category: "configuration",
  },

  // Pre-deployment Testing
  {
    id: "deploy-testing-1",
    label: "Smoke tests pass in staging environment",
    description: "Basic functionality works correctly in staging",
    priority: "high",
    category: "testing",
  },
  {
    id: "deploy-testing-2",
    label: "Integration tests pass in staging environment",
    description: "Components work together correctly in staging",
    priority: "high",
    category: "testing",
  },
  {
    id: "deploy-testing-3",
    label: "Performance testing has been conducted",
    description: "Application performs acceptably under expected load",
    priority: "medium",
    category: "testing",
  },
  {
    id: "deploy-testing-4",
    label: "Security testing has been conducted",
    description: "Application has been scanned for vulnerabilities",
    priority: "high",
    category: "testing",
  },
  {
    id: "deploy-testing-5",
    label: "User acceptance testing has been completed",
    description: "Stakeholders have approved the release",
    priority: "high",
    category: "testing",
  },

  // Monitoring and Alerting
  {
    id: "deploy-monitoring-1",
    label: "Application monitoring is configured",
    description: "Monitoring tools are set up to track application health",
    priority: "high",
    category: "monitoring",
  },
  {
    id: "deploy-monitoring-2",
    label: "Error tracking is implemented",
    description: "Errors are logged and tracked for investigation",
    priority: "high",
    category: "monitoring",
  },
  {
    id: "deploy-monitoring-3",
    label: "Performance monitoring is configured",
    description: "Application performance metrics are tracked",
    priority: "medium",
    category: "monitoring",
  },
  {
    id: "deploy-monitoring-4",
    label: "Alerting thresholds are defined",
    description: "Alerts are configured for critical issues",
    priority: "high",
    category: "monitoring",
  },
  {
    id: "deploy-monitoring-5",
    label: "On-call schedule is established",
    description: "Team members are assigned for incident response",
    priority: "medium",
    category: "monitoring",
  },

  // Rollback Plan
  {
    id: "deploy-rollback-1",
    label: "Rollback procedure is documented",
    description: "Steps to revert to previous version are clearly defined",
    priority: "high",
    category: "rollback",
  },
  {
    id: "deploy-rollback-2",
    label: "Database rollback plan exists",
    description: "Procedure to restore database to previous state is defined",
    priority: "high",
    category: "rollback",
  },
  {
    id: "deploy-rollback-3",
    label: "Previous version is preserved",
    description: "Previous working version is available for quick rollback",
    priority: "high",
    category: "rollback",
  },
  {
    id: "deploy-rollback-4",
    label: "Rollback has been tested",
    description: "Rollback procedure has been verified to work correctly",
    priority: "medium",
    category: "rollback",
  },
  {
    id: "deploy-rollback-5",
    label: "Communication plan for rollback exists",
    description: "Process for notifying stakeholders of rollback is defined",
    priority: "medium",
    category: "rollback",
  },
];

const DeploymentChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = React.useState<
    Record<string, boolean>
  >({});

  const handleCheckChange = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const getCompletionStatus = (category: string) => {
    const categoryItems = deploymentChecklist.filter(
      (item) => item.category === category,
    );
    const checkedCount = categoryItems.filter(
      (item) => checkedItems[item.id],
    ).length;
    return `${checkedCount}/${categoryItems.length}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-500 bg-green-50 border-green-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environment":
        return <Server className="h-4 w-4" />;
      case "configuration":
        return <Settings className="h-4 w-4" />;
      case "testing":
        return <FileCode className="h-4 w-4" />;
      case "monitoring":
        return <Globe className="h-4 w-4" />;
      case "rollback":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return deploymentChecklist
      .filter((item) => item.category === category)
      .map((item) => (
        <div key={item.id} className="flex items-start space-x-3 py-3 px-4">
          <Checkbox
            id={item.id}
            checked={checkedItems[item.id] || false}
            onCheckedChange={(checked) =>
              handleCheckChange(item.id, checked as boolean)
            }
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={item.id}
                className={`font-medium ${checkedItems[item.id] ? "line-through text-muted-foreground" : ""}`}
              >
                {item.label}
              </Label>
              <Badge
                variant="outline"
                className={`ml-2 ${getPriorityColor(item.priority)}`}
              >
                {item.priority}
              </Badge>
            </div>
            {item.description && (
              <p
                className={`mt-1 text-sm text-muted-foreground ${checkedItems[item.id] ? "line-through" : ""}`}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>
      ));
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Deployment Checklist
            </CardTitle>
            <CardDescription>
              Review deployment configuration and ensure correct execution
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Setup Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Environment Setup
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("environment")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("environment")}
          </div>
        </div>

        {/* Configuration Management Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Configuration Management
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("configuration")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("configuration")}
          </div>
        </div>

        {/* Pre-deployment Testing Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              Pre-deployment Testing
            </h3>
            <Badge variant="outline">{getCompletionStatus("testing")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("testing")}
          </div>
        </div>

        {/* Monitoring and Alerting Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Monitoring and Alerting
            </h3>
            <Badge variant="outline">{getCompletionStatus("monitoring")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("monitoring")}
          </div>
        </div>

        {/* Rollback Plan Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Rollback Plan
            </h3>
            <Badge variant="outline">{getCompletionStatus("rollback")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("rollback")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentChecklist;
