import {
  setWorldConstructor,
  setDefaultTimeout,
  World,
} from "@cucumber/cucumber";
import { chromium, firefox, webkit } from "playwright";
import type { Page } from "playwright";

import { printAccessibilityCheck } from "../../playwright-accessibility-report";

setDefaultTimeout(30 * 1000);

const browsers = { chromium, firefox, webkit };

type CustomParameters = {
  baseURL: string;
  browser: "chromium" | "firefox" | "webkit";
  device: {
    type: "desktop" | "tablet" | "phone";
    height: number;
    width: number;
  };
};

class CustomWorld extends World<CustomParameters> {
  page: Page;
  async navigateTo(path: string) {
    const { baseURL, browser, device } = this.parameters;
    const selectedBrowser = await browsers[browser].launch();
    this.page = await selectedBrowser.newPage({
      baseURL,
      viewport: {
        height: device.height,
        width: device.width,
      },
    });
    await this.page.goto(path);
    await printAccessibilityCheck(this.page);
  }
}

setWorldConstructor(CustomWorld);
