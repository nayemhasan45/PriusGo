
const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

async function testBooking() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .build();

  try {
    console.log("Starting PriusGo Selenium booking test...");

    // STEP 1: Open PriusGo website
    await driver.get("http://localhost:3000/#cars");

    console.log("PASS: PriusGo website opened");

    // STEP 2: Wait for the car selection button
    const chooseCar = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Choose this car')]")
      ),
      15000
    );

    console.log("PASS: Choose this car button found");

    // STEP 3: Scroll to the button
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      chooseCar
    );

    // STEP 4: Wait for button visibility
    await driver.wait(
      until.elementIsVisible(chooseCar),
      10000
    );

    await driver.wait(
      until.elementIsEnabled(chooseCar),
      10000
    );

    // STEP 5: Click using JavaScript to avoid
    // the previous click interception error
    await driver.executeScript(
      "arguments[0].click();",
      chooseCar
    );

    console.log("PASS: Choose this car button clicked");

    
    // STEP 6: Verify booking modal heading
    const bookingHeading = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(.), 'Book Toyota Prius MJO146') and (self::h1 or self::h2 or self::h3)]"
        )
      ),
      15000
    );

    await driver.wait(
      until.elementIsVisible(bookingHeading),
      10000
    );

    console.log(
      "PASS: Booking form opened for Toyota Prius MJO146"
    );


    // STEP 7: Verify rental request section
    const rentalSection = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(text(), 'Request your rental')]"
        )
      ),
      10000
    );

    await driver.wait(
      until.elementIsVisible(rentalSection),
      10000
    );

    console.log("PASS: Rental request form displayed");

    // STEP 8: Verify form fields
    const fullName = await driver.findElement(
      By.xpath("//input[@placeholder='Al Amin']")
    );

    const email = await driver.findElement(
      By.xpath("//input[@placeholder='you@email.com']")
    );

    await driver.wait(
      until.elementIsVisible(fullName),
      10000
    );

    await driver.wait(
      until.elementIsVisible(email),
      10000
    );

    console.log("PASS: Name and email fields displayed");

    // STEP 9: Save screenshot for university report
    const screenshot = await driver.takeScreenshot();

    const screenshotPath = path.join(
      __dirname,
      "booking-form.png"
    );

    fs.writeFileSync(
      screenshotPath,
      screenshot,
      "base64"
    );

    console.log("PASS: Booking screenshot saved");
    console.log("Screenshot location:", screenshotPath);

    console.log("--------------------------------");
    console.log("ALL BOOKING TESTS PASSED");
    console.log("--------------------------------");

  } catch (error) {
    console.error("TEST FAILED:", error.message);

    // Save a screenshot if the test fails
    try {
      const screenshot = await driver.takeScreenshot();

      fs.writeFileSync(
        path.join(__dirname, "booking-error.png"),
        screenshot,
        "base64"
      );

      console.log("Error screenshot saved");
    } catch {
      console.log("Could not save error screenshot");
    }

    throw error;

  } finally {
    // Close Chrome after testing
    await driver.quit();
  }
}

testBooking().catch(() => {
  process.exitCode = 1;
});
