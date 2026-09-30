import {expect, test} from "@playwright/test";

test("loads the PWA install gate or authenticated app shell", async ({page}) => {
    await page.goto("/");

    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/Robot/i);
});
