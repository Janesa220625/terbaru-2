import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import { format } from "date-fns";

interface ShipmentItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
}

interface Shipment {
  id: string;
  documentNumber: string;
  date: string;
  time?: string;
  recipient: string;
  notes: string;
  items: ShipmentItem[];
  totalItems: number;
}

interface GroupedShipment {
  recipient: string;
  totalShipments: number;
  totalPairs: number;
  shipments: Shipment[];
}

interface ProductSummary {
  sku: string;
  name: string;
  totalPairs: number;
}

interface RecipientProductSummary {
  [recipient: string]: {
    [productKey: string]: ProductSummary;
  };
}

/**
 * Generates and downloads an Excel report of detailed shipping data
 * @param groupedShipments The grouped shipment data to include in the report
 * @param productSummaries Product summaries by recipient
 * @param dateRange Optional date range for the report title
 */
export function exportDetailedShippingReport(
  groupedShipments: GroupedShipment[],
  productSummaries: RecipientProductSummary,
  dateRange?: { startDate?: string; endDate?: string },
) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add a summary sheet
  const summaryData = [
    ["Detailed Shipping Report"],
    [
      dateRange?.startDate || dateRange?.endDate
        ? `Date Range: ${dateRange?.startDate ? format(new Date(dateRange.startDate), "MMM d, yyyy") : ""} ${dateRange?.startDate && dateRange?.endDate ? "to" : ""} ${dateRange?.endDate ? format(new Date(dateRange.endDate), "MMM d, yyyy") : ""}`
        : `Generated on: ${format(new Date(), "MMM d, yyyy")}`,
    ],
    [""],
    ["Recipient", "Total Shipments", "Total Pairs"],
  ];

  // Add summary data for each recipient
  let totalShipments = 0;
  let totalPairs = 0;

  groupedShipments.forEach((group) => {
    summaryData.push([
      group.recipient,
      group.totalShipments.toString(),
      group.totalPairs.toString(),
    ]);
    totalShipments += group.totalShipments;
    totalPairs += group.totalPairs;
  });

  // Add totals row
  summaryData.push(
    [""],
    ["TOTAL", totalShipments.toString(), totalPairs.toString()],
  );

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Merge cells for the report title and date range
  if (!wsSummary["!merges"]) wsSummary["!merges"] = [];
  wsSummary["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
  wsSummary["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });

  // Add styling
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };

  // Style the header row
  for (let i = 0; i < 4; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 3, c: i });
    if (!wsSummary[cellRef]) wsSummary[cellRef] = {};
    wsSummary[cellRef].s = headerStyle;
  }

  // Set column widths
  wsSummary["!cols"] = [
    { wch: 30 }, // Recipient
    { wch: 15 }, // Total Shipments
    { wch: 15 }, // Total Pairs
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Create detailed sheets for each recipient
  groupedShipments.forEach((group) => {
    // Create product summary data
    const productSummaryData = [
      [`${group.recipient} - Product Summary`],
      [""],
      ["SKU", "Product", "Total Pairs"],
    ];

    if (productSummaries[group.recipient]) {
      Object.values(productSummaries[group.recipient]).forEach((product) => {
        productSummaryData.push([
          product.sku,
          product.name,
          product.totalPairs.toString(),
        ]);
      });
    }

    const wsProductSummary = XLSX.utils.aoa_to_sheet(productSummaryData);

    // Merge cells for the title
    if (!wsProductSummary["!merges"]) wsProductSummary["!merges"] = [];
    wsProductSummary["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

    // Style the header row
    for (let i = 0; i < 3; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
      if (!wsProductSummary[cellRef]) wsProductSummary[cellRef] = {};
      wsProductSummary[cellRef].s = headerStyle;
    }

    // Set column widths
    wsProductSummary["!cols"] = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Product
      { wch: 15 }, // Total Pairs
    ];

    // Create shipment details data
    const shipmentDetailsData = [
      [""],
      [""],
      [`${group.recipient} - Shipment Details`],
      [""],
    ];

    // Add each shipment
    group.shipments.forEach((shipment, index) => {
      // Add shipment header
      shipmentDetailsData.push(
        [`Shipment #${shipment.documentNumber}`],
        [
          `Date: ${new Date(shipment.date).toLocaleDateString()}${shipment.time ? ` Time: ${shipment.time}` : ""}`,
        ],
        ["SKU", "Product", "Size", "Color", "Quantity"],
      );

      // Add shipment items
      shipment.items.forEach((item) => {
        shipmentDetailsData.push([
          item.sku,
          item.name,
          item.size,
          item.color,
          item.quantity.toString(),
        ]);
      });

      // Add a blank row between shipments
      if (index < group.shipments.length - 1) {
        shipmentDetailsData.push([""]);
      }
    });

    // Append the shipment details to the product summary
    for (let i = 0; i < shipmentDetailsData.length; i++) {
      const row = shipmentDetailsData[i];
      XLSX.utils.sheet_add_aoa(wsProductSummary, [row], {
        origin: { r: productSummaryData.length + i, c: 0 },
      });
    }

    // Add the sheet to the workbook
    const safeRecipientName = group.recipient
      .replace(/[\[\]*?:/]/g, "_")
      .substring(0, 28);
    XLSX.utils.book_append_sheet(wb, wsProductSummary, safeRecipientName);
  });

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file with date in filename if date range is provided
  let filename = "detailed_shipping_report";
  if (dateRange?.startDate) {
    filename += `_from_${dateRange.startDate.replace(/-/g, "")}`;
  }
  if (dateRange?.endDate) {
    filename += `_to_${dateRange.endDate.replace(/-/g, "")}`;
  }
  filename += ".xlsx";

  FileSaver.saveAs(fileData, filename);
}

/**
 * Generates and downloads a dashboard summary report
 * @param dashboardData The dashboard data to include in the report
 */
export function exportDashboardSummary(dashboardData: {
  metrics: {
    totalBoxes: number;
    totalPairs: number;
    lowStockItems: number;
    categories: { name: string; count: number }[];
  };
  recentActivity: any[];
}) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add a summary sheet
  const summaryData = [
    ["Warehouse Dashboard Summary"],
    [`Generated on: ${format(new Date(), "MMM d, yyyy HH:mm")}`],
    [""],
    ["Key Metrics"],
    [""],
    ["Metric", "Value"],
    ["Total Boxes", dashboardData.metrics.totalBoxes.toString()],
    ["Total Pairs", dashboardData.metrics.totalPairs.toString()],
    ["Low Stock Items", dashboardData.metrics.lowStockItems.toString()],
    [""],
    ["Category Distribution"],
    [""],
    ["Category", "Count"],
  ];

  // Add category data
  dashboardData.metrics.categories.forEach((category) => {
    summaryData.push([category.name, category.count.toString()]);
  });

  // Add recent activity
  summaryData.push(
    [""],
    ["Recent Activity"],
    [""],
    ["Type", "Date", "Details"],
  );

  dashboardData.recentActivity.forEach((activity) => {
    summaryData.push([
      activity.type,
      new Date(activity.rawDate).toLocaleString(),
      activity.details,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Merge cells for the report title and date
  if (!wsSummary["!merges"]) wsSummary["!merges"] = [];
  wsSummary["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
  wsSummary["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
  wsSummary["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
  wsSummary["!merges"].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 1 } });
  wsSummary["!merges"].push({
    s: {
      r: summaryData.length - dashboardData.recentActivity.length - 3,
      c: 0,
    },
    e: {
      r: summaryData.length - dashboardData.recentActivity.length - 3,
      c: 2,
    },
  });

  // Add styling
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };

  // Style the header rows
  const headerRows = [
    0,
    3,
    5,
    10,
    12,
    summaryData.length - dashboardData.recentActivity.length - 3,
    summaryData.length - dashboardData.recentActivity.length - 1,
  ];
  headerRows.forEach((row) => {
    for (let i = 0; i < 3; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: i });
      if (!wsSummary[cellRef]) wsSummary[cellRef] = {};
      wsSummary[cellRef].s = headerStyle;
    }
  });

  // Set column widths
  wsSummary["!cols"] = [
    { wch: 20 }, // Metric/Category/Type
    { wch: 25 }, // Value/Count/Date
    { wch: 50 }, // Details
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Dashboard Summary");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  const filename = `warehouse_dashboard_summary_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;
  FileSaver.saveAs(fileData, filename);
}
