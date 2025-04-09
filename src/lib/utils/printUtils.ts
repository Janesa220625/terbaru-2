// Define the interface locally to avoid import issues
interface OutgoingStockDocument {
  documentNumber: string;
  date: string;
  recipient: string;
  notes?: string;
  items: Array<{
    sku: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
  }>;
}

/**
 * Generates a printable HTML document for an outgoing stock document
 * @param document The outgoing stock document to print
 */
export const printOutgoingStockDocument = (
  document: OutgoingStockDocument,
): void => {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this website to print documents");
    return;
  }

  // Format the date
  const formattedDate = new Date(document.date).toLocaleDateString();

  // Calculate total items
  const totalItems = document.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Outgoing Stock Document #${document.documentNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .document-subtitle {
          font-size: 14px;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-group {
          margin-bottom: 15px;
        }
        .info-label {
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }
        .info-value {
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 10px;
          font-size: 12px;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
          font-size: 12px;
        }
        .total-row {
          font-weight: bold;
          background-color: #f2f2f2;
        }
        .notes-section {
          margin-top: 30px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 5px;
          text-align: center;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="document-title">Proof of Goods Release</div>
        <div class="document-subtitle">Document #${document.documentNumber}</div>
      </div>
      
      <div class="info-section">
        <div>
          <div class="info-group">
            <div class="info-label">Date</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Recipient</div>
            <div class="info-value">${document.recipient}</div>
          </div>
        </div>
        <div>
          <div class="info-group">
            <div class="info-label">Document Number</div>
            <div class="info-value">${document.documentNumber}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Total Items</div>
            <div class="info-value">${totalItems} pairs</div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Size</th>
            <th>Color</th>
            <th style="text-align: right;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${document.items
            .map(
              (item) => `
            <tr>
              <td>${item.sku}</td>
              <td>${item.name}</td>
              <td>${item.size}</td>
              <td>${item.color}</td>
              <td style="text-align: right;">${item.quantity} pairs</td>
            </tr>
          `,
            )
            .join("")}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td style="text-align: right;">${totalItems} pairs</td>
          </tr>
        </tbody>
      </table>
      
      ${
        document.notes
          ? `
        <div class="notes-section">
          <div class="info-label">Notes</div>
          <div>${document.notes}</div>
        </div>
      `
          : ""
      }
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">Issued By</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">Received By</div>
        </div>
      </div>
      
      <button onclick="window.print(); setTimeout(() => window.close(), 500)" style="margin-top: 20px; padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">
        Print Document
      </button>
    </body>
    </html>
  `;

  // Write the HTML content to the new window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Focus the window for printing
  printWindow.focus();
};
