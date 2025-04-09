import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  sku: z.string().min(3, { message: "SKU must be at least 3 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  pairsPerBox: z.coerce
    .number()
    .min(1, { message: "Must have at least 1 pair per box" }),
  sizes: z.string().min(1, { message: "Please enter available sizes" }),
  colors: z.string().min(1, { message: "Please enter available colors" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit?: (data: FormValues) => void;
  initialData?: Partial<FormValues>;
}

const ProductForm = ({
  onSubmit = () => {},
  initialData = {},
}: ProductFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: initialData.sku || "",
      name: initialData.name || "",
      category: initialData.category || "",
      pairsPerBox: initialData.pairsPerBox || 6,
      sizes: initialData.sizes || "",
      colors: initialData.colors || "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    if (!initialData.sku) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 bg-white p-6 rounded-md border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU-123-BLK" {...field} />
                </FormControl>
                <FormDescription>
                  Unique identifier for the product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Men's Casual Shoes" {...field} />
                </FormControl>
                <FormDescription>
                  Descriptive name of the product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="men_shoes">Men's Shoes</SelectItem>
                    <SelectItem value="women_shoes">Women's Shoes</SelectItem>
                    <SelectItem value="men_sandals">Men's Sandals</SelectItem>
                    <SelectItem value="women_sandals">
                      Women's Sandals
                    </SelectItem>
                    <SelectItem value="kids_shoes">Kids' Shoes</SelectItem>
                    <SelectItem value="sports">Sports Footwear</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Product category</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pairsPerBox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pairs Per Box</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="6" {...field} />
                </FormControl>
                <FormDescription>Number of pairs in each box</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Sizes</FormLabel>
                <FormControl>
                  <Input placeholder="36,37,38,39,40,41,42,43,44" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated list of available sizes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Colors</FormLabel>
                <FormControl>
                  <Input placeholder="Black,Brown,White,Red" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated list of available colors
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData.sku ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
