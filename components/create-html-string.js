export function htmlString(selectedItems, calculateCost) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Grocery List</title>
      <h1><b>Groceries</b> for ${new Date()
        .toJSON()
        .slice(0, 10)
        .replace(/-/g, "/")}</h1>
      <style>
      @page { margin: 20px; } 
          h1 {
              text-align: center;
              font-family: Avenir;
              font-weight: normal;
          }
          h3 {
            text-align: center;
            font-family: Avenir-Light;
            font-weight: normal;
          }
          h4 {
            text-align: center;
            font-family: Avenir-Light;
            font-weight: normal;
          }
          #products {
            font-family: "Avenir-Light", Avenir-Light, Avenir-Light, sans-serif;
            border-collapse: collapse;
            font-size: 12px;
            font-weight: normal;
            width: 100%;
            align-items: center;
          }
          
          #products td, #products th {
            border: 1px solid #ddd;
            padding: 8px;
            
          }
          
          #products tr:nth-child(even){background-color: white;}
          
          #products th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: center;
            background-color: #e52d27;
            color: white;
          }
  
          #tableContainer {
            width: 100% ;
            margin-left: auto ;
            margin-right: auto ;
          }
      </style>
     
  </head>
  <body>
  <div id="tableContainer">
  <table id="products">
    <tr>
      <th>Category</th>
      <th>Name</th>
      <th>Price</th>
      <th>Qty.</th>
    </tr>
    ${generateRows(selectedItems)}
  </table>
  </div>
  <h3>Approximate Cost: \$${Math.round(calculateCost() * 100) / 100} +
  \$${Math.round(calculateCost() * 0.13 * 100) / 100} HST</h3>
  </body>
  </html>
  `;
}

// Generate the HTML for table rows in the PDF
function generateRows(selectedItems) {
  let htmlRows = "";
  selectedItems.forEach((item) => {
    htmlRows += `
      <tr>
        <td>${item.category}</td>
        <td>${item.name}</td>
        <td>\$${item.price.toString()}</td>
        <td>${item.quantity.toString()}</td>
      </tr>
      `;
  });
  return htmlRows;
}
