import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Upload } from "lucide-react";
import { AggregatedStockItem } from "../SingleWarehouseStock";
import { Recipient } from "../RecipientManagement";
import {
  generateOutgoingStockExcelTemplate,
  parseOutgoingStockExcelTemplate,
} from "@/lib/utils/excelUtils";

interface MassUploadDialogProps {
  availableStock: AggregatedStockItem[];
  recipients: Recipient[];
  isUploading: boolean;
  uploadError: string | null;
  uploadValidationData: {
    validItems: any[];
    invalidItems: any[];
  } | null;
  processingUpload: boolean;
  onFileUpload: (file: File) => void;
  onCreateDocuments: () => void;
  onCancel: () => void;
}

const MassUploadDialog: React.FC<MassUploadDialogProps> = ({
  availableStock,
  recipients,
  isUploading,
  uploadError,
  uploadValidationData,
  processingUpload,
  onFileUpload,
  onCreateDocuments,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">
              Upload Excel Template
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload the filled Excel template to create multiple outgoing stock
              documents at once.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() =>
              generateOutgoingStockExcelTemplate(availableStock, recipients)
            }
          >
            <Download className="h-3.5 w-3.5" />
            Get Template
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file);
              }
            }}
          />
          <Button
            variant="secondary"
            className="flex-1 h-20 border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-slate-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 mb-2 text-slate-400" />
              <span className="text-sm font-medium">
                {isUploading ? "Uploading..." : "Click to upload Excel file"}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {uploadValidationData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Validation Results</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {uploadValidationData.validItems.length} Valid
              </Badge>
              {uploadValidationData.invalidItems.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  {uploadValidationData.invalidItems.length} Invalid
                </Badge>
              )}
            </div>
          </div>

          {uploadValidationData.invalidItems.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-red-50 p-3 border-b">
                <h4 className="text-sm font-medium text-red-800">
                  Invalid Items
                </h4>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {uploadValidationData.invalidItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border-b last:border-b-0 text-sm"
                  >
                    <div className="flex justify-between">
                      <span>
                        {item.sku} | Size: {item.size} | Color: {item.color} |
                        Qty: {item.quantity}
                      </span>
                      <span className="text-red-600 font-medium">
                        {item.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadValidationData.validItems.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-green-50 p-3 border-b">
                <h4 className="text-sm font-medium text-green-800">
                  Valid Items
                </h4>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {uploadValidationData.validItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border-b last:border-b-0 text-sm"
                  >
                    <div className="flex justify-between">
                      <span>
                        {item.sku} | Size: {item.size} | Color: {item.color} |
                        Qty: {item.quantity}
                      </span>
                      <span className="text-slate-500">
                        Recipient: {item.recipient}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={
            !uploadValidationData ||
            uploadValidationData.validItems.length === 0 ||
            isUploading ||
            processingUpload
          }
          className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
          onClick={onCreateDocuments}
        >
          {processingUpload
            ? "Processing..."
            : `Create ${uploadValidationData?.validItems.length || 0} Deliveries`}
        </Button>
      </div>
    </div>
  );
};

export default MassUploadDialog;
