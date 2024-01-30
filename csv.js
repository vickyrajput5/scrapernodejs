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
  const totalProductsToScrape = totalPages * productsPerPage; // Change this to the total number of products you want

  const allProducts = [];

  for (let i = 1; i <= totalProductsToScrape ; i++) {
    try {
      await page.goto(`https://www.abf.store/s/en/2/Bearings?p=${i}`);

      const productsHandles = await page.$$("ul>li>div");

      for (const productHandle of productsHandles) {
        try {
          const titleElement = await productHandle.$("a:nth-child(1)");
          const descriptionElement = await productHandle.$("p");

          if (titleElement && descriptionElement && stockElement) {
            const title = await page.evaluate(el => el.textContent.trim(), titleElement);
            const description = await page.evaluate(el => el.textContent.trim(), descriptionElement);

            // Navigate to the product page
            const productPageLink = await productHandle.$eval('a:nth-child(1)', link => link.href);
            await page.goto(productPageLink);

            // Fetch more details from the product page
            const details = await page.evaluate(() => {
              // Customize this part to extract the specific details you need from the product page
              const stock = document.querySelector('div.product-specifications section:nth-child(1) ul li:nth-child(1) span:nth-child(2)').textContent.trim();
              const brand = document.querySelector('div.product-specifications section:nth-child(1) ul li:nth-child(2) span:nth-child(2)').textContent.trim();
              const cate = document.querySelector('div.product-specifications section:nth-child(1) ul li:nth-child(4) span:nth-child(2)').textContent.trim();
              return { brand, cate, stock };
            });

            // Push all data to the array
            allProducts.push({ title, description, ...details });

            console.log(`Title: ${title}`);
            console.log(`Description: ${description}`);
            console.log(`Stock: ${stock}`);
            console.log(`Brand: ${details.brand}`);
            console.log(`Category: ${details.cate}`);
            console.log();

            if (allProducts.length >= totalProductsToScrape) {
              break; // Stop scraping if the required number of products is reached
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
  ws.cell(1, 3).string('Stock').style(headerStyle);
  ws.cell(1, 4).string('Brand').style(headerStyle);
  ws.cell(1, 5).string('Category').style(headerStyle);

  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.description);
    ws.cell(row, 3).string(product.stock);
    ws.cell(row, 4).string(product.brand); // Corrected to product.brand
    ws.cell(row, 5).string(product.cate); // Corrected to product.cate
    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_5.xlsx`;
   wb.write(fileName);

   console.log(`Data saved to ${fileName}`);
})();
