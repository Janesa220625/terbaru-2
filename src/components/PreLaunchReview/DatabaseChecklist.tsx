import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, Database, Shield, Server } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category: "structure" | "integrity" | "performance" | "security";
}

const databaseChecklist: ChecklistItem[] = [
  // Database Structure
  {
    id: "db-structure-1",
    label: "Schema design follows normalization principles",
    description:
      "Tables are properly normalized to reduce redundancy and improve data integrity",
    priority: "high",
    category: "structure",
  },
  {
    id: "db-structure-2",
    label: "Appropriate data types are used for all columns",
    description:
      "Column data types are optimized for storage and query performance",
    priority: "high",
    category: "structure",
  },
  {
    id: "db-structure-3",
    label: "Indexes are created for frequently queried columns",
    description:
      "Proper indexes exist on columns used in WHERE clauses and joins",
    priority: "high",
    category: "structure",
  },
  {
    id: "db-structure-4",
    label: "Foreign key constraints are properly defined",
    description:
      "Relationships between tables are enforced with appropriate constraints",
    priority: "medium",
    category: "structure",
  },
  {
    id: "db-structure-5",
    label: "Database schema documentation is complete",
    description:
      "Schema includes comments and documentation for tables and columns",
    priority: "medium",
    category: "structure",
  },

  // Data Integrity
  {
    id: "db-integrity-1",
    label: "Primary keys are defined for all tables",
    description: "Every table has a unique identifier to ensure row uniqueness",
    priority: "high",
    category: "integrity",
  },
  {
    id: "db-integrity-2",
    label: "NOT NULL constraints applied where appropriate",
    description:
      "Required fields are properly constrained to prevent null values",
    priority: "high",
    category: "integrity",
  },
  {
    id: "db-integrity-3",
    label: "CHECK constraints implemented for data validation",
    description: "Data validation rules are enforced at the database level",
    priority: "medium",
    category: "integrity",
  },
  {
    id: "db-integrity-4",
    label: "Unique constraints applied where needed",
    description:
      "Columns that should contain unique values are properly constrained",
    priority: "medium",
    category: "integrity",
  },
  {
    id: "db-integrity-5",
    label: "Cascading actions configured appropriately",
    description:
      "UPDATE and DELETE cascades are configured based on business rules",
    priority: "medium",
    category: "integrity",
  },

  // Database Performance
  {
    id: "db-performance-1",
    label: "Query performance has been tested with realistic data volumes",
    description: "Queries have been tested with production-like data volumes",
    priority: "high",
    category: "performance",
  },
  {
    id: "db-performance-2",
    label: "Slow queries have been identified and optimized",
    description: "Query execution plans have been analyzed and optimized",
    priority: "high",
    category: "performance",
  },
  {
    id: "db-performance-3",
    label: "Connection pooling is properly configured",
    description: "Database connections are efficiently managed",
    priority: "medium",
    category: "performance",
  },
  {
    id: "db-performance-4",
    label: "Database caching strategy implemented where appropriate",
    description: "Frequently accessed data is cached to reduce database load",
    priority: "medium",
    category: "performance",
  },
  {
    id: "db-performance-5",
    label: "Database maintenance procedures are in place",
    description:
      "Regular maintenance tasks (vacuum, analyze, etc.) are scheduled",
    priority: "low",
    category: "performance",
  },

  // Database Security
  {
    id: "db-security-1",
    label: "Row-level security policies are implemented",
    description: "RLS policies restrict data access based on user roles",
    priority: "high",
    category: "security",
  },
  {
    id: "db-security-2",
    label: "Database credentials are securely stored",
    description:
      "Connection strings and credentials are not hardcoded in the application",
    priority: "high",
    category: "security",
  },
  {
    id: "db-security-3",
    label: "Least privilege principle applied to database users",
    description: "Database users have only the permissions they need",
    priority: "high",
    category: "security",
  },
  {
    id: "db-security-4",
    label: "SQL injection prevention measures are in place",
    description:
      "Parameterized queries or ORM is used to prevent SQL injection",
    priority: "high",
    category: "security",
  },
  {
    id: "db-security-5",
    label: "Database backup and recovery procedures tested",
    description:
      "Regular backups are configured and restore procedures have been tested",
    priority: "medium",
    category: "security",
  },
];

const DatabaseChecklist: React.FC = () => {
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
    const categoryItems = databaseChecklist.filter(
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
      case "structure":
        return <Database className="h-4 w-4" />;
      case "integrity":
        return <Shield className="h-4 w-4" />;
      case "performance":
        return <Server className="h-4 w-4" />;
      case "security":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return databaseChecklist
      .filter((item) => item.category === category)
      .map((item) => (
        <div key={item.id} className="flex items-start space-x-3 py-3">
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
              <Database className="h-5 w-5 text-primary" />
              Database Checklist
            </CardTitle>
            <CardDescription>
              Ensure database structure, integrity, performance, and security
              meet production standards
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Database Structure Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database Structure
            </h3>
            <Badge variant="outline">{getCompletionStatus("structure")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("structure")}
          </div>
        </div>

        {/* Data Integrity Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Data Integrity
            </h3>
            <Badge variant="outline">{getCompletionStatus("integrity")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("integrity")}
          </div>
        </div>

        {/* Database Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Database Performance
            </h3>
            <Badge variant="outline">
              {getCompletionStatus("performance")}
            </Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("performance")}
          </div>
        </div>

        {/* Database Security Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Database Security
            </h3>
            <Badge variant="outline">{getCompletionStatus("security")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("security")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseChecklist;
