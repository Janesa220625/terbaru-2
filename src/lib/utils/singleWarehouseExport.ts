import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import { AggregatedStockItem } from "@/components/Inventory/SingleWarehouseStock";

/**
 * Exports Single Warehouse Stock data to Excel
 * @param stockItems Array of aggregated stock items to export
 */
export function exportSingleWarehouseStock(stockItems: AggregatedStockItem[]) {
  // Create worksheet with headers
  const headers = [
    "SKU",
    "Product Name",
    "Color",
    "Size",
    "Total Pairs",
    "Category",
  ];

  // Format the data for Excel
  const data = stockItems.map((item) => [
    item.sku,
    item.name,
    item.color,
    item.size,
    item.totalPairs,
    item.category,
  ]);

  // Add headers to the beginning of the data array
  const worksheetData = [headers, ...data];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Add styling to the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E6E6E6" } },
    alignment: { horizontal: "center" },
  };

  // Apply header styling
  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = headerStyle;
  }

  // Set column widths
  const wscols = [
    { wch: 20 }, // SKU
    { wch: 30 }, // Product Name
    { wch: 15 }, // Color
    { wch: 10 }, // Size
    { wch: 12 }, // Total Pairs
    { wch: 20 }, // Category
  ];
  ws["!cols"] = wscols;

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Warehouse Stock");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  FileSaver.saveAs(fileData, "warehouse_stock_export.xlsx");
}
