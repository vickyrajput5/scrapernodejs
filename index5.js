const puppeteer = require("puppeteer");
const xl = require('excel4node');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
    timeout: 60000
  });
  const page = await browser.newPage();

  const totalPages = 1; // You can adjust the number of pages you want to scrape
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
          const stockElement = await productHandle.$('div > a.product-desc');
          const imgElement = await productHandle.$("div > a.searchproduct-imglink > img");

          if (titleElement && stockElement && imgElement) {
            const title = await page.evaluate(el => el.textContent.trim(), titleElement);
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
            allProducts.push({ title, stock, url: productPageLink , imgSrc, ...details });

            if (allProducts.length >= totalProductsToScrape) {
              break; // Stop scraping if the required number of products is reached
            }
          }
        } catch (error) {
          // console.error("Error processing product:", error.message);
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
  ws.cell(1, 2).string('Stock').style(headerStyle);
  ws.cell(1, 3).string('Product URL').style(headerStyle);
  ws.cell(1, 4).string('Image URL').style(headerStyle);
  ws.cell(1, 5).string('Product Description').style(headerStyle);
   
  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.stock);
    ws.cell(row, 3).string(product.url);
    ws.cell(row, 4).string(product.imgSrc);
    ws.cell(row, 5).string(product['Product Description']);

    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_10.xlsx`;
  wb.write(fileName);

  console.log(`Data saved to ${fileName}`);
})();
