import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuickAddRecipientFormProps {
  form: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const QuickAddRecipientForm = ({
  form,
  onFormChange,
}: QuickAddRecipientFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipient-name" className="text-sm font-medium">
          Recipient Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipient-name"
          value={form.name}
          onChange={(e) => onFormChange("name", e.target.value)}
          placeholder="Enter recipient name"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="recipient-email"
          type="email"
          value={form.email}
          onChange={(e) => onFormChange("email", e.target.value)}
          placeholder="Enter email address"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-phone" className="text-sm font-medium">
          Phone Number
        </Label>
        <Input
          id="recipient-phone"
          value={form.phone}
          onChange={(e) => onFormChange("phone", e.target.value)}
          placeholder="Enter phone number"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-address" className="text-sm font-medium">
          Address
        </Label>
        <Textarea
          id="recipient-address"
          value={form.address}
          onChange={(e) => onFormChange("address", e.target.value)}
          placeholder="Enter address"
          className="w-full min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="recipient-notes"
          value={form.notes}
          onChange={(e) => onFormChange("notes", e.target.value)}
          placeholder="Enter additional notes"
          className="w-full min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default QuickAddRecipientForm;
