import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { OutgoingStockDocument } from "./OutgoingDocumentList";
import { Recipient } from "../RecipientManagement";
import { printOutgoingStockDocument } from "@/lib/utils/printUtils";

interface ViewOutgoingDocumentProps {
  document: OutgoingStockDocument;
  recipients: Recipient[];
  onClose: () => void;
}

const ViewOutgoingDocument: React.FC<ViewOutgoingDocumentProps> = ({
  document,
  recipients,
  onClose,
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-md border">
        <div>
          <p className="text-sm font-medium text-primary">Date:</p>
          <p className="text-sm mt-1">
            {document.time
              ? `${new Date(document.date).toLocaleDateString()} ${document.time}`
              : new Date(document.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Document Number:</p>
          <p className="text-sm mt-1 font-mono">{document.documentNumber}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-md border">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-primary">Recipient:</p>
        </div>
        <div className="mt-2 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
          <p className="text-sm font-medium mb-2">{document.recipient}</p>
          {document.recipientId && (
            <div className="space-y-2 border-t pt-2">
              {/* Recipient details would go here */}
            </div>
          )}
        </div>
      </div>

      {document.notes && (
        <div className="p-4 bg-slate-50 rounded-md border">
          <p className="text-sm font-medium text-primary">Notes:</p>
          <p className="text-sm mt-1">{document.notes}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium mb-3 text-primary">Items:</h3>
        <div className="border rounded-md overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 text-xs font-semibold">SKU</th>
                <th className="text-left p-3 text-xs font-semibold">Product</th>
                <th className="text-left p-3 text-xs font-semibold">Size</th>
                <th className="text-left p-3 text-xs font-semibold">Color</th>
                <th className="text-right p-3 text-xs font-semibold">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No items added yet
                  </td>
                </tr>
              ) : (
                document.items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 text-xs font-mono">{item.sku}</td>
                    <td className="p-3 text-xs">{item.name}</td>
                    <td className="p-3 text-xs">{item.size}</td>
                    <td className="p-3 text-xs">{item.color}</td>
                    <td className="p-3 text-xs text-right font-medium">
                      {item.quantity} pairs
                    </td>
                  </tr>
                ))
              )}
              <tr className="border-t bg-slate-100">
                <td
                  colSpan={4}
                  className="p-3 text-xs font-semibold text-right"
                >
                  Total:
                </td>
                <td className="p-3 text-xs font-semibold text-right text-primary">
                  {document.totalItems} pairs
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => printOutgoingStockDocument(document)}
        >
          <Printer className="h-4 w-4" />
          Print Document
        </Button>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default ViewOutgoingDocument;
