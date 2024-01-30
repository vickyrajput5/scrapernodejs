const puppeteer = require("puppeteer");
const xl = require('excel4node');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  const totalPages = 2; // You can adjust the number of pages you want to scrape
  const productsPerPage = 10;
  const totalProductsToScrape = totalPages * productsPerPage;

  const allProducts = [];

  for (let i = 1; i <= totalProductsToScrape ; i++) {
    try {
      await page.goto(`https://www.abf.store/s/en/2/Bearings?p=${i}`);

      const productsHandles = await page.$$("ul>li>div");

      for (const productHandle of productsHandles) {
        try {
          const titleElement = await productHandle.$("a:nth-child(1)");
          const descriptionElement = await productHandle.$("p");
          const stockElement = await productHandle.$('a:nth-child(3)');

          if (titleElement && descriptionElement && stockElement) {
            const title = await page.evaluate(el => el.textContent.trim(), titleElement);
            const description = await page.evaluate(el => el.textContent.trim(), descriptionElement);
            const stock = await page.evaluate(el => el.textContent.trim(), stockElement);

            // Navigate to the product page
            const productPageLink = await productHandle.$eval('a:nth-child(1)', link => link.href);
            await page.goto(productPageLink);

           // Fetch more details from the product page
           const details = await page.evaluate(() => {
            const uls = document.querySelectorAll('section.md-col-6 ul');

            let result = {};

            uls.forEach(ul => {
              const lis = ul.querySelectorAll('li');

              lis.forEach(li => {
                const label = li.querySelector('span:nth-child(1)');
                const value = li.querySelector('span:nth-child(2)');

                if (label && value) {
                  const labelText = label.textContent.trim();
                  const valueText = value.textContent.trim();

                  if (!result[labelText]) {
                    result[labelText] = valueText;
                  }
                }
              });
            });

            return result;
          });

          // Push all data to the array
          allProducts.push({ title, description, stock, ...details });

          console.log(`Title: ${title}`);
          console.log(`Description: ${description}`);
          console.log(`Stock: ${stock}`);
          console.log(`Brand: ${details['Brand'] || ''}`);
          console.log(`Item Number: ${details['Item Number'] || ''}`);
          console.log(`EAN: ${details['EAN'] || ''}`);
          console.log(`Category: ${details['Category'] || ''}`);
          console.log(`Inner (d) MM: ${details['Inner (d) MM'] || ''}`);
          console.log(`Outer (D) MM: ${details['Outer (D) MM'] || ''}`);
          console.log(`Width (B) MM: ${details['Width (B) MM'] || ''}`);
          console.log(`Inner (d) Inch: ${details['Inner (d) Inch'] || ''}`);
          console.log(`Outer (D) Inch: ${details['Outer (D) Inch'] || ''}`);
          console.log(`Width (B) Inch: ${details['Width (B) Inch'] || ''}`);
          console.log(`Weight (kg): ${details['Weight (kg)'] || ''}`);
          console.log(`Bore: ${details['Bore'] || ''}`);
          console.log(`Lubrication Enhancement: ${details['Lubrication Enhancement'] || ''}`);
          console.log(`Seal: ${details['Seal'] || ''}`);
          console.log(`Cage Type: ${details['Cage Type'] || ''}`);
          console.log(`Radial Internal Play: ${details['Radial Internal Play'] || ''}`);
          console.log(`Precision: ${details['Precision'] || ''}`);
          console.log(`Heat Stabilization: ${details['Heat Stabilization'] || ''}`);
          console.log(`Vibrating Screen Execution: ${details['Vibrating Screen Execution'] || ''}`);
          console.log(`MB: ${details['MB'] || ''}`);
          console.log(`W33: ${details['W33'] || ''}`);


          console.log();


            // Save data to workbook periodically (e.g., every 20 products)
            if (allProducts.length % productsPerPage === 0) {
              await saveToWorkbook(allProducts);
            }
          }
        } catch (error) {
          // Do nothing or add custom logic if needed
        }
      }
    } catch (error) {
      console.error("Error navigating to page:", error.message);
    }
  }

  // Save the final data to the workbook
  await saveToWorkbook(allProducts);

  await browser.close();
})();

async function saveToWorkbook(data) {
  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('ABF Store Products');

  // Add styles for the header
  const headerStyle = wb.createStyle({
    font: {
      color: '#FF0800',
      size: 12,
      bold: true,
    }
  });

 
  // Set the headers with styles
  ws.cell(1, 1).string('Title').style(headerStyle);
  ws.cell(1, 2).string('Description').style(headerStyle);
  ws.cell(1, 3).string('Stock').style(headerStyle);
  ws.cell(1, 4).string('Brand').style(headerStyle);
  ws.cell(1, 5).string('Item Number').style(headerStyle);
  ws.cell(1, 6).string('EAN').style(headerStyle);
  ws.cell(1, 7).string('Category').style(headerStyle);
  ws.cell(1, 8).string('Inner (d) MM').style(headerStyle);
  ws.cell(1, 9).string('Outer (D) MM').style(headerStyle);
  ws.cell(1, 10).string('Width (B) MM').style(headerStyle);
  ws.cell(1, 11).string('Inner (d) Inch').style(headerStyle);
  ws.cell(1, 12).string('Outer (D) Inch').style(headerStyle);
  ws.cell(1, 13).string('Width (B) Inch').style(headerStyle);
  ws.cell(1, 14).string('Weight (kg)').style(headerStyle);
  ws.cell(1, 15).string('Bore').style(headerStyle);
  ws.cell(1, 16).string('Lubrication Enhancement').style(headerStyle);
  ws.cell(1, 17).string('Seal').style(headerStyle);
  ws.cell(1, 18).string('Cage Type').style(headerStyle);
  ws.cell(1, 19).string('Radial Internal Play').style(headerStyle);
  ws.cell(1, 20).string('Precision').style(headerStyle);
  ws.cell(1, 21).string('Heat Stabilization').style(headerStyle);
  ws.cell(1, 22).string('Vibrating Screen Execution').style(headerStyle);
  ws.cell(1, 23).string('MB').style(headerStyle);
  ws.cell(1, 24).string('W33').style(headerStyle);


  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.description);
    ws.cell(row, 3).string(product.stock);
    ws.cell(row, 4).string(product['Brand'] || '');
    ws.cell(row, 5).string(product['Item Number'] || '');
    ws.cell(row, 6).string(product['EAN'] || '');
    ws.cell(row, 7).string(product['Category'] || '');
    ws.cell(row, 8).string(product['Inner (d) MM'] || '');
    ws.cell(row, 9).string(product['Outer (D) MM'] || '');
    ws.cell(row, 10).string(product['Width (B) MM'] || '');
    ws.cell(row, 11).string(product['Inner (d) Inch'] || '');
    ws.cell(row, 12).string(product['Outer (D) Inch'] || '');
    ws.cell(row, 13).string(product['Width (B) Inch'] || '');
    ws.cell(row, 14).string(product['Weight (kg)'] || '');
    ws.cell(row, 15).string(product['Bore'] || '');
    ws.cell(row, 16).string(product['Lubrication Enhancement'] || '');
    ws.cell(row, 17).string(product['Seal'] || '');
    ws.cell(row, 18).string(product['Cage Type'] || '');
    ws.cell(row, 19).string(product['Radial Internal Play'] || '');
    ws.cell(row, 20).string(product['Precision'] || '');
    ws.cell(row, 21).string(product['Heat Stabilization'] || '');
    ws.cell(row, 22).string(product['Vibrating Screen Execution'] || '');
    ws.cell(row, 23).string(product['MB'] || '');
    ws.cell(row, 24).string(product['W33'] || '');
    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_${Date.now()}.xlsx`;
  wb.write(fileName);

  console.log(`Data saved to ${fileName}`);
}
