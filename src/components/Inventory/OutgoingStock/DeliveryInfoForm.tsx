import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Recipient } from "../RecipientManagement";

interface DeliveryInfoFormProps {
  documentNumber: string;
  recipientId: string;
  recipient: string;
  notes: string;
  recipients: Recipient[];
  onRecipientChange: (recipientId: string, recipientName: string) => void;
  onNotesChange: (notes: string) => void;
  onManualRecipientChange: (name: string) => void;
  onAddRecipientClick: () => void;
}

const DeliveryInfoForm: React.FC<DeliveryInfoFormProps> = ({
  documentNumber,
  recipientId,
  recipient,
  notes,
  recipients,
  onRecipientChange,
  onNotesChange,
  onManualRecipientChange,
  onAddRecipientClick,
}) => {
  return (
    <div className="bg-slate-50 p-5 rounded-md border shadow-sm">
      <h3 className="text-sm font-semibold mb-4 text-primary">
        Delivery Information
      </h3>
      <div className="space-y-6">
        <div>
          <Label
            htmlFor="documentNumber"
            className="text-sm font-medium mb-2 block"
          >
            Document Number{" "}
            <span className="text-xs text-muted-foreground ml-1">
              (Auto-generated)
            </span>
          </Label>
          <Input
            id="documentNumber"
            value={documentNumber}
            className="h-10 text-base bg-slate-100 cursor-not-allowed font-mono text-sm"
            disabled
            readOnly
          />
        </div>
        <div>
          <Label htmlFor="date" className="text-sm font-medium mb-2 block">
            Date & Time
          </Label>
          <div className="h-10 text-base bg-slate-100 p-2 rounded-md border">
            {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically set to current date and time
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="recipient" className="text-sm font-medium">
              Recipient
              <span className="text-xs text-amber-600 ml-2">
                (Cannot be changed after creation)
              </span>
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs flex items-center gap-1 text-primary"
              onClick={onAddRecipientClick}
            >
              <UserPlus className="h-3 w-3" />
              Add New
            </Button>
          </div>
          {recipients.length === 0 ? (
            <div className="flex flex-col gap-2">
              <Input
                id="recipient"
                className="h-10 text-base"
                value={recipient}
                onChange={(e) => onManualRecipientChange(e.target.value)}
                placeholder="Enter recipient name"
              />
              <p className="text-xs text-amber-600">
                No saved recipients found. Add recipients in the Recipient
                Management module for easier selection.
              </p>
            </div>
          ) : (
            <Select
              value={recipientId}
              onValueChange={(value) => {
                const selectedRecipient = recipients.find(
                  (r) => r.id === value,
                );
                onRecipientChange(
                  value,
                  selectedRecipient ? selectedRecipient.name : "",
                );
              }}
            >
              <SelectTrigger className="h-10 text-base">
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name}
                    {recipient.phone && ` • ${recipient.phone}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
            Notes
          </Label>
          <Input
            id="notes"
            className="h-10 text-base"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter notes (optional)"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfoForm;
