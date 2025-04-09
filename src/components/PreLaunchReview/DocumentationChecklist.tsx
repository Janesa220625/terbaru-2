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
import { FileText, BookOpen, Users, Code, HelpCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category: "user" | "developer" | "api" | "deployment" | "support";
}

const documentationChecklist: ChecklistItem[] = [
  // User Documentation
  {
    id: "doc-user-1",
    label: "User manual is complete and up-to-date",
    description: "Comprehensive guide covering all user-facing features",
    priority: "high",
    category: "user",
  },
  {
    id: "doc-user-2",
    label: "Quick start guide is available",
    description: "Simple guide to help users get started quickly",
    priority: "high",
    category: "user",
  },
  {
    id: "doc-user-3",
    label: "FAQ section addresses common questions",
    description: "Frequently asked questions with clear answers",
    priority: "medium",
    category: "user",
  },
  {
    id: "doc-user-4",
    label: "Tutorial videos are available",
    description: "Video guides for key features and workflows",
    priority: "medium",
    category: "user",
  },
  {
    id: "doc-user-5",
    label: "Documentation is accessible to all users",
    description: "Documentation follows accessibility guidelines",
    priority: "medium",
    category: "user",
  },

  // Developer Documentation
  {
    id: "doc-dev-1",
    label: "Code is well-commented",
    description: "Code includes clear comments explaining complex logic",
    priority: "high",
    category: "developer",
  },
  {
    id: "doc-dev-2",
    label: "Architecture documentation exists",
    description: "System architecture is documented with diagrams",
    priority: "high",
    category: "developer",
  },
  {
    id: "doc-dev-3",
    label: "Setup instructions are clear",
    description: "Steps to set up development environment are documented",
    priority: "high",
    category: "developer",
  },
  {
    id: "doc-dev-4",
    label: "Contribution guidelines are defined",
    description: "Process for contributing code is documented",
    priority: "medium",
    category: "developer",
  },
  {
    id: "doc-dev-5",
    label: "Code style guide is available",
    description: "Coding standards and conventions are documented",
    priority: "medium",
    category: "developer",
  },

  // API Documentation
  {
    id: "doc-api-1",
    label: "API endpoints are documented",
    description: "All endpoints are documented with parameters and responses",
    priority: "high",
    category: "api",
  },
  {
    id: "doc-api-2",
    label: "API examples are provided",
    description: "Example requests and responses for each endpoint",
    priority: "high",
    category: "api",
  },
  {
    id: "doc-api-3",
    label: "Authentication process is documented",
    description: "Steps to authenticate with the API are clear",
    priority: "high",
    category: "api",
  },
  {
    id: "doc-api-4",
    label: "Error responses are documented",
    description: "All possible error codes and messages are listed",
    priority: "medium",
    category: "api",
  },
  {
    id: "doc-api-5",
    label: "API versioning is documented",
    description: "Version compatibility and migration guides are available",
    priority: "medium",
    category: "api",
  },

  // Deployment Documentation
  {
    id: "doc-deploy-1",
    label: "Deployment process is documented",
    description: "Steps to deploy the application are clearly defined",
    priority: "high",
    category: "deployment",
  },
  {
    id: "doc-deploy-2",
    label: "Environment requirements are specified",
    description: "Hardware, software, and network requirements are listed",
    priority: "high",
    category: "deployment",
  },
  {
    id: "doc-deploy-3",
    label: "Configuration options are documented",
    description: "All configuration parameters are explained",
    priority: "high",
    category: "deployment",
  },
  {
    id: "doc-deploy-4",
    label: "Backup and restore procedures are documented",
    description: "Process for backing up and restoring data is defined",
    priority: "medium",
    category: "deployment",
  },
  {
    id: "doc-deploy-5",
    label: "Scaling guidelines are provided",
    description: "Recommendations for scaling the application are available",
    priority: "medium",
    category: "deployment",
  },

  // Support Documentation
  {
    id: "doc-support-1",
    label: "Troubleshooting guide exists",
    description: "Common issues and their solutions are documented",
    priority: "high",
    category: "support",
  },
  {
    id: "doc-support-2",
    label: "Support contact information is available",
    description: "Users know how to get help when needed",
    priority: "high",
    category: "support",
  },
  {
    id: "doc-support-3",
    label: "Known issues are documented",
    description: "List of known issues and workarounds is maintained",
    priority: "medium",
    category: "support",
  },
  {
    id: "doc-support-4",
    label: "SLA and support policies are defined",
    description: "Service level agreements and support policies are clear",
    priority: "medium",
    category: "support",
  },
  {
    id: "doc-support-5",
    label: "Escalation procedures are documented",
    description: "Process for escalating support issues is defined",
    priority: "medium",
    category: "support",
  },
];

const DocumentationChecklist: React.FC = () => {
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
    const categoryItems = documentationChecklist.filter(
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
      case "user":
        return <Users className="h-4 w-4" />;
      case "developer":
        return <Code className="h-4 w-4" />;
      case "api":
        return <FileText className="h-4 w-4" />;
      case "deployment":
        return <BookOpen className="h-4 w-4" />;
      case "support":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return documentationChecklist
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
              <BookOpen className="h-5 w-5 text-primary" />
              Documentation Checklist
            </CardTitle>
            <CardDescription>
              Assess documentation completeness and clarity for all user types
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User Documentation
            </h3>
            <Badge variant="outline">{getCompletionStatus("user")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("user")}
          </div>
        </div>

        {/* Developer Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              Developer Documentation
            </h3>
            <Badge variant="outline">{getCompletionStatus("developer")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("developer")}
          </div>
        </div>

        {/* API Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              API Documentation
            </h3>
            <Badge variant="outline">{getCompletionStatus("api")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("api")}
          </div>
        </div>

        {/* Deployment Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Deployment Documentation
            </h3>
            <Badge variant="outline">{getCompletionStatus("deployment")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("deployment")}
          </div>
        </div>

        {/* Support Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Support Documentation
            </h3>
            <Badge variant="outline">{getCompletionStatus("support")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("support")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationChecklist;
