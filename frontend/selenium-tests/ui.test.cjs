
const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

async function testUI() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .build();

  const screenshotDir = path.join(__dirname, "ui-screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  async function saveScreenshot(filename) {
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(
      path.join(screenshotDir, filename),
      screenshot,
      "base64"
    );
    console.log("Screenshot saved:", filename);
  }

  try {
    // UI-01: Homepage
    await driver.manage().window().setRect({
      width: 1440,
      height: 900
    });

    await driver.get("http://localhost:3000");
    await driver.wait(
      until.elementLocated(By.tagName("body")),
      10000
    );

    const title = await driver.getTitle();

    if (!title.toLowerCase().includes("priusgo")) {
      throw new Error("Homepage title verification failed");
    }

    console.log("PASS UI-01: Homepage loaded");
    await saveScreenshot("UI01_homepage.png");

    // UI-02: Main heading
    const heading = await driver.wait(
      until.elementLocated(By.tagName("h1")),
      10000
    );

    if (!(await heading.isDisplayed())) {
      throw new Error("Main heading is not visible");
    }

    console.log("PASS UI-02: Main heading visible");
    await saveScreenshot("UI02_heading.png");

    // UI-03: Choose a car button
    const chooseCar = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[self::a or self::button][contains(normalize-space(.), 'Choose a car')]"
        )
      ),
      10000
    );

    if (!(await chooseCar.isDisplayed())) {
      throw new Error("Choose a car button is not visible");
    }

    console.log("PASS UI-03: Choose a car button visible");
    await saveScreenshot("UI03_choose_car.png");

    // UI-04: Mobile responsive layout
    await driver.manage().window().setRect({
      width: 390,
      height: 844
    });

    await driver.sleep(1000);

    const mobileHeading = await driver.findElement(
      By.tagName("h1")
    );

    if (!(await mobileHeading.isDisplayed())) {
      throw new Error("Heading not visible on mobile");
    }

    console.log("PASS UI-04: Mobile heading visible");
    await saveScreenshot("UI04_mobile.png");

    console.log("ALL INITIAL UI TESTS PASSED");

  } catch (error) {
    console.error("UI TEST FAILED:", error.message);
    await saveScreenshot("UI_test_failure.png");
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

testUI();
