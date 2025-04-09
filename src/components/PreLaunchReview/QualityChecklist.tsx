import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Code,
  Database,
  Shield,
  Zap,
  Layers,
  MonitorSmartphone,
  HardDrive,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  checked: boolean;
  guidance?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: ChecklistItem[];
}

const QualityChecklist = () => {
  const [sections, setSections] = useState<ChecklistSection[]>([
    {
      id: "code-quality",
      title: "Code Quality and Correctness",
      icon: <Code className="h-5 w-5" />,
      description: "Ensure code follows best practices and is free of errors",
      items: [
        {
          id: "code-1",
          title: "TypeScript type safety",
          description:
            "Check for any 'any' types or type assertions that could be made more specific",
          impact: "medium",
          checked: false,
          guidance: "Review files with @ts-ignore comments or any type usage",
        },
        {
          id: "code-2",
          title: "Component props validation",
          description:
            "Ensure all components have proper prop types and default values",
          impact: "medium",
          checked: false,
        },
        {
          id: "code-3",
          title: "Error handling",
          description:
            "Verify that all async operations have proper error handling",
          impact: "high",
          checked: false,
          guidance:
            "Look for try/catch blocks around Supabase calls and other async operations",
        },
        {
          id: "code-4",
          title: "Console logs and debugging code",
          description:
            "Remove or disable console.log statements and debugging code",
          impact: "low",
          checked: false,
        },
        {
          id: "code-5",
          title: "Code duplication",
          description:
            "Identify and refactor duplicated code into reusable functions or components",
          impact: "medium",
          checked: false,
        },
        {
          id: "code-6",
          title: "Unused imports and dead code",
          description: "Remove unused imports, variables, and functions",
          impact: "low",
          checked: false,
        },
        {
          id: "code-7",
          title: "Consistent code style",
          description:
            "Ensure consistent formatting, naming conventions, and code organization",
          impact: "low",
          checked: false,
        },
        {
          id: "code-8",
          title: "Memory leaks",
          description:
            "Check for potential memory leaks in useEffect cleanup functions",
          impact: "high",
          checked: false,
          guidance:
            "Verify that event listeners, subscriptions, and intervals are properly cleaned up",
        },
      ],
    },
    {
      id: "functionality",
      title: "Module & Component Functionality",
      icon: <Zap className="h-5 w-5" />,
      description: "Verify that all features and components work as expected",
      items: [
        {
          id: "func-1",
          title: "Authentication flows",
          description:
            "Test all authentication paths: login, signup, password reset, and session management",
          impact: "high",
          checked: false,
          guidance:
            "Verify that protected routes redirect properly and auth state persists correctly",
        },
        {
          id: "func-2",
          title: "Role-based permissions",
          description:
            "Ensure that different user roles have appropriate access to features",
          impact: "high",
          checked: false,
          guidance:
            "Test with admin, manager, staff, and viewer accounts to verify permission enforcement",
        },
        {
          id: "func-3",
          title: "Form validations",
          description:
            "Check that all forms validate inputs correctly and display appropriate error messages",
          impact: "medium",
          checked: false,
        },
        {
          id: "func-4",
          title: "CRUD operations",
          description:
            "Test Create, Read, Update, and Delete operations for all data entities",
          impact: "high",
          checked: false,
        },
        {
          id: "func-5",
          title: "Box-to-unit calculations",
          description:
            "Verify that conversions between box and unit quantities are calculated correctly",
          impact: "high",
          checked: false,
          guidance:
            "Test with various product configurations and box content specifications",
        },
        {
          id: "func-6",
          title: "Stock reconciliation",
          description:
            "Test the Stock Opname feature with various discrepancy scenarios",
          impact: "high",
          checked: false,
        },
        {
          id: "func-7",
          title: "Dashboard metrics",
          description:
            "Confirm that all dashboard metrics and charts display accurate data",
          impact: "medium",
          checked: false,
        },
        {
          id: "func-8",
          title: "Report generation",
          description: "Test all report types and export functionality",
          impact: "medium",
          checked: false,
        },
      ],
    },
    {
      id: "ui-ux",
      title: "User Experience (UI/UX)",
      icon: <MonitorSmartphone className="h-5 w-5" />,
      description: "Evaluate the user interface and overall experience",
      items: [
        {
          id: "ui-1",
          title: "Responsive design",
          description:
            "Test the application on different screen sizes and devices",
          impact: "high",
          checked: false,
          guidance:
            "Check mobile, tablet, and desktop views for all critical pages",
        },
        {
          id: "ui-2",
          title: "Accessibility compliance",
          description:
            "Ensure the application meets basic accessibility standards",
          impact: "medium",
          checked: false,
          guidance:
            "Check for proper contrast, keyboard navigation, screen reader support, and ARIA attributes",
        },
        {
          id: "ui-3",
          title: "Loading states",
          description:
            "Verify that appropriate loading indicators are shown during async operations",
          impact: "medium",
          checked: false,
        },
        {
          id: "ui-4",
          title: "Error states",
          description:
            "Check that user-friendly error messages are displayed when operations fail",
          impact: "high",
          checked: false,
        },
        {
          id: "ui-5",
          title: "Empty states",
          description:
            "Ensure appropriate content is shown when lists or data containers are empty",
          impact: "medium",
          checked: false,
        },
        {
          id: "ui-6",
          title: "Visual consistency",
          description:
            "Check for consistent use of colors, typography, spacing, and component styles",
          impact: "medium",
          checked: false,
        },
        {
          id: "ui-7",
          title: "Navigation and wayfinding",
          description:
            "Verify that users can easily navigate between sections and understand their location",
          impact: "high",
          checked: false,
        },
        {
          id: "ui-8",
          title: "Form usability",
          description:
            "Test form interactions, tab order, validation feedback, and submission flows",
          impact: "high",
          checked: false,
        },
      ],
    },
    {
      id: "data-handling",
      title: "Data Handling & Integrity",
      icon: <Database className="h-5 w-5" />,
      description: "Ensure data is processed, stored, and retrieved correctly",
      items: [
        {
          id: "data-1",
          title: "Data validation",
          description:
            "Verify that all user inputs are properly validated before processing",
          impact: "high",
          checked: false,
          guidance:
            "Check for validation in forms, API endpoints, and database triggers",
        },
        {
          id: "data-2",
          title: "Database constraints",
          description:
            "Ensure appropriate constraints are in place to maintain data integrity",
          impact: "high",
          checked: false,
          guidance:
            "Review foreign keys, unique constraints, and not-null constraints",
        },
        {
          id: "data-3",
          title: "Transaction handling",
          description:
            "Verify that related operations are wrapped in transactions where appropriate",
          impact: "high",
          checked: false,
          guidance:
            "Look for operations that modify multiple tables or records",
        },
        {
          id: "data-4",
          title: "Data migration",
          description:
            "Test data migration scripts and ensure they handle existing data correctly",
          impact: "medium",
          checked: false,
        },
        {
          id: "data-5",
          title: "Backup and recovery",
          description:
            "Verify that data backup procedures are in place and tested",
          impact: "high",
          checked: false,
        },
        {
          id: "data-6",
          title: "Data consistency",
          description:
            "Check for potential inconsistencies between related data entities",
          impact: "high",
          checked: false,
          guidance:
            "Verify that box and unit quantities remain in sync across operations",
        },
        {
          id: "data-7",
          title: "Audit trails",
          description:
            "Ensure important operations are logged for auditing purposes",
          impact: "medium",
          checked: false,
          guidance:
            "Check for logging of inventory adjustments, user actions, and system events",
        },
        {
          id: "data-8",
          title: "Data export/import",
          description:
            "Test data export and import functionality for accuracy and completeness",
          impact: "medium",
          checked: false,
        },
      ],
    },
    {
      id: "performance",
      title: "Performance & Optimization",
      icon: <Zap className="h-5 w-5" />,
      description: "Evaluate application performance and resource usage",
      items: [
        {
          id: "perf-1",
          title: "Page load times",
          description:
            "Measure and optimize initial page load and time to interactive",
          impact: "high",
          checked: false,
          guidance:
            "Use browser dev tools to measure load times across different pages",
        },
        {
          id: "perf-2",
          title: "API response times",
          description:
            "Verify that API calls complete within acceptable timeframes",
          impact: "high",
          checked: false,
          guidance:
            "Test with realistic data volumes and monitor network tab in dev tools",
        },
        {
          id: "perf-3",
          title: "Bundle size optimization",
          description:
            "Check for unnecessarily large dependencies and code splitting opportunities",
          impact: "medium",
          checked: false,
        },
        {
          id: "perf-4",
          title: "Rendering performance",
          description:
            "Identify and fix components that cause unnecessary re-renders",
          impact: "medium",
          checked: false,
          guidance:
            "Use React DevTools profiler to identify components with excessive renders",
        },
        {
          id: "perf-5",
          title: "Database query optimization",
          description: "Review and optimize database queries for performance",
          impact: "high",
          checked: false,
          guidance:
            "Check for missing indexes, N+1 query problems, and inefficient joins",
        },
        {
          id: "perf-6",
          title: "Caching strategy",
          description:
            "Implement appropriate caching for API responses and static assets",
          impact: "medium",
          checked: false,
        },
        {
          id: "perf-7",
          title: "Memory usage",
          description: "Monitor and optimize client-side memory usage",
          impact: "medium",
          checked: false,
          guidance:
            "Check for memory leaks and excessive DOM size in large tables/lists",
        },
        {
          id: "perf-8",
          title: "Large data handling",
          description: "Test application performance with large datasets",
          impact: "high",
          checked: false,
          guidance:
            "Verify pagination, virtualization, and filtering work efficiently with large inventory data",
        },
      ],
    },
    {
      id: "security",
      title: "Security & Compliance",
      icon: <Shield className="h-5 w-5" />,
      description:
        "Ensure the application is secure and protects sensitive data",
      items: [
        {
          id: "sec-1",
          title: "Authentication security",
          description:
            "Review authentication implementation for security best practices",
          impact: "high",
          checked: false,
          guidance:
            "Check password policies, session management, and account recovery flows",
        },
        {
          id: "sec-2",
          title: "Authorization controls",
          description:
            "Verify that authorization checks are implemented consistently",
          impact: "high",
          checked: false,
          guidance:
            "Test that users cannot access resources or perform actions beyond their permissions",
        },
        {
          id: "sec-3",
          title: "Input validation & sanitization",
          description:
            "Check for proper validation and sanitization of all user inputs",
          impact: "high",
          checked: false,
          guidance:
            "Test for XSS, SQL injection, and other injection vulnerabilities",
        },
        {
          id: "sec-4",
          title: "Sensitive data exposure",
          description:
            "Ensure sensitive data is properly protected in transit and at rest",
          impact: "high",
          checked: false,
          guidance:
            "Verify HTTPS usage, proper encryption, and secure storage of credentials",
        },
        {
          id: "sec-5",
          title: "API security",
          description: "Review API endpoints for security vulnerabilities",
          impact: "high",
          checked: false,
          guidance:
            "Check for rate limiting, proper authentication, and CORS configuration",
        },
        {
          id: "sec-6",
          title: "Dependency vulnerabilities",
          description: "Scan for known vulnerabilities in dependencies",
          impact: "medium",
          checked: false,
          guidance:
            "Run npm audit or similar tools to identify vulnerable packages",
        },
        {
          id: "sec-7",
          title: "Logging and monitoring",
          description:
            "Ensure security events are properly logged for detection and response",
          impact: "medium",
          checked: false,
        },
        {
          id: "sec-8",
          title: "Data privacy compliance",
          description:
            "Verify compliance with relevant data protection regulations",
          impact: "high",
          checked: false,
          guidance:
            "Check for proper consent mechanisms, data retention policies, and privacy notices",
        },
      ],
    },
    {
      id: "deployment",
      title: "Deployment & Infrastructure",
      icon: <HardDrive className="h-5 w-5" />,
      description:
        "Ensure the application is properly configured for production",
      items: [
        {
          id: "deploy-1",
          title: "Environment configuration",
          description:
            "Verify that environment variables are properly set for production",
          impact: "high",
          checked: false,
          guidance:
            "Check that all required environment variables are documented and configured",
        },
        {
          id: "deploy-2",
          title: "Build process",
          description:
            "Test the production build process for errors and warnings",
          impact: "high",
          checked: false,
        },
        {
          id: "deploy-3",
          title: "Deployment pipeline",
          description: "Verify that CI/CD pipelines are properly configured",
          impact: "medium",
          checked: false,
          guidance:
            "Check that tests run automatically and deployments require approval",
        },
        {
          id: "deploy-4",
          title: "Rollback procedures",
          description:
            "Document and test procedures for rolling back deployments",
          impact: "high",
          checked: false,
        },
        {
          id: "deploy-5",
          title: "Infrastructure scaling",
          description:
            "Ensure infrastructure can scale to handle expected load",
          impact: "medium",
          checked: false,
          guidance:
            "Review database connection pools, server resources, and scaling policies",
        },
        {
          id: "deploy-6",
          title: "Monitoring and alerting",
          description: "Set up monitoring and alerting for application health",
          impact: "high",
          checked: false,
          guidance:
            "Configure alerts for errors, performance issues, and resource utilization",
        },
        {
          id: "deploy-7",
          title: "Backup procedures",
          description:
            "Verify that automated backups are configured and tested",
          impact: "high",
          checked: false,
        },
        {
          id: "deploy-8",
          title: "Documentation",
          description:
            "Ensure deployment and operational procedures are documented",
          impact: "medium",
          checked: false,
          guidance:
            "Create runbooks for common operational tasks and troubleshooting",
        },
      ],
    },
  ]);

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : section,
      ),
    );
  };

  const getSectionProgress = (section: ChecklistSection) => {
    const total = section.items.length;
    const completed = section.items.filter((item) => item.checked).length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  const getOverallProgress = () => {
    const total = sections.reduce(
      (acc, section) => acc + section.items.length,
      0,
    );
    const completed = sections.reduce(
      (acc, section) =>
        acc + section.items.filter((item) => item.checked).length,
      0,
    );
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  const getImpactBadge = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">High Impact</Badge>;
      case "medium":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium Impact
          </Badge>
        );
      case "low":
        return <Badge variant="outline">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const overall = getOverallProgress();

  return (
    <div className="space-y-6 bg-background p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pre-Launch Quality Checklist
          </h2>
          <p className="text-muted-foreground">
            Comprehensive review of your application before deployment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-2xl font-bold">{overall.percentage}%</p>
          </div>
          <div className="h-10 w-10 rounded-full border-4 flex items-center justify-center">
            <CheckCircle2
              className={`h-6 w-6 ${overall.percentage === 100 ? "text-green-500" : "text-muted-foreground"}`}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue={sections[0].id} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 w-full h-auto">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center gap-2"
            >
              {section.icon}
              <span className="hidden md:inline">{section.title}</span>
              <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                {getSectionProgress(section).completed}/
                {getSectionProgress(section).total}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent
            key={section.id}
            value={section.id}
            className="space-y-4 pt-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <div className="text-sm">
                <span className="font-medium">
                  {getSectionProgress(section).percentage}% Complete
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  ({getSectionProgress(section).completed}/
                  {getSectionProgress(section).total})
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              {section.items.map((item) => (
                <Card
                  key={item.id}
                  className={item.checked ? "bg-muted/50" : ""}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() =>
                            toggleItem(section.id, item.id)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor={item.id}
                            className={`text-base font-medium ${item.checked ? "line-through opacity-70" : ""}`}
                          >
                            {item.title}
                          </Label>
                          <CardDescription
                            className={item.checked ? "opacity-70" : ""}
                          >
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getImpactBadge(item.impact)}
                    </div>
                  </CardHeader>
                  {item.guidance && (
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-start gap-2 text-sm bg-muted p-3 rounded-md">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <p>{item.guidance}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default QualityChecklist;
