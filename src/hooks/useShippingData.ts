import { useState, useEffect } from "react";
import { loadFromStorage } from "@/lib/storage";
import { isWithinInterval } from "date-fns";

interface OutgoingStockItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface OutgoingStockDocument {
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

interface ProductShipmentData {
  recipient: string;
  recipientId?: string;
  product: string;
  sku: string;
  totalPairs: number;
  shipmentCount: number;
  lastShipmentDate: string;
  documents: string[];
}

interface UseShippingDataProps {
  productFilter: string;
  recipientFilter: string;
  searchTerm: string;
  startDate: Date;
  endDate: Date;
}

export const useShippingData = ({
  productFilter,
  recipientFilter,
  searchTerm,
  startDate,
  endDate,
}: UseShippingDataProps) => {
  // State for data
  const [outgoingDocuments, setOutgoingDocuments] = useState<
    OutgoingStockDocument[]
  >([]);
  const [products, setProducts] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [shipmentData, setShipmentData] = useState<ProductShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate shipment data when filters change
  useEffect(() => {
    aggregateShipmentData();
  }, [
    outgoingDocuments,
    productFilter,
    recipientFilter,
    startDate,
    endDate,
    searchTerm,
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load outgoing documents from Supabase storage instead of localStorage
      const { data: savedOutgoingDocuments, error } = await loadFromStorage<
        OutgoingStockDocument[]
      >("inventory-data/outgoing-documents.json", []);

      if (error) {
        console.error("Error loading outgoing documents:", error);
        setOutgoingDocuments([]);
      } else {
        setOutgoingDocuments(savedOutgoingDocuments || []);
      }

      // Extract unique products and recipients
      const uniqueProducts = new Set<string>();
      const uniqueRecipients = new Set<string>();

      savedOutgoingDocuments?.forEach((doc) => {
        uniqueRecipients.add(doc.recipient);
        doc.items.forEach((item) => {
          // Use the product name or extract from SKU if name is not available
          const productName = item.name || item.sku.split("-")[0];
          uniqueProducts.add(productName);
        });
      });

      setProducts(Array.from(uniqueProducts).sort());
      setRecipients(Array.from(uniqueRecipients).sort());
    } catch (error) {
      console.error("Error loading shipping analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregate shipment data based on filters
  const aggregateShipmentData = () => {
    if (outgoingDocuments.length === 0) {
      setShipmentData([]);
      return;
    }

    // Filter documents by date range
    const filteredByDate = outgoingDocuments.filter((doc) => {
      const docDate = new Date(doc.date);
      return isWithinInterval(docDate, { start: startDate, end: endDate });
    });

    // Create a map to aggregate data
    const aggregatedData: Record<string, ProductShipmentData> = {};

    filteredByDate.forEach((doc) => {
      // Skip if recipient filter is set and doesn't match
      if (recipientFilter && doc.recipient !== recipientFilter) {
        return;
      }

      doc.items.forEach((item) => {
        // Extract product name from item
        const productName = item.name || item.sku.split("-")[0];

        // Skip if product filter is set and doesn't match
        if (productFilter && productName !== productFilter) {
          return;
        }

        // Create a unique key for each product-recipient combination
        const key = `${doc.recipient}|${productName}|${item.sku}`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            recipient: doc.recipient,
            recipientId: doc.recipientId,
            product: productName,
            sku: item.sku,
            totalPairs: 0,
            shipmentCount: 0,
            lastShipmentDate: doc.date,
            documents: [],
          };
        }

        // Add the quantity to the total
        aggregatedData[key].totalPairs += item.quantity;

        // Track unique shipments by document ID
        if (!aggregatedData[key].documents.includes(doc.id)) {
          aggregatedData[key].documents.push(doc.id);
          aggregatedData[key].shipmentCount += 1;
        }

        // Update last shipment date if this document is newer
        const currentLastDate = new Date(aggregatedData[key].lastShipmentDate);
        const docDate = new Date(doc.date);
        if (docDate > currentLastDate) {
          aggregatedData[key].lastShipmentDate = doc.date;
        }
      });
    });

    // Apply search filter
    let result = Object.values(aggregatedData);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.recipient.toLowerCase().includes(searchLower) ||
          item.product.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower),
      );
    }

    // Sort by recipient and then by product
    result.sort((a, b) => {
      if (a.recipient !== b.recipient) {
        return a.recipient.localeCompare(b.recipient);
      }
      return a.product.localeCompare(b.product);
    });

    setShipmentData(result);
  };

  // Get badge color based on quantity
  const getBadgeColor = (quantity: number) => {
    if (quantity > 30) return "bg-green-100 text-green-800";
    if (quantity > 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return {
    isLoading,
    products,
    recipients,
    shipmentData,
    loadData,
    getBadgeColor,
  };
};
