import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ValidationItem {
  sku: string;
  size?: string;
  color?: string;
  quantity?: number;
  isValid: boolean;
  reason?: string;
}

interface ValidationDisplayProps {
  validItems: ValidationItem[];
  invalidItems: ValidationItem[];
  onClose: () => void;
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validItems,
  invalidItems,
  onClose,
}) => {
  if (validItems.length === 0 && invalidItems.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mb-6 border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Upload Validation Results</CardTitle>
            <CardDescription>
              {validItems.length} items successfully added,{" "}
              {invalidItems.length} items failed validation
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Close validation results"
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {invalidItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed Items
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {invalidItems.map((item, index) => (
                <Alert
                  key={`${item.sku}-${index}`}
                  variant="destructive"
                  className="py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {item.sku || "Unknown SKU"}
                      </div>
                      <AlertDescription className="text-xs mt-1">
                        {item.reason || "Unknown error"}
                      </AlertDescription>
                      {item.size && item.color && (
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Size: {item.size}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Color: {item.color}
                          </Badge>
                          {item.quantity && (
                            <Badge variant="outline" className="text-xs">
                              Qty: {item.quantity}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {validItems.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="font-medium flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Successfully Added Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {validItems.map((item, index) => (
                <Alert
                  key={`${item.sku}-${index}`}
                  className="py-2 bg-green-50 border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.sku}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Size: {item.size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Color: {item.color}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationDisplay;
