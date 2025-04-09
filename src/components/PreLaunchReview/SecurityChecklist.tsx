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
import { AlertCircle, Lock, Shield, UserCheck, FileCode } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category:
    | "authentication"
    | "authorization"
    | "data"
    | "frontend"
    | "infrastructure";
}

const securityChecklist: ChecklistItem[] = [
  // Authentication Security
  {
    id: "sec-auth-1",
    label: "Password policies enforce strong passwords",
    description:
      "Password requirements include minimum length, complexity, and history",
    priority: "high",
    category: "authentication",
  },
  {
    id: "sec-auth-2",
    label: "Multi-factor authentication is available",
    description:
      "MFA is implemented for sensitive operations or admin accounts",
    priority: "medium",
    category: "authentication",
  },
  {
    id: "sec-auth-3",
    label: "Account lockout policies are implemented",
    description:
      "Accounts are temporarily locked after multiple failed login attempts",
    priority: "high",
    category: "authentication",
  },
  {
    id: "sec-auth-4",
    label: "Session management is secure",
    description:
      "Sessions expire after inactivity and are invalidated on logout",
    priority: "high",
    category: "authentication",
  },
  {
    id: "sec-auth-5",
    label: "Password reset functionality is secure",
    description: "Reset tokens are time-limited and single-use",
    priority: "high",
    category: "authentication",
  },

  // Authorization Security
  {
    id: "sec-authz-1",
    label: "Role-based access control is implemented",
    description:
      "Users are assigned appropriate roles with specific permissions",
    priority: "high",
    category: "authorization",
  },
  {
    id: "sec-authz-2",
    label: "Authorization checks are performed on all protected resources",
    description: "Every protected endpoint verifies user permissions",
    priority: "high",
    category: "authorization",
  },
  {
    id: "sec-authz-3",
    label: "Principle of least privilege is followed",
    description: "Users have only the permissions necessary for their role",
    priority: "high",
    category: "authorization",
  },
  {
    id: "sec-authz-4",
    label: "Sensitive operations require re-authentication",
    description: "Critical actions require password confirmation",
    priority: "medium",
    category: "authorization",
  },
  {
    id: "sec-authz-5",
    label: "Authorization bypass vulnerabilities have been checked",
    description:
      "Testing has been performed to ensure authorization cannot be bypassed",
    priority: "high",
    category: "authorization",
  },

  // Data Security
  {
    id: "sec-data-1",
    label: "Sensitive data is encrypted at rest",
    description: "Confidential information is stored using encryption",
    priority: "high",
    category: "data",
  },
  {
    id: "sec-data-2",
    label: "Data is encrypted in transit",
    description: "HTTPS is enforced for all communications",
    priority: "high",
    category: "data",
  },
  {
    id: "sec-data-3",
    label: "Input validation is implemented",
    description: "All user inputs are validated before processing",
    priority: "high",
    category: "data",
  },
  {
    id: "sec-data-4",
    label: "Output encoding is implemented",
    description: "Data is properly encoded when displayed to prevent XSS",
    priority: "high",
    category: "data",
  },
  {
    id: "sec-data-5",
    label: "Data retention policies are defined",
    description: "Policies specify how long data is kept and when it's deleted",
    priority: "medium",
    category: "data",
  },

  // Frontend Security
  {
    id: "sec-frontend-1",
    label: "Content Security Policy is configured",
    description: "CSP headers are set to prevent XSS and other attacks",
    priority: "high",
    category: "frontend",
  },
  {
    id: "sec-frontend-2",
    label: "Cross-Site Request Forgery protection is implemented",
    description: "CSRF tokens are used for state-changing operations",
    priority: "high",
    category: "frontend",
  },
  {
    id: "sec-frontend-3",
    label: "Sensitive data is not stored in local/session storage",
    description: "No sensitive information is stored in browser storage",
    priority: "high",
    category: "frontend",
  },
  {
    id: "sec-frontend-4",
    label: "Third-party libraries are up-to-date",
    description:
      "Dependencies are regularly updated to include security patches",
    priority: "high",
    category: "frontend",
  },
  {
    id: "sec-frontend-5",
    label: "Security headers are properly configured",
    description:
      "Headers like X-Content-Type-Options and X-Frame-Options are set",
    priority: "medium",
    category: "frontend",
  },

  // Infrastructure Security
  {
    id: "sec-infra-1",
    label: "Production environments are properly hardened",
    description: "Unnecessary services and default accounts are disabled",
    priority: "high",
    category: "infrastructure",
  },
  {
    id: "sec-infra-2",
    label: "Regular security updates are applied",
    description: "OS and software patches are regularly applied",
    priority: "high",
    category: "infrastructure",
  },
  {
    id: "sec-infra-3",
    label: "Firewall rules follow least privilege principle",
    description: "Only necessary ports and services are exposed",
    priority: "high",
    category: "infrastructure",
  },
  {
    id: "sec-infra-4",
    label: "Security monitoring is implemented",
    description: "Intrusion detection and logging are in place",
    priority: "medium",
    category: "infrastructure",
  },
  {
    id: "sec-infra-5",
    label: "Disaster recovery plan is in place",
    description:
      "Procedures for recovering from security incidents are documented",
    priority: "medium",
    category: "infrastructure",
  },
];

const SecurityChecklist: React.FC = () => {
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
    const categoryItems = securityChecklist.filter(
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
      case "authentication":
        return <UserCheck className="h-4 w-4" />;
      case "authorization":
        return <Shield className="h-4 w-4" />;
      case "data":
        return <Lock className="h-4 w-4" />;
      case "frontend":
        return <FileCode className="h-4 w-4" />;
      case "infrastructure":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return securityChecklist
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
              <Shield className="h-5 w-5 text-primary" />
              Security Checklist
            </CardTitle>
            <CardDescription>
              Identify security vulnerabilities and implement mitigation
              measures
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Authentication Security
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("authentication")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("authentication")}
          </div>
        </div>

        {/* Authorization Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Authorization Security
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("authorization")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("authorization")}
          </div>
        </div>

        {/* Data Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Data Security
            </h3>
            <Badge variant="outline">{getCompletionStatus("data")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("data")}
          </div>
        </div>

        {/* Frontend Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              Frontend Security
            </h3>
            <Badge variant="outline">{getCompletionStatus("frontend")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("frontend")}
          </div>
        </div>

        {/* Infrastructure Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Infrastructure Security
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("infrastructure")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("infrastructure")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityChecklist;
