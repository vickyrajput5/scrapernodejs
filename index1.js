const puppeteer = require("puppeteer");
const xl = require('excel4node');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
    timeout: 60000,
  });
  const page = await browser.newPage();

  const totalPages = 550; // You can adjust the number of pages you want to scrape
  const productsPerPage = 10;
  const totalProductsToScrape = totalPages * productsPerPage; // Change this to the total number of products you want

  const allProducts = [];

  for (let i = 1; allProducts.length < totalProductsToScrape && i <= totalProductsToScrape; i++) {
    try {
      console.log(`Navigating to page ${i}`);
      await page.goto(`https://www.abf.store/s/en/2/Bearings?p=${i}`);

      const productsHandles = await page.$$("ul>li");

      for (const productHandle of productsHandles) {
        try {
          const titleElement = await productHandle.$("div > a.product-labeled");
          const descriptionElement = await productHandle.$("p");
          const stockElement = await productHandle.$('div > a.product-desc');
          const imgElement = await productHandle.$("div > a.searchproduct-imglink > img");

          if (titleElement && descriptionElement && stockElement && imgElement) {
            const title = await page.evaluate(el => el.textContent.trim(), titleElement);
            const description = await page.evaluate(el => el.textContent.trim(), descriptionElement);
            const stock = await page.evaluate(el => el.textContent.trim(), stockElement);
            const imgSrc = await page.evaluate(el => el.src, imgElement);
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
              // Scrape all <p> tag data in the "Product description" section
              const productDescription = Array.from(document.querySelectorAll('section.md-col-6 p'))
              .map(p => p.textContent.trim())
              .join('\n');

              result['Product Description'] = productDescription;
              return result;
            });

            // Push all data to the array
            allProducts.push({ title, description,  stock, url: productPageLink , imgSrc, ...details });


            if (allProducts.length >= totalProductsToScrape) {
              break; // Stop scraping if the required number of products is reached
            }
          }
        } catch (error) {
        //   console.error("Error processing product:", error.message);
        }
      }
    } catch (error) {
      console.error("Error navigating to page:", error.message);
    }
  }

  await browser.close();

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
  ws.cell(1, 3).string('Product URL').style(headerStyle);
  ws.cell(1, 4).string('Image URL').style(headerStyle);
  ws.cell(1, 5).string('Stock').style(headerStyle);
  ws.cell(1, 6).string('Availability').style(headerStyle);
  ws.cell(1, 7).string('Product Description').style(headerStyle);
  ws.cell(1, 8).string('Brand').style(headerStyle);
  ws.cell(1, 9).string('Item Number').style(headerStyle);
  ws.cell(1, 10).string('Also known as').style(headerStyle);
  ws.cell(1, 11).string('EAN').style(headerStyle);
  ws.cell(1, 12).string('Category').style(headerStyle);
  ws.cell(1, 13).string('Inner (d) MM').style(headerStyle);
  ws.cell(1, 14).string('Outer (D) MM').style(headerStyle);
  ws.cell(1, 15).string('Width (B) MM').style(headerStyle);
  ws.cell(1, 16).string('Inner (d) Inch').style(headerStyle);
  ws.cell(1, 17).string('Outer (D) Inch').style(headerStyle);
  ws.cell(1, 18).string('Width (B) Inch').style(headerStyle);
  ws.cell(1, 19).string('Weight (kg)').style(headerStyle);
  ws.cell(1, 20).string('Bore').style(headerStyle);
  ws.cell(1, 21).string('Lubrication Enhancement').style(headerStyle);
  ws.cell(1, 22).string('Seal').style(headerStyle);
  ws.cell(1, 23).string('Cage Type').style(headerStyle);
  ws.cell(1, 24).string('Radial Internal Play').style(headerStyle);
  ws.cell(1, 25).string('Precision').style(headerStyle);
  ws.cell(1, 26).string('Contact Angle').style(headerStyle);
  ws.cell(1, 27).string('Pairing').style(headerStyle);
  ws.cell(1, 28).string('Axial Internal Clearance / Preload').style(headerStyle);
  ws.cell(1, 29).string('E').style(headerStyle);
  ws.cell(1, 30).string('Heat Stabilization').style(headerStyle);
  ws.cell(1, 31).string('Vibrating Screen Execution').style(headerStyle);
  ws.cell(1, 32).string('MB').style(headerStyle);
  ws.cell(1, 33).string('W33').style(headerStyle);
  ws.cell(1, 34).string('2RSD').style(headerStyle);
  ws.cell(1, 35).string('T').style(headerStyle);
  ws.cell(1, 36).string('P4S').style(headerStyle);
  ws.cell(1, 37).string('UL').style(headerStyle);
  ws.cell(1, 38).string('Medias description').style(headerStyle);
  ws.cell(1, 39).string('E1').style(headerStyle);
  ws.cell(1, 40).string('XL').style(headerStyle);
  ws.cell(1, 41).string('C3').style(headerStyle);
  ws.cell(1, 42).string('M').style(headerStyle);

  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.description);
    ws.cell(row, 3).string(product.url);
    ws.cell(row, 4).string(product.imgSrc);
    ws.cell(row, 5).string(product.stock);
    ws.cell(row, 6).string(product['Availability'] || '');
    ws.cell(row, 7).string(product['Product Description']);
    ws.cell(row, 8).string(product['Brand'] || '');
    ws.cell(row, 9).string(product['Item Number'] || '');
    ws.cell(row, 10).string(product['Also known as'] || '');
    ws.cell(row, 11).string(product['EAN'] || '');
    ws.cell(row, 12).string(product['Category'] || '');
    ws.cell(row, 13).string(product['Inner (d) MM'] || '');
    ws.cell(row, 14).string(product['Outer (D) MM'] || '');
    ws.cell(row, 15).string(product['Width (B) MM'] || '');
    ws.cell(row, 16).string(product['Inner (d) Inch'] || '');
    ws.cell(row, 17).string(product['Outer (D) Inch'] || '');
    ws.cell(row, 18).string(product['Width (B) Inch'] || '');
    ws.cell(row, 19).string(product['Weight (kg)'] || '');
    ws.cell(row, 20).string(product['Bore'] || '');
    ws.cell(row, 21).string(product['Lubrication Enhancement'] || '');
    ws.cell(row, 22).string(product['Seal'] || '');
    ws.cell(row, 23).string(product['Cage Type'] || '');
    ws.cell(row, 24).string(product['Radial Internal Play'] || '');
    ws.cell(row, 25).string(product['Precision'] || '');
    ws.cell(row, 26).string(product['Contact Angle'] || '');
    ws.cell(row, 27).string(product['Pairing'] || '');
    ws.cell(row, 28).string(product['Axial Internal Clearance / Preload'] || '');
    ws.cell(row, 29).string(product['E'] || '');
    ws.cell(row, 30).string(product['Heat Stabilization'] || '');
    ws.cell(row, 31).string(product['Vibrating Screen Execution'] || '');
    ws.cell(row, 32).string(product['MB'] || '');
    ws.cell(row, 33).string(product['W33'] || '');
    ws.cell(row, 34).string(product['2RSD'] || '');
    ws.cell(row, 35).string(product['T'] || '');
    ws.cell(row, 36).string(product['P4S'] || '');
    ws.cell(row, 37).string(product['UL'] || '');
    ws.cell(row, 38).string(product['Medias description'] || '');
    ws.cell(row, 39).string(product['E1'] || '');
    ws.cell(row, 40).string(product['XL'] || '');
    ws.cell(row, 41).string(product['C3'] || '');
    ws.cell(row, 42).string(product['M'] || '');

    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_5000.xlsx`;
  wb.write(fileName);

  console.log(`Data saved to ${fileName}`);
})();
