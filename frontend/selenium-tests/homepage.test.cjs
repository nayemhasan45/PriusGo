
const { Builder, By, until } = require("selenium-webdriver");

async function testHomepage() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .build();

  try {
    // Open the PriusGo website
    await driver.get("http://localhost:3000");

    // Wait until the page is loaded
    await driver.wait(
      until.elementLocated(By.tagName("body")),
      10000
    );

    // Get the page title
    const title = await driver.getTitle();

    console.log("Page title:", title);

    // Verify the homepage title
    if (!title.toLowerCase().includes("priusgo")) {
      throw new Error("Homepage title does not contain PriusGo");
    }

    console.log("PASS: PriusGo homepage title verified");

    // Save screenshot for assignment report
    const screenshot = await driver.takeScreenshot();
    require("fs").writeFileSync(
      "selenium-tests/homepage.png",
      screenshot,
      "base64"
    );

    console.log("Screenshot saved successfully");
  } finally {
    await driver.quit();
  }
}

testHomepage().catch((error) => {
  console.error("TEST FAILED:", error);
  process.exitCode = 1;
});
