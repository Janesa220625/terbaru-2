import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ClipboardList, Phone, Search } from "lucide-react";
import { Recipient } from "../RecipientManagement";

export interface OutgoingStockItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

export interface OutgoingStockDocument {
  id: string;
  documentNumber: string;
  date: string;
  time?: string;
  recipientId?: string;
  recipient: string;
  notes: string;
  items: OutgoingStockItem[];
  totalItems: number;
}

interface OutgoingDocumentListProps {
  documents: OutgoingStockDocument[];
  recipients: Recipient[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDocumentSelect: (document: OutgoingStockDocument) => void;
  onCreateNew: () => void;
}

const OutgoingDocumentList: React.FC<OutgoingDocumentListProps> = ({
  documents,
  recipients,
  searchTerm,
  onSearchChange,
  onDocumentSelect,
  onCreateNew,
}) => {
  const filteredDocuments = documents.filter(
    (document) =>
      document.documentNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      document.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="relative w-[250px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select
          value="all"
          onValueChange={(value) => {
            // Filter by recipient would go here
            console.log("Filter by recipient:", value);
          }}
        >
          <SelectTrigger className="w-[200px] h-10">
            <SelectValue placeholder="Filter by recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipients</SelectItem>
            {recipients.map((recipient) => (
              <SelectItem key={recipient.id} value={recipient.id}>
                {recipient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {documents.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-slate-50">
          <p className="text-muted-foreground">No stock issue documents yet</p>
          <Button variant="link" className="mt-2" onClick={onCreateNew}>
            Create your first delivery
          </Button>
        </div>
      ) : (
        filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="flex items-center p-4 border rounded-md hover:bg-slate-50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onDocumentSelect(document)}
          >
            <div className="p-2 rounded-full bg-primary/10 mr-4">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Document #{document.documentNumber}
                </h3>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {document.time
                    ? `${new Date(document.date).toLocaleDateString()} ${document.time}`
                    : new Date(document.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {document.recipient}
                  </span>
                  {document.recipientId &&
                    recipients.find((r) => r.id === document.recipientId)
                      ?.phone && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {
                          recipients.find((r) => r.id === document.recipientId)
                            ?.phone
                        }
                      </span>
                    )}
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {document.totalItems} items
                </Badge>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OutgoingDocumentList;
