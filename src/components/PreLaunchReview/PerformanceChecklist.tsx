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
import { Gauge, Zap, Timer, Smartphone, Server } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "high" | "medium" | "low";
  category: "frontend" | "backend" | "database" | "network" | "mobile";
}

const performanceChecklist: ChecklistItem[] = [
  // Frontend Performance
  {
    id: "perf-frontend-1",
    label: "JavaScript bundle size is optimized",
    description:
      "Bundle size is minimized through code splitting and tree shaking",
    priority: "high",
    category: "frontend",
  },
  {
    id: "perf-frontend-2",
    label: "Images are optimized and properly sized",
    description: "Images are compressed and served at appropriate dimensions",
    priority: "high",
    category: "frontend",
  },
  {
    id: "perf-frontend-3",
    label: "CSS is optimized and minified",
    description: "CSS is minified and unused styles are removed",
    priority: "medium",
    category: "frontend",
  },
  {
    id: "perf-frontend-4",
    label: "Render-blocking resources are minimized",
    description:
      "Critical CSS is inlined and non-critical resources are deferred",
    priority: "high",
    category: "frontend",
  },
  {
    id: "perf-frontend-5",
    label: "Client-side caching is implemented",
    description: "Static assets have appropriate cache headers",
    priority: "medium",
    category: "frontend",
  },

  // Backend Performance
  {
    id: "perf-backend-1",
    label: "API response times meet performance targets",
    description: "API endpoints respond within acceptable time limits",
    priority: "high",
    category: "backend",
  },
  {
    id: "perf-backend-2",
    label: "Server-side caching is implemented",
    description: "Frequently accessed data is cached to reduce processing time",
    priority: "high",
    category: "backend",
  },
  {
    id: "perf-backend-3",
    label: "Background processing is used for time-consuming tasks",
    description: "Long-running operations are processed asynchronously",
    priority: "medium",
    category: "backend",
  },
  {
    id: "perf-backend-4",
    label: "Memory usage is optimized",
    description: "Application does not have memory leaks or excessive usage",
    priority: "high",
    category: "backend",
  },
  {
    id: "perf-backend-5",
    label: "CPU usage is optimized",
    description: "Application does not have CPU bottlenecks or excessive usage",
    priority: "high",
    category: "backend",
  },

  // Database Performance
  {
    id: "perf-database-1",
    label: "Database queries are optimized",
    description: "Queries are efficient and retrieve only necessary data",
    priority: "high",
    category: "database",
  },
  {
    id: "perf-database-2",
    label: "Indexes are created for frequently queried columns",
    description:
      "Appropriate indexes exist for columns used in WHERE clauses and joins",
    priority: "high",
    category: "database",
  },
  {
    id: "perf-database-3",
    label: "Database connection pooling is configured",
    description: "Connection pool is sized appropriately for expected load",
    priority: "medium",
    category: "database",
  },
  {
    id: "perf-database-4",
    label: "Database schema is optimized",
    description:
      "Schema design follows normalization principles where appropriate",
    priority: "medium",
    category: "database",
  },
  {
    id: "perf-database-5",
    label: "Database server is properly sized",
    description: "Database server has sufficient resources for expected load",
    priority: "medium",
    category: "database",
  },

  // Network Performance
  {
    id: "perf-network-1",
    label: "Content delivery network (CDN) is used",
    description: "Static assets are served from a CDN to reduce latency",
    priority: "medium",
    category: "network",
  },
  {
    id: "perf-network-2",
    label: "HTTP/2 or HTTP/3 is enabled",
    description: "Modern HTTP protocols are used to improve performance",
    priority: "medium",
    category: "network",
  },
  {
    id: "perf-network-3",
    label: "GZIP or Brotli compression is enabled",
    description: "Responses are compressed to reduce transfer size",
    priority: "high",
    category: "network",
  },
  {
    id: "perf-network-4",
    label: "DNS prefetching is implemented",
    description: "DNS resolution is performed in advance for critical domains",
    priority: "low",
    category: "network",
  },
  {
    id: "perf-network-5",
    label: "Network requests are minimized",
    description: "Resources are combined to reduce the number of requests",
    priority: "medium",
    category: "network",
  },

  // Mobile Performance
  {
    id: "perf-mobile-1",
    label: "Application is responsive on mobile devices",
    description: "UI is usable and performs well on various mobile devices",
    priority: "high",
    category: "mobile",
  },
  {
    id: "perf-mobile-2",
    label: "Mobile-specific optimizations are implemented",
    description:
      "Performance optimizations specific to mobile devices are in place",
    priority: "medium",
    category: "mobile",
  },
  {
    id: "perf-mobile-3",
    label: "Touch interactions are responsive",
    description: "Touch events respond within acceptable time limits",
    priority: "high",
    category: "mobile",
  },
  {
    id: "perf-mobile-4",
    label: "Offline capabilities are implemented where appropriate",
    description: "Application can function with limited or no connectivity",
    priority: "medium",
    category: "mobile",
  },
  {
    id: "perf-mobile-5",
    label: "Battery usage is optimized",
    description: "Application does not drain battery excessively",
    priority: "medium",
    category: "mobile",
  },
];

const PerformanceChecklist: React.FC = () => {
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
    const categoryItems = performanceChecklist.filter(
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
      case "frontend":
        return <Zap className="h-4 w-4" />;
      case "backend":
        return <Server className="h-4 w-4" />;
      case "database":
        return <Timer className="h-4 w-4" />;
      case "network":
        return <Gauge className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  const renderCategoryItems = (category: string) => {
    return performanceChecklist
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
              <Gauge className="h-5 w-5 text-primary" />
              Performance Checklist
            </CardTitle>
            <CardDescription>
              Analyze performance bottlenecks and implement optimization
              measures
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frontend Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Frontend Performance
            </h3>
            <Badge variant="outline">{getCompletionStatus("frontend")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("frontend")}
          </div>
        </div>

        {/* Backend Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Backend Performance
            </h3>
            <Badge variant="outline">{getCompletionStatus("backend")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("backend")}
          </div>
        </div>

        {/* Database Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              Database Performance
            </h3>
            <Badge variant="outline">{getCompletionStatus("database")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("database")}
          </div>
        </div>

        {/* Network Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Network Performance
            </h3>
            <Badge variant="outline">{getCompletionStatus("network")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("network")}
          </div>
        </div>

        {/* Mobile Performance Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Mobile Performance
            </h3>
            <Badge variant="outline">{getCompletionStatus("mobile")}</Badge>
          </div>
          <div className="border rounded-md divide-y">
            {renderCategoryItems("mobile")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChecklist;
