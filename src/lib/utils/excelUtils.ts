import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import { Product } from "@/lib/hooks/useProductData";
import { StockUnitItem } from "@/lib/hooks/useStockUnits";
import { ValidationItem } from "@/components/Inventory/ValidationDisplay";

/**
 * Parses an uploaded Excel template for stock units
 * @param file The uploaded Excel file
 * @returns Object containing valid and invalid stock units with validation details
 */
export async function parseExcelTemplate(file: File) {
  return new Promise<{
    validItems: ValidationItem[];
    invalidItems: ValidationItem[];
  }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to JSON, starting from row 4 (skipping headers and instructions)
        // Use header option to ensure proper column mapping regardless of case or spacing
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
          header: ["SKU", "Size", "Color", "Quantity"],
          blankrows: false,
        });

        // Map the data to our expected format and validate each row
        const validItems: ValidationItem[] = [];
        const invalidItems: ValidationItem[] = [];

        jsonData.forEach((row: any, index: number) => {
          // Handle both uppercase and lowercase column names for flexibility
          const sku = row.SKU || row.sku || "";
          const size = row.Size || row.size || "";
          const color = row.Color || row.color || "";
          const quantity = parseInt(row.Quantity || row.quantity) || 0;

          // Create a base item with the data we have
          const baseItem: ValidationItem = {
            sku,
            size,
            color,
            quantity,
            isValid: true,
          };

          // Validate the item
          if (!sku) {
            invalidItems.push({
              ...baseItem,
              isValid: false,
              reason: "Missing SKU",
            });
          } else if (!size) {
            invalidItems.push({
              ...baseItem,
              isValid: false,
              reason: "Missing size",
            });
          } else if (!color) {
            invalidItems.push({
              ...baseItem,
              isValid: false,
              reason: "Missing color",
            });
          } else if (quantity <= 0) {
            invalidItems.push({
              ...baseItem,
              isValid: false,
              reason: "Invalid quantity (must be greater than 0)",
            });
          } else {
            // All validations passed
            validItems.push({
              ...baseItem,
              isValid: true,
            });
          }
        });

        if (validItems.length === 0 && invalidItems.length === 0) {
          reject(new Error("No data found in the uploaded file."));
        } else {
          resolve({ validItems, invalidItems });
        }
      } catch (error) {
        reject(
          new Error("Failed to parse Excel file. Please check the format."),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses an uploaded Excel template for box stock
 * @param file The uploaded Excel file
 * @returns Object containing valid and invalid box stock items with validation details
 */
export async function parseBoxStockExcelTemplate(file: File) {
  return new Promise<{
    validItems: any[];
    invalidItems: any[];
  }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to JSON, starting from row 4 (skipping headers and instructions)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
          header: ["SKU", "Name", "Category", "BoxCount", "PairsPerBox"],
          blankrows: false,
        });

        // Map the data to our expected format and validate each row
        const validItems: any[] = [];
        const invalidItems: any[] = [];

        jsonData.forEach((row: any) => {
          // Handle both uppercase and lowercase column names for flexibility
          const sku = row.SKU || row.sku || "";
          const name = row.Name || row.name || "";
          const category = row.Category || row.category || "";
          const boxCount = parseInt(row.BoxCount || row.boxCount) || 0;
          const pairsPerBox = parseInt(row.PairsPerBox || row.pairsPerBox) || 0;

          // Create a base item with the data we have
          const baseItem = {
            sku,
            name,
            category,
            boxCount,
            pairsPerBox,
            totalPairs: boxCount * pairsPerBox,
            stockLevel:
              boxCount > 30 ? "high" : boxCount > 15 ? "medium" : "low",
          };

          // Validate the item
          if (!sku) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing SKU",
            });
          } else if (!name) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing product name",
            });
          } else if (boxCount <= 0) {
            invalidItems.push({
              ...baseItem,
              reason: "Invalid box count (must be greater than 0)",
            });
          } else if (pairsPerBox <= 0) {
            invalidItems.push({
              ...baseItem,
              reason: "Invalid pairs per box (must be greater than 0)",
            });
          } else {
            // All validations passed
            validItems.push(baseItem);
          }
        });

        if (validItems.length === 0 && invalidItems.length === 0) {
          reject(new Error("No data found in the uploaded file."));
        } else {
          resolve({ validItems, invalidItems });
        }
      } catch (error) {
        reject(
          new Error("Failed to parse Excel file. Please check the format."),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates and downloads an Excel template for stock units
 * @param products List of products to include in the reference sheet
 * @param existingStockUnits Optional existing stock units to include in the export
 */
export function generateStockUnitsExcelTemplate(
  products: Product[],
  existingStockUnits?: StockUnitItem[],
) {
  // Create template headers and sample data
  const templateData = [
    // Headers with instructions
    [
      "Instructions: Fill in the details for each stock unit. All fields are required.",
    ],
    [
      "IMPORTANT: Do not change the column headers (SKU, Size, Color, Quantity) or the template will not work correctly.",
    ],
    ["SKU", "Size", "Color", "Quantity"],
  ];

  // If we're exporting existing data, add it to the template
  if (existingStockUnits && existingStockUnits.length > 0) {
    existingStockUnits.forEach((unit) => {
      templateData.push([
        unit.sku,
        unit.size,
        unit.color,
        unit.quantity.toString(),
      ]);
    });
  } else {
    // Sample data rows if no existing data
    templateData.push(
      ["SKU-123-BLK", "40", "Black", "10"],
      ["SKU-456-RED", "37", "Red", "8"],
    );
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Merge cells for the instruction header
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });

  // Add styling to the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };
  for (let i = 0; i < 4; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = headerStyle;
  }

  // Add column widths
  const wscols = [
    { wch: 15 }, // SKU
    { wch: 10 }, // Size
    { wch: 12 }, // Color
    { wch: 10 }, // Quantity
  ];
  ws["!cols"] = wscols;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Units");

  // Add a second sheet with product reference data
  const productReferenceData = [
    ["Product Reference Sheet"],
    [""],
    ["SKU", "Available Sizes", "Available Colors"],
  ];

  // Add product reference data from the products state
  products.forEach((product) => {
    productReferenceData.push([product.sku, product.sizes, product.colors]);
  });

  const wsRef = XLSX.utils.aoa_to_sheet(productReferenceData);

  // Merge cells for the reference sheet header
  if (!wsRef["!merges"]) wsRef["!merges"] = [];
  wsRef["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

  // Add styling to the header row in reference sheet
  for (let i = 0; i < 3; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!wsRef[cellRef]) wsRef[cellRef] = {};
    wsRef[cellRef].s = headerStyle;
  }

  // Set column widths for reference sheet
  const wsRefCols = [
    { wch: 15 }, // SKU
    { wch: 25 }, // Available Sizes
    { wch: 25 }, // Available Colors
  ];
  wsRef["!cols"] = wsRefCols;

  XLSX.utils.book_append_sheet(wb, wsRef, "Product Reference");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  const filename = existingStockUnits
    ? "stock_units_export.xlsx"
    : "stock_units_template.xlsx";
  FileSaver.saveAs(fileData, filename);
}

/**
 * Generates and downloads an Excel template for box stock
 * @param products List of products to include in the reference sheet
 * @param existingBoxStock Optional existing box stock to include in the export
 */
export function generateBoxStockExcelTemplate(
  products: Product[],
  existingBoxStock?: any[],
) {
  // Create template headers and sample data
  const templateData = [
    // Headers with instructions
    [
      "Instructions: Fill in the details for each box stock item. All fields are required.",
    ],
    [
      "IMPORTANT: Do not change the column headers or the template will not work correctly.",
    ],
    ["SKU", "Name", "Category", "BoxCount", "PairsPerBox"],
  ];

  // If we're exporting existing data, add it to the template
  if (existingBoxStock && existingBoxStock.length > 0) {
    existingBoxStock.forEach((item) => {
      templateData.push([
        item.sku,
        item.name,
        item.category,
        item.boxCount.toString(),
        item.pairsPerBox.toString(),
      ]);
    });
  } else {
    // Sample data rows if no existing data
    templateData.push(
      ["SKU-123-BLK", "Men's Casual Shoes", "men_shoes", "30", "6"],
      ["SKU-456-RED", "Women's Heels", "women_shoes", "25", "8"],
    );
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Merge cells for the instruction header
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } });

  // Add styling to the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };
  for (let i = 0; i < 5; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = headerStyle;
  }

  // Add column widths
  const wscols = [
    { wch: 15 }, // SKU
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 10 }, // BoxCount
    { wch: 12 }, // PairsPerBox
  ];
  ws["!cols"] = wscols;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Box Stock");

  // Add a second sheet with category reference data
  const categoryReferenceData = [
    ["Category Reference Sheet"],
    [""],
    ["Category Code", "Category Name"],
    ["men_shoes", "Men's Shoes"],
    ["women_shoes", "Women's Shoes"],
    ["men_sandals", "Men's Sandals"],
    ["women_sandals", "Women's Sandals"],
    ["kids_shoes", "Kids' Shoes"],
    ["sports", "Sports Footwear"],
  ];

  const wsRef = XLSX.utils.aoa_to_sheet(categoryReferenceData);

  // Merge cells for the reference sheet header
  if (!wsRef["!merges"]) wsRef["!merges"] = [];
  wsRef["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

  // Add styling to the header row in reference sheet
  for (let i = 0; i < 2; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!wsRef[cellRef]) wsRef[cellRef] = {};
    wsRef[cellRef].s = headerStyle;
  }

  // Set column widths for reference sheet
  const wsRefCols = [
    { wch: 15 }, // Category Code
    { wch: 25 }, // Category Name
  ];
  wsRef["!cols"] = wsRefCols;

  XLSX.utils.book_append_sheet(wb, wsRef, "Category Reference");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  const filename = existingBoxStock
    ? "box_stock_export.xlsx"
    : "box_stock_template.xlsx";
  FileSaver.saveAs(fileData, filename);
}

/**
 * Generates and downloads a complete inventory export Excel file
 * @param products List of products
 * @param stockUnits List of stock units
 * @param boxStock List of box stock items
 */
export function generateInventoryExportExcel(
  products: Product[],
  stockUnits: StockUnitItem[],
  boxStock: any[],
) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create products sheet
  const productsData = [
    [
      "SKU",
      "Name",
      "Category",
      "Pairs Per Box",
      "Available Sizes",
      "Available Colors",
    ],
  ];

  products.forEach((product) => {
    productsData.push([
      product.sku,
      product.name,
      product.category,
      product.pairsPerBox.toString(),
      product.sizes,
      product.colors,
    ]);
  });

  const wsProducts = XLSX.utils.aoa_to_sheet(productsData);

  // Add styling to the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };

  for (let i = 0; i < 6; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!wsProducts[cellRef]) wsProducts[cellRef] = {};
    wsProducts[cellRef].s = headerStyle;
  }

  // Set column widths
  wsProducts["!cols"] = [
    { wch: 15 }, // SKU
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 15 }, // Pairs Per Box
    { wch: 25 }, // Available Sizes
    { wch: 25 }, // Available Colors
  ];

  XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

  // Create stock units sheet
  const stockUnitsData = [
    ["SKU", "Size", "Color", "Quantity", "Date Added", "Added By"],
  ];

  stockUnits.forEach((unit) => {
    stockUnitsData.push([
      unit.sku,
      unit.size,
      unit.color,
      unit.quantity.toString(),
      new Date(unit.dateAdded).toISOString().split("T")[0], // Format date as YYYY-MM-DD
      unit.addedBy || "System",
    ]);
  });

  const wsStockUnits = XLSX.utils.aoa_to_sheet(stockUnitsData);

  // Add styling to the header row
  for (let i = 0; i < 6; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!wsStockUnits[cellRef]) wsStockUnits[cellRef] = {};
    wsStockUnits[cellRef].s = headerStyle;
  }

  // Set column widths
  wsStockUnits["!cols"] = [
    { wch: 15 }, // SKU
    { wch: 10 }, // Size
    { wch: 12 }, // Color
    { wch: 10 }, // Quantity
    { wch: 15 }, // Date Added
    { wch: 15 }, // Added By
  ];

  XLSX.utils.book_append_sheet(wb, wsStockUnits, "Stock Units");

  // Create box stock sheet
  const boxStockData = [
    [
      "SKU",
      "Name",
      "Category",
      "Box Count",
      "Pairs Per Box",
      "Total Pairs",
      "Stock Level",
    ],
  ];

  boxStock.forEach((item) => {
    boxStockData.push([
      item.sku,
      item.name,
      item.category,
      item.boxCount.toString(),
      item.pairsPerBox.toString(),
      item.totalPairs.toString(),
      item.stockLevel,
    ]);
  });

  const wsBoxStock = XLSX.utils.aoa_to_sheet(boxStockData);

  // Add styling to the header row
  for (let i = 0; i < 7; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!wsBoxStock[cellRef]) wsBoxStock[cellRef] = {};
    wsBoxStock[cellRef].s = headerStyle;
  }

  // Set column widths
  wsBoxStock["!cols"] = [
    { wch: 15 }, // SKU
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 10 }, // Box Count
    { wch: 12 }, // Pairs Per Box
    { wch: 12 }, // Total Pairs
    { wch: 12 }, // Stock Level
  ];

  XLSX.utils.book_append_sheet(wb, wsBoxStock, "Box Stock");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  FileSaver.saveAs(fileData, "inventory_export.xlsx");
}

/**
 * Generates and downloads an Excel template for outgoing stock
 * @param availableStock List of available stock items
 * @param recipients List of recipients
 */
export function generateOutgoingStockExcelTemplate(
  availableStock: any[],
  recipients: any[],
) {
  // Create template headers and sample data
  const templateData = [
    // Headers with instructions
    [
      "Instructions: Fill in the details for each outgoing stock item. All fields are required except Notes.",
    ],
    [
      "IMPORTANT: Do not change the column headers or the template will not work correctly.",
    ],
    ["SKU", "Size", "Color", "Quantity", "Recipient", "Notes"],
  ];

  // Sample data rows
  templateData.push(
    ["SKU-123-BLK", "40", "Black", "5", "Retailer A", "Priority delivery"],
    ["SKU-456-RED", "37", "Red", "3", "Retailer B", ""],
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Merge cells for the instruction header
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });

  // Add styling to the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };
  for (let i = 0; i < 6; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = headerStyle;
  }

  // Add column widths
  const wscols = [
    { wch: 15 }, // SKU
    { wch: 10 }, // Size
    { wch: 12 }, // Color
    { wch: 10 }, // Quantity
    { wch: 20 }, // Recipient
    { wch: 25 }, // Notes
  ];
  ws["!cols"] = wscols;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Outgoing Stock");

  // Add a second sheet with stock reference data
  const stockReferenceData = [
    ["Available Stock Reference Sheet"],
    [""],
    ["SKU", "Size", "Color", "Available Quantity"],
  ];

  // Add stock reference data
  availableStock.forEach((item) => {
    stockReferenceData.push([
      item.sku,
      item.size,
      item.color,
      item.totalPairs.toString(),
    ]);
  });

  const wsStockRef = XLSX.utils.aoa_to_sheet(stockReferenceData);

  // Merge cells for the reference sheet header
  if (!wsStockRef["!merges"]) wsStockRef["!merges"] = [];
  wsStockRef["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

  // Add styling to the header row in reference sheet
  for (let i = 0; i < 4; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!wsStockRef[cellRef]) wsStockRef[cellRef] = {};
    wsStockRef[cellRef].s = headerStyle;
  }

  // Set column widths for reference sheet
  const wsStockRefCols = [
    { wch: 15 }, // SKU
    { wch: 10 }, // Size
    { wch: 12 }, // Color
    { wch: 15 }, // Available Quantity
  ];
  wsStockRef["!cols"] = wsStockRefCols;

  XLSX.utils.book_append_sheet(wb, wsStockRef, "Available Stock");

  // Add a third sheet with recipient reference data
  const recipientReferenceData = [
    ["Recipients Reference Sheet"],
    [""],
    ["Name", "Email", "Phone", "Address"],
  ];

  // Add recipient reference data
  recipients.forEach((recipient) => {
    recipientReferenceData.push([
      recipient.name,
      recipient.email || "",
      recipient.phone || "",
      recipient.address || "",
    ]);
  });

  const wsRecipientRef = XLSX.utils.aoa_to_sheet(recipientReferenceData);

  // Merge cells for the reference sheet header
  if (!wsRecipientRef["!merges"]) wsRecipientRef["!merges"] = [];
  wsRecipientRef["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

  // Add styling to the header row in reference sheet
  for (let i = 0; i < 4; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    if (!wsRecipientRef[cellRef]) wsRecipientRef[cellRef] = {};
    wsRecipientRef[cellRef].s = headerStyle;
  }

  // Set column widths for reference sheet
  const wsRecipientRefCols = [
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
  ];
  wsRecipientRef["!cols"] = wsRecipientRefCols;

  XLSX.utils.book_append_sheet(wb, wsRecipientRef, "Recipients");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save file
  FileSaver.saveAs(fileData, "outgoing_stock_template.xlsx");
}

/**
 * Parses an uploaded Excel template for outgoing stock
 * @param file The uploaded Excel file
 * @param availableStock List of available stock items for validation
 * @param recipients List of recipients for validation
 * @returns Object containing valid and invalid outgoing stock items with validation details
 */
export async function parseOutgoingStockExcelTemplate(
  file: File,
  availableStock: any[],
  recipients: any[],
) {
  return new Promise<{
    validItems: any[];
    invalidItems: any[];
  }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to JSON, starting from row 4 (skipping headers and instructions)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
          header: ["SKU", "Size", "Color", "Quantity", "Recipient", "Notes"],
          blankrows: false,
        });

        // Map the data to our expected format and validate each row
        const validItems: any[] = [];
        const invalidItems: any[] = [];

        jsonData.forEach((row: any) => {
          // Handle both uppercase and lowercase column names for flexibility
          const sku = row.SKU || row.sku || "";
          const size = row.Size || row.size || "";
          const color = row.Color || row.color || "";
          const quantity = parseInt(row.Quantity || row.quantity) || 0;
          const recipient = row.Recipient || row.recipient || "";
          const notes = row.Notes || row.notes || "";

          // Create a base item with the data we have
          const baseItem = {
            sku,
            size,
            color,
            quantity,
            recipient,
            notes,
          };

          // Validate the item
          if (!sku) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing SKU",
            });
          } else if (!size) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing size",
            });
          } else if (!color) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing color",
            });
          } else if (quantity <= 0) {
            invalidItems.push({
              ...baseItem,
              reason: "Invalid quantity (must be greater than 0)",
            });
          } else if (!recipient) {
            invalidItems.push({
              ...baseItem,
              reason: "Missing recipient",
            });
          } else {
            // Check if the stock item exists and has sufficient quantity
            const stockItem = availableStock.find(
              (item) =>
                item.sku.toLowerCase() === sku.toLowerCase() &&
                item.size === size &&
                item.color.toLowerCase() === color.toLowerCase(),
            );

            if (!stockItem) {
              invalidItems.push({
                ...baseItem,
                reason: "Stock item not found",
              });
            } else if (stockItem.totalPairs < quantity) {
              invalidItems.push({
                ...baseItem,
                reason: `Insufficient stock (available: ${stockItem.totalPairs})`,
              });
            } else {
              // Try to find a matching recipient
              const matchingRecipient = recipients.find(
                (r) => r.name.toLowerCase() === recipient.toLowerCase(),
              );

              // All validations passed
              validItems.push({
                ...baseItem,
                name: stockItem.name || sku,
                recipientId: matchingRecipient
                  ? matchingRecipient.id
                  : undefined,
              });
            }
          }
        });

        if (validItems.length === 0 && invalidItems.length === 0) {
          reject(new Error("No data found in the uploaded file."));
        } else {
          resolve({ validItems, invalidItems });
        }
      } catch (error) {
        reject(
          new Error("Failed to parse Excel file. Please check the format."),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsArrayBuffer(file);
  });
}
