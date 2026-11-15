/**
 * Smoke test of the running stack (verify stage 5; cicd-pipeline.md):
 * sign-up -> dashboard -> sign-out -> sign-in, a stock journey, the timing targets (NFR5.1-NFR5.4),
 * the keyboard path (NFR6.2), the web security headers (NFR1.14) and the dark
 * theme applied on first load (BR5.1).
 */
import { expect, test, type APIResponse, type Page } from "@playwright/test";

const LIMIT_MS = 2000;
const ME_MEDIAN_LIMIT_MS = 200;

// Unique per run, so a repeated run never hits DUPLICATE: "01" + 9 digits = 11 digits (BR1.2).
const phone = `01${String(Date.now()).slice(-9)}`;
const password = "smoke-test-password";
const businessName = `Smoke Traders ${phone}`;

test.describe.configure({ mode: "serial" });

function expectWebHeaders(response: APIResponse, label: string): void {
  const headers = response.headers();
  expect(headers["x-content-type-options"], label).toBe("nosniff");
  expect(headers["x-frame-options"], label).toBe("DENY");
  expect(headers["referrer-policy"], label).toBe("same-origin");
  expect(headers["content-security-policy"], label).toContain(
    "default-src 'self'",
  );
  expect(headers["content-security-policy"], label).not.toContain(
    "script-src 'unsafe-inline'",
  );
}

async function timed(action: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await action();
  return Date.now() - start;
}

async function expectHeading(page: Page, name: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}

test("serves the web app with security headers on /, an asset and /theme-init.js", async ({
  request,
}) => {
  const root = await request.get("/");
  expect(root.status()).toBe(200);
  expectWebHeaders(root, "/");
  const html = await root.text();
  expect(html.indexOf("/theme-init.js")).toBeLessThan(html.indexOf("</head>"));

  const assetPath = /src="(\/assets\/[^"]+\.js)"/.exec(html)?.[1];
  expect(assetPath, "an /assets/ script in index.html").toBeDefined();
  const asset = await request.get(assetPath ?? "");
  expect(asset.status()).toBe(200);
  expectWebHeaders(asset, assetPath ?? "asset");
  expect(asset.headers()["cache-control"]).toContain("immutable");

  const themeInit = await request.get("/theme-init.js");
  expect(themeInit.status()).toBe(200);
  expectWebHeaders(themeInit, "/theme-init.js");
  expect(themeInit.headers()["cache-control"]).toContain("no-cache");
});

test("signs up, lands on the dashboard, signs out and signs in again within 2 s each", async ({
  page,
}) => {
  const firstLoad = await timed(async () => {
    await page.goto("/signin");
    await expectHeading(page, "Sign in");
  });
  expect(firstLoad, "first load (NFR5.4)").toBeLessThanOrEqual(LIMIT_MS);

  await page.goto("/signup");
  await page.getByTestId("signup-business-name-input").fill(businessName);
  await page.getByTestId("signup-name-input").fill("Smoke Owner");
  await page.getByTestId("signup-phone-input").fill(phone);
  await page.getByTestId("signup-password-input").fill(password);
  let signUpResponseMs = 0;
  const signUp = await timed(async () => {
    const start = Date.now();
    const response = page.waitForResponse("**/api/v1/auth/signup");
    await page.getByTestId("signup-submit-button").click();
    await response;
    signUpResponseMs = Date.now() - start;
    await expectHeading(page, "Dashboard");
  });
  console.log(
    `first load ${firstLoad} ms; sign-up ${signUp} ms (API answered after ${signUpResponseMs} ms)`,
  );
  expect(signUp, "sign-up (NFR5.1)").toBeLessThanOrEqual(LIMIT_MS);
  await expect(page.getByTestId("app-bar-user-name")).toHaveText("Smoke Owner");

  await page.getByTestId("app-bar-sign-out-button").click();
  await expectHeading(page, "Sign in");

  await page.getByTestId("signin-phone-input").fill(phone);
  await page.getByTestId("signin-password-input").fill(password);
  const signIn = await timed(async () => {
    await page.getByTestId("signin-submit-button").click();
    await expectHeading(page, "Dashboard");
  });
  console.log(`sign-in ${signIn} ms`);
  expect(signIn, "sign-in (NFR5.2)").toBeLessThanOrEqual(LIMIT_MS);

  // NFR5.3: 20 /auth/me calls after a warm-up; median server time from X-Response-Time.
  await page.request.get("/api/v1/auth/me");
  const durations: number[] = [];
  for (let i = 0; i < 20; i += 1) {
    const response = await page.request.get("/api/v1/auth/me");
    expect(response.status()).toBe(200);
    durations.push(
      Number.parseFloat(response.headers()["x-response-time"] ?? "NaN"),
    );
  }
  durations.sort((a, b) => a - b);
  const median = ((durations[9] ?? NaN) + (durations[10] ?? NaN)) / 2;
  console.log(
    `/auth/me median server time: ${median} ms (budget 50 ms, fails above ${ME_MEDIAN_LIMIT_MS} ms)`,
  );
  expect(median).toBeLessThanOrEqual(ME_MEDIAN_LIMIT_MS);
});

test("adds a product, moves stock in and out, refuses going below zero and shows the history", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByTestId("signin-phone-input").fill(phone);
  await page.getByTestId("signin-password-input").fill(password);
  await page.getByTestId("signin-submit-button").click();
  await expectHeading(page, "Dashboard");

  await page.getByTestId("side-nav-products-link").click();
  await expectHeading(page, "Products");
  await page.getByTestId("product-sku-input").fill("RICE-25");
  await page.getByTestId("product-name-input").fill("Miniket rice");
  await page.getByTestId("product-unit-input").fill("bag");
  await page.getByTestId("product-min-input").fill("5");
  await page.getByTestId("product-cost-input").fill("100");
  await page.getByTestId("product-save-button").click();
  const row = page.getByTestId("product-row-RICE-25");
  await expect(row).toContainText("0 bag");
  await expect(row).toContainText("Out");

  await row.getByRole("link", { name: "Stock in / out" }).click();
  await expectHeading(page, "Stock in / out");
  await page.getByTestId("stock-quantity-input").fill("10");
  await page.getByTestId("stock-save-button").click();
  await expect(page.getByTestId("stock-saved")).toContainText(
    "Now 10 bag in stock.",
  );

  await page.getByTestId("stock-direction-out").check();
  await page.getByTestId("stock-quantity-input").fill("15");
  await page.getByTestId("stock-save-button").click();
  await expect(page.getByText("Only 10 bag in stock.")).toBeVisible();

  await page.getByTestId("stock-quantity-input").fill("6");
  await page.getByTestId("stock-reason-select").selectOption("damage");
  await page.getByTestId("stock-save-button").click();
  await expect(page.getByTestId("stock-saved")).toContainText(
    "Now 4 bag in stock.",
  );

  await page.getByTestId("side-nav-dashboard-link").click();
  await expect(page.getByTestId("stat-low")).toHaveText("1");
  await expect(page.getByTestId("stat-value")).toHaveText("৳400");
  await expect(page.getByTestId("stat-losses")).toHaveText("৳600");
  await expect(page.getByTestId("attention-list")).toContainText(
    "Miniket rice",
  );

  await page.getByTestId("side-nav-history-link").click();
  const history = page.getByTestId("history-table");
  await expect(history.getByRole("row")).toHaveCount(3);
  await expect(history.getByRole("row").nth(1)).toContainText("Damaged");
  await expect(history.getByRole("row").nth(1)).toContainText("Smoke Owner");
  await page.getByTestId("history-reason-select").selectOption("purchase");
  await expect(history.getByRole("row")).toHaveCount(2);
  await expect(history.getByRole("row").nth(1)).toContainText("+10 bag");
  await page.getByTestId("history-clear-filters").click();
  await expect(history.getByRole("row")).toHaveCount(3);

  await page.getByTestId("side-nav-count-link").click();
  await expectHeading(page, "Stock count");
  await page
    .getByTestId("count-product-select")
    .selectOption({ label: "Miniket rice (RICE-25)" });
  await page.getByTestId("count-quantity-input").fill("3");
  await page.getByTestId("count-save-button").click();
  await expect(page.getByTestId("count-saved")).toContainText(
    "1 bag missing (৳100)",
  );
});

test("lets the owner add a worker, who signs in without the Staff page", async ({
  page,
}) => {
  const workerPhone = `01${String(Date.now() + 7).slice(-9)}`;
  await page.goto("/signin");
  await page.getByTestId("signin-phone-input").fill(phone);
  await page.getByTestId("signin-password-input").fill(password);
  await page.getByTestId("signin-submit-button").click();
  await expectHeading(page, "Dashboard");

  await page.getByTestId("side-nav-staff-link").click();
  await expectHeading(page, "Staff");
  await page.getByTestId("staff-name-input").fill("Smoke Worker");
  await page.getByTestId("staff-phone-input").fill(workerPhone);
  await page.getByTestId("staff-password-input").fill("worker-password");
  await page.getByTestId("staff-save-button").click();
  await expect(page.getByTestId(`staff-row-${workerPhone}`)).toContainText(
    "Warehouse worker",
  );

  await page.getByTestId("app-bar-sign-out-button").click();
  await expectHeading(page, "Sign in");
  await page.getByTestId("signin-phone-input").fill(workerPhone);
  await page.getByTestId("signin-password-input").fill("worker-password");
  await page.getByTestId("signin-submit-button").click();
  await expectHeading(page, "Dashboard");
  await expect(page.getByTestId("app-bar-user-role")).toHaveText(
    "Warehouse worker",
  );
  await expect(page.getByTestId("side-nav-staff-link")).toHaveCount(0);

  await page.getByTestId("side-nav-account-link").click();
  await expectHeading(page, "My password");
  await page.getByTestId("account-current-input").fill("worker-password");
  await page.getByTestId("account-new-input").fill("worker-password-2");
  await page.getByTestId("account-save-button").click();
  await expect(page.getByTestId("account-saved")).toBeVisible();
  await page.getByTestId("app-bar-sign-out-button").click();
  await page.getByTestId("signin-phone-input").fill(workerPhone);
  await page.getByTestId("signin-password-input").fill("worker-password-2");
  await page.getByTestId("signin-submit-button").click();
  await expectHeading(page, "Dashboard");
});

test("imports products from a CSV, downloads CSVs and shows them in the report", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByTestId("signin-phone-input").fill(phone);
  await page.getByTestId("signin-password-input").fill(password);
  await page.getByTestId("signin-submit-button").click();
  await expectHeading(page, "Dashboard");

  await page.getByTestId("side-nav-products-link").click();
  await page.getByTestId("products-import-link").click();
  await expectHeading(page, "Import from Excel");
  await page.getByTestId("import-file-input").setInputFiles({
    name: "products.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "sku,name,unit,unit_cost,min_stock,opening_stock\r\n" +
        'OIL-5,Soybean oil 5L,ctn,"1,200",2,15\r\n' +
        "SALT-1,Salt 1kg,pcs,35,10,0\r\n",
    ),
  });
  await expect(page.getByTestId("import-ready")).toHaveText(
    "2 products are ready to import.",
  );
  await page.getByTestId("import-save-button").click();
  await expect(page.getByTestId("import-done")).toContainText(
    "Imported 2 products with 15 units of opening stock.",
  );

  const products = await page.request.get("/api/v1/products/export.csv");
  expect(products.status()).toBe(200);
  expect(products.headers()["content-type"]).toContain("text/csv");
  expect(await products.text()).toContain(
    "OIL-5,Soybean oil 5L,ctn,15,2,ok,1200,18000",
  );
  const history = await page.request.get(
    "/api/v1/stock/movements/export.csv?reason=opening",
  );
  expect(await history.text()).toContain("OIL-5,Soybean oil 5L,in,opening,15");

  await page.getByTestId("side-nav-report-link").click();
  await expectHeading(page, "Report");
  const report = page.getByTestId("report-table");
  await expect(report).toContainText("Soybean oil 5L");
  await expect(page.getByTestId("report-received-value")).toContainText("৳");
});

test.describe("on a 360 px phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("fits every page with a bottom menu and no sideways scrolling", async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.getByTestId("signin-phone-input").fill(phone);
    await page.getByTestId("signin-password-input").fill(password);
    await page.getByTestId("signin-submit-button").click();
    await expectHeading(page, "Dashboard");

    const nav = page.getByTestId("side-nav");
    const box = await nav.boundingBox();
    expect(box, "bottom menu").not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(740, 0);

    for (const [link, heading] of [
      ["side-nav-products-link", "Products"],
      ["side-nav-stock-link", "Stock in / out"],
      ["side-nav-count-link", "Stock count"],
      ["side-nav-history-link", "History"],
      ["side-nav-report-link", "Report"],
      ["side-nav-staff-link", "Staff"],
      ["side-nav-account-link", "My password"],
      ["side-nav-dashboard-link", "Dashboard"],
    ] as const) {
      await page.getByTestId(link).click();
      await expectHeading(page, heading);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `sideways scroll on ${heading}`).toBeLessThanOrEqual(0);
    }
  });
});

test("signs in with the keyboard only, using the skip link, with visible focus", async ({
  page,
}) => {
  await page.goto("/signin");
  await expectHeading(page, "Sign in");

  await page.keyboard.press("Tab");
  const skipLink = page.getByTestId("skip-link");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  const outline = await skipLink.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(outline).not.toBe("none");

  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("signin-phone-input")).toBeFocused();
  await page.keyboard.type(phone);
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("signin-password-input")).toBeFocused();
  await page.keyboard.type(password);
  await page.keyboard.press("Enter");

  await expectHeading(page, "Dashboard");
});

test("applies a saved dark theme on first load", async ({ page }) => {
  await page.addInitScript(() =>
    window.localStorage.setItem("mojud-theme", "dark"),
  );

  await page.goto("/signin");
  await expectHeading(page, "Sign in");

  expect(
    await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    ),
  ).toBe("dark");
  const background = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  // The app background is the dark surface-alt token (#18241f), as in the mockups.
  expect(background).toBe("rgb(24, 36, 31)");
});
