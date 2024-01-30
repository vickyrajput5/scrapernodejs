// const puppeteer = require("puppeteer");

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: false,
//     userDataDir: "./tmp",
//     timeout: 0, // Set to 0 to disable timeout
//   });
//   const page = await browser.newPage();

//   console.log("Navigating to the main page...");
//   await page.goto('https://www.abf.store/s/en/2/Bearings');
//   await page.waitfor
//   page.waitForSelector('a#LoginHref'),

//   // try {
//   //   // Navigate to the main page
//   //   console.log("Navigating to the main page...");
//   //   await page.goto('https://www.abf.store/s/en/2/Bearings');

//   //   // Wait for the page to load
//   //   console.log("Waiting for the page to load...");
//   //   await page.waitForTimeout(5000); // Replace this with a more specific wait condition

//   //   // Click on the login link
//   //   console.log("Clicking on #LoginHref");
//   //   await Promise.all([
//   //     page.waitForSelector('a#LoginHref'),
//   //     page.click('a#LoginHref'),
//   //     page.waitForNavigation({ timeout: 0 }), // Set to 0 to disable timeout
//   //   ]);
//   //   console.log("#LoginHref found and clicked successfully.");

//   //   // Add an explicit wait after the navigation
//   //   console.log("Waiting for the page navigation to complete...");
//   //   await page.waitForNavigation({ timeout: 0 });
//   //   console.log("Page navigation completed.");

//   //   // Switch to the modal frame
//   //   const modalFrame = page.frames().find(frame => frame.name() === 'login-overlay'); // Use the actual name or id of the frame
//   //   if (!modalFrame) {
//   //     throw new Error("Modal frame not found.");
//   //   }

//   //   // Additional wait to see if the login form appears
//   //   console.log("Waiting for the login form in the modal...");
//   //   await modalFrame.waitForSelector('#account-email', { timeout: 10000 }); // Adjust the timeout as needed
//   //   console.log("Login form in the modal is visible.");

//   //   // Continue with login process within the modal
//   //   console.log("Entering email and password");
//   //   await modalFrame.type('#account-email', 'syed.raza@delreypartners.com');
//   //   await modalFrame.type('#account-password', 'A1a2a3@502');
//   //   console.log("Email and password entered successfully.");

//   //   // Click on the login button within the modal
//   //   console.log("Clicking on #Login-Button in the modal");
//   //   await Promise.all([
//   //     modalFrame.waitForNavigation({ timeout: 0 }), // Set to 0 to disable timeout
//   //     modalFrame.click('#Login-Button'),
//   //     modalFrame.waitForNavigation({ timeout: 0 }), // Set to 0 to disable timeout
//   //   ]);
//   //   console.log("#Login-Button in the modal clicked successfully.");

//   //   // Rest of your scraping logic...

//   //   const totalPages = 1; // You can adjust the number of pages you want to scrape
//   //   const productsPerPage = 4;
//   //   const totalProductsToScrape = totalPages * productsPerPage; // Change this to the total number of products you want
//   //   const allProducts = [];

//   //   for (let i = 1; allProducts.length < totalProductsToScrape && i <= totalProductsToScrape; i++) {
//   //     try {
//   //       // Use the current page URL as the base URL for subsequent navigation
//   //       console.log(`Navigating to page ${i}`);
//   //       await page.goto(`https://www.abf.store/s/en/2/Bearings?p=${i}`, { timeout: 0 }); // Set to 0 to disable timeout

//   //       const productsHandles = await page.$$("ul>li");

//   //       for (const productHandle of productsHandles) {
//   //         try {
//   //           const titleElement = await productHandle.$("div > a.product-labeled");
//   //           const descriptionElement = await productHandle.$("p");
//   //           const stockElement = await productHandle.$('div.sm-stock-indicator > span');
//   //           const priceElement = await productHandle.$('div > span');
//   //           const imgElement = await productHandle.$("div > a.searchproduct-imglink > img");

//   //           if (titleElement && descriptionElement && stockElement && priceElement && imgElement) {
//   //             const title = await page.evaluate(el => el.textContent.trim(), titleElement);
//   //             const description = await page.evaluate(el => el.textContent.trim(), descriptionElement);
//   //             const stock = await page.evaluate(el => el.textContent.trim(), stockElement);
//   //             const price = await page.evaluate(el => el.textContent.trim(), priceElement);
//   //             const imgSrc = await page.evaluate(el => el.src, imgElement);

//   //             // Push all data to the array
//   //             allProducts.push({ title, description, stock, price, imgSrc });

//   //             console.log(`Title: ${title}`);
//   //             console.log(`Description: ${description}`);
//   //             console.log(`Stock: ${stock}`);
//   //             console.log(`Price: ${price}`);
//   //             console.log(`Image Src: ${imgSrc}`);
//   //             console.log();

//   //             if (allProducts.length >= totalProductsToScrape) {
//   //               break; // Stop scraping if the required number of products is reached
//   //             }
//   //           }
//   //         } catch (error) {
//   //           console.error("Error processing product:", error.message);
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.error("Error navigating to page:", error.message);
//   //     }
//   //   }

//   // } catch (error) {
//   //   console.error("An unexpected error occurred:", error.message);
//   // } finally {
//   //   await browser.close();
//   // }
// })();



const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.abf.store/s/en/2/Bearings');
  // This will introduce a delay of 3000 milliseconds (3 seconds)
  await customWait(4000);

   // Wait for the element with the specified ID to appear
   await page.waitForSelector('#LoginHref');
   await customWait(4000);
   // Click on the element with the specified ID
   await page.click('#LoginHref');

  // Rest of your code...

  await browser.close();
})();


function customWait(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

