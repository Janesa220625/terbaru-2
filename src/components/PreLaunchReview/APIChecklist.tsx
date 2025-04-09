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
import { AlertCircle, FileText, Gauge, Lock } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category: "performance" | "security" | "documentation" | "design";
}

const apiChecklist: ChecklistItem[] = [
  // API Design
  {
    id: "api-design-1",
    label: "API endpoints follow RESTful conventions",
    description: "Endpoints use appropriate HTTP methods and resource naming",
    priority: "high",
    category: "design",
  },
  {
    id: "api-design-2",
    label: "API versioning strategy is implemented",
    description:
      "API includes version in URL or header to support future changes",
    priority: "medium",
    category: "design",
  },
  {
    id: "api-design-3",
    label: "Response formats are consistent across endpoints",
    description: "All endpoints return data in a consistent structure",
    priority: "high",
    category: "design",
  },
  {
    id: "api-design-4",
    label: "Error handling is consistent and informative",
    description: "Error responses include status codes and helpful messages",
    priority: "high",
    category: "design",
  },
  {
    id: "api-design-5",
    label: "Pagination is implemented for list endpoints",
    description: "List endpoints support pagination to handle large datasets",
    priority: "medium",
    category: "design",
  },

  // API Performance
  {
    id: "api-performance-1",
    label: "API response times meet performance requirements",
    description:
      "Endpoints respond within acceptable time limits under expected load",
    priority: "high",
    category: "performance",
  },
  {
    id: "api-performance-2",
    label: "Rate limiting is implemented to prevent abuse",
    description:
      "API includes rate limiting to protect against excessive requests",
    priority: "medium",
    category: "performance",
  },
  {
    id: "api-performance-3",
    label: "Caching strategy is implemented where appropriate",
    description: "Responses include cache headers for cacheable resources",
    priority: "medium",
    category: "performance",
  },
  {
    id: "api-performance-4",
    label: "Database queries are optimized for API endpoints",
    description: "Queries are efficient and retrieve only necessary data",
    priority: "high",
    category: "performance",
  },
  {
    id: "api-performance-5",
    label: "Load testing has been performed",
    description: "API has been tested under expected peak load conditions",
    priority: "high",
    category: "performance",
  },

  // API Security
  {
    id: "api-security-1",
    label: "Authentication is required for protected endpoints",
    description:
      "Secure authentication mechanism is implemented for protected resources",
    priority: "high",
    category: "security",
  },
  {
    id: "api-security-2",
    label: "Authorization checks are implemented",
    description: "Endpoints verify user permissions before allowing access",
    priority: "high",
    category: "security",
  },
  {
    id: "api-security-3",
    label: "Input validation is implemented for all endpoints",
    description: "All user inputs are validated before processing",
    priority: "high",
    category: "security",
  },
  {
    id: "api-security-4",
    label: "CORS is properly configured",
    description: "Cross-Origin Resource Sharing is configured securely",
    priority: "high",
    category: "security",
  },
  {
    id: "api-security-5",
    label: "Sensitive data is not exposed in responses",
    description: "API responses do not include sensitive information",
    priority: "high",
    category: "security",
  },

  // API Documentation
  {
    id: "api-docs-1",
    label: "API documentation is complete and up-to-date",
    description: "All endpoints are documented with parameters and responses",
    priority: "high",
    category: "documentation",
  },
  {
    id: "api-docs-2",
    label: "API documentation includes examples",
    description: "Documentation includes request and response examples",
    priority: "medium",
    category: "documentation",
  },
  {
    id: "api-docs-3",
    label: "Error responses are documented",
    description: "Documentation includes possible error codes and messages",
    priority: "medium",
    category: "documentation",
  },
  {
    id: "api-docs-4",
    label: "Authentication requirements are documented",
    description: "Documentation explains how to authenticate with the API",
    priority: "high",
    category: "documentation",
  },
  {
    id: "api-docs-5",
    label: "API documentation is accessible to developers",
    description: "Documentation is available in a developer-friendly format",
    priority: "medium",
    category: "documentation",
  },
];

const APIChecklist: React.FC = () => {
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
    const categoryItems = apiChecklist.filter(
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
      case "design":
        return <FileText className="h-4 w-4" />;
      case "performance":
        return <Gauge className="h-4 w-4" />;
      case "security":
        return <Lock className="h-4 w-4" />;
      case "documentation":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return apiChecklist
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
              <FileText className="h-5 w-5 text-primary" />
              API Checklist
            </CardTitle>
            <CardDescription>
              Evaluate API performance, security, and documentation before
              launch
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Design Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              API Design
            </h3>
            <Badge variant="outline">{getCompletionStatus("design")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("design")}
          </div>
        </div>

        {/* API Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              API Performance
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("performance")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("performance")}
          </div>
        </div>

        {/* API Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              API Security
            </h3>
            <Badge variant="outline">{getCompletionStatus("security")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("security")}
          </div>
        </div>

        {/* API Documentation Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              API Documentation
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("documentation")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("documentation")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIChecklist;
