const puppeteer = require("puppeteer");
const xl = require('excel4node');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  const totalPages = 5; // You can adjust the number of pages you want to scrape

  const allProducts = [];

  for (let i = 1; i <= totalPages; i++) {
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

            // Push data to the array
            allProducts.push({ title, description, stock });

            console.log(`Title: ${title}`);
            console.log(`Description: ${description}`);
            console.log(`Stock: ${stock}`);
            console.log();
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

  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.description);
    ws.cell(row, 3).string(product.stock);
    row++;
  });

  // Save the workbook
  wb.write('ABFStoreProducts.xlsx');
})();
