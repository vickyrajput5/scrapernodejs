const puppeteer = require("puppeteer");
const xl = require('excel4node');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  const totalPages = 1; // You can adjust the number of pages you want to scrape
  const productsPerPage = 10;
  const totalProductsToScrape = totalPages * productsPerPage; // Change this to the total number of products you want

  const allProducts = [];


  async function scrapeProductDetails(productHandle) {
    const titleElement = await productHandle.$("div > a.product-labeled");
    const descriptionElement = await productHandle.$("p");
    const stockElement = await productHandle.$('div > a.product-desc');
    const imgElement = await productHandle.$("div > a.searchproduct-imglink > img");

    if (titleElement && descriptionElement && stockElement && imgElement) {
      const title = await page.evaluate(el => el.textContent.trim(), titleElement);
      const description = await page.evaluate(el => el.textContent.trim(), descriptionElement);
      const stock = await page.evaluate(el => el.textContent.trim(), stockElement);
      const imgSrc = await page.evaluate(el => el.src, imgElement);
      const productPageLink = await productHandle.$eval('a:nth-child(1)', link => link.href);

      return { title, description, stock, url: productPageLink, imgSrc };
    }

    return null;
  }

  for (let i = 1; allProducts.length < totalProductsToScrape && i <= totalProductsToScrape; i++) {
    try {
      console.log(`Navigating to page ${i}`);
      await page.goto(`https://www.abf.store/s/en/2/Bearings?p=${i}`);

      const productsHandles = await page.$$("ul>li");

      const productPromises = productsHandles.map(scrapeProductDetails);
      const productsData = await Promise.all(productPromises);

      // Filter out null values (failed to scrape)
      const validProducts = productsData.filter(product => product !== null);

      allProducts.push(...validProducts);

      if (allProducts.length >= totalProductsToScrape) {
        break; // Stop scraping if the required number of products is reached
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

  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.title);
    ws.cell(row, 2).string(product.description);
    ws.cell(row, 3).string(product.url);
    ws.cell(row, 4).string(product.imgSrc);
    ws.cell(row, 5).string(product.stock);

    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_502_again.xlsx`;
  wb.write(fileName);

  console.log(`Data saved to ${fileName}`);
})();
