const puppeteer = require("puppeteer");
const xl = require('excel4node');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  const totalPages = 50; // You can adjust the number of pages you want to scrape
  const productsPerPage = 10;
  const totalProductsToScrape = totalPages * productsPerPage; // Change this to the total number of products you want

  const allProducts = [];

  for (let i = 1; allProducts.length < totalProductsToScrape && i <= totalProductsToScrape; i++) {
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
              const sections = document.querySelectorAll('section.md-col-6');

              let result = {};

              sections.forEach(section => {
                const headingElement = section.querySelector('h3');
                if (headingElement) {
                  const heading = headingElement.textContent.trim();
                  const uls = section.querySelectorAll('ul.list-reset.m0');

                  uls.forEach((ul, index) => {
                    const lis = ul.querySelectorAll('li');

                    lis.forEach(li => {
                      const labelElement = li.querySelector('span:nth-child(1)');
                      const valueElement = li.querySelector('span:nth-child(2)');

                      if (labelElement && valueElement) {
                        const label = labelElement.textContent.trim();
                        const value = valueElement.textContent.trim();

                        if (!result[heading]) {
                          result[heading] = {};
                        }
                        if (!result[heading][`UL ${index + 1}`]) {
                          result[heading][`UL ${index + 1}`] = {};
                        }

                        result[heading][`UL ${index + 1}`][label] = value;
                      }
                    });
                  });
                }
              });

              return result;
            });

            // Push all data to the array
            allProducts.push({ url: productPageLink, title, description, stock, ...details });

            console.log(`Title: ${title}`);
            console.log(`Description: ${description}`);
            console.log(`Stock: ${stock}`);
            console.log(`Brand: ${details['Specifications']['UL 1']['Brand'] || ''}`);
            console.log();

            if (allProducts.length >= totalProductsToScrape) {
              break; // Stop scraping if the required number of products is reached
            }
          }
        } catch (error) {
          // Handle errors
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
  ws.cell(1, 1).string('URL').style(headerStyle);
  ws.cell(1, 2).string('Title').style(headerStyle);
  ws.cell(1, 3).string('Description').style(headerStyle);
  ws.cell(1, 4).string('Stock').style(headerStyle);

  // Fill the data into the sheet
  let row = 2;
  allProducts.forEach((product) => {
    ws.cell(row, 1).string(product.url);
    ws.cell(row, 2).string(product.title);
    ws.cell(row, 3).string(product.description);
    ws.cell(row, 4).string(product.stock);

    // Add details dynamically
    let col = 5;
    for (const section in product) {
      if (section !== 'url' && section !== 'title' && section !== 'description' && section !== 'stock') {
        for (const ul in product[section]) {
          for (const li in product[section][ul]) {
            ws.cell(1, col).string(`${section} - ${ul} - ${li}`).style(headerStyle);
            ws.cell(row, col).string(product[section][ul][li]);
            col++;
          }
        }
      }
    }

    row++;
  });

  // Save the workbook
  const fileName = `ABFStoreProducts_500.xlsx`;
  wb.write(fileName);

  console.log(`Data saved to ${fileName}`);
})();
