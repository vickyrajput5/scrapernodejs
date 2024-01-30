const puppeteer = require('puppeteer');
const xl = require('excel4node');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });

  // Read product links from Excel file
  const links = readProductLinksFromExcel('D:/Node js Scraper/currencyEx/ABFStoreProducts_502_again.xlsx');
  const scrapedData = [];

  async function scrapeProductData(link) {
    const page = await browser.newPage();

    try {
      console.log(`Scraping data from ${link}`);
      await page.goto(link);

      const uls = await page.$$('section.md-col-6 ul');

      let result = {};

      for (const ul of uls) {
        const lis = await ul.$$('li');

        for (const li of lis) {
          const label = await li.$('span:nth-child(1)');
          const value = await li.$('span:nth-child(2)');

          if (label && value) {
            const labelText = await page.evaluate(el => el.textContent.trim(), label);
            const valueText = await page.evaluate(el => el.textContent.trim(), value);

            if (!result[labelText]) {
              result[labelText] = valueText;
            }
          }
        }
      }

      scrapedData.push(result);
    } catch (error) {
      console.error(`Error scraping data from ${link}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  const scrapePromises = links.map(link => scrapeProductData(link));
  await Promise.all(scrapePromises);

  await browser.close();

  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Scraped Products Data');

  // Add headers dynamically based on the first product's data
  if (scrapedData.length > 0) {
    const headers = Object.keys(scrapedData[0]);
    headers.forEach((header, columnIndex) => {
      ws.cell(1, columnIndex + 1).string(header);
    });

    // Fill the data into the sheet
    scrapedData.forEach((product, rowIndex) => {
      headers.forEach((header, columnIndex) => {
        ws.cell(rowIndex + 2, columnIndex + 1).string(product[header] || '');
      });
    });

    // Save the workbook
    const fileName = `D:/Node js Scraper/currencyEx/ABFStoreProducts_502_again.xlsx`;
    wb.write(fileName);

    console.log(`Data saved to ${fileName}`);
  } else {
    console.log('No data scraped.');
  }
})();

function readProductLinksFromExcel(filePath) {
  const workbook = new xl.Workbook();
  const worksheet = workbook.read(filePath);

  const links = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const header = row.getCell(1).value;
    if (header && header === 'Product URL') {
      const link = row.getCell(3).value;
      if (link && typeof link === 'string') {
        links.push(link);
      }
    }
  });

  return links;
}
