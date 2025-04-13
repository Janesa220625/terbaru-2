import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickAddRecipientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface QuickAddRecipientProps {
  formData: QuickAddRecipientFormData;
  onChange: (field: keyof QuickAddRecipientFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const QuickAddRecipient: React.FC<QuickAddRecipientProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quick-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="quick-name"
          name="name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Enter recipient name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quick-email">Email</Label>
        <Input
          id="quick-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="Enter email address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quick-phone">Phone</Label>
        <Input
          id="quick-phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quick-address">Address</Label>
        <Input
          id="quick-address"
          name="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Enter address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quick-notes">Notes</Label>
        <Input
          id="quick-notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Enter additional notes"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.name.trim()}
          className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
        >
          Add Recipient
        </Button>
      </div>
    </div>
  );
};

export default QuickAddRecipient;
