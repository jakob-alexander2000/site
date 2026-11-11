export type Device = {
  name: string;
  width: number;
  height: number;
  /** Omit to run on both Chromium and WebKit. */
  project?: "chromium" | "webkit";
  columns: 12 | 8 | 4;
  margin: 96 | 48 | 20;
  note: string;
};

export const devices: readonly Device[] = [
  {
    name: "desktop-1440",
    width: 1440,
    height: 900,
    columns: 12,
    margin: 96,
    note: "Desktop Chrome on Chromium and Desktop Safari on WebKit.",
  },
  {
    name: "desktop-1280",
    width: 1280,
    height: 800,
    columns: 12,
    margin: 96,
    note: "Shorter desktop window, both engines.",
  },
  {
    name: "ipad-mini-landscape",
    width: 1133,
    height: 744,
    columns: 8,
    margin: 48,
    note: "iPad mini landscape, toolbars retracted.",
  },
  {
    name: "ipad-mini-landscape-chrome",
    width: 1133,
    height: 610,
    columns: 8,
    margin: 48,
    note: "iPad mini landscape with browser chrome.",
  },
  {
    name: "ipad-mini-portrait",
    width: 744,
    height: 1133,
    columns: 8,
    margin: 48,
    note: "iPad mini portrait.",
  },
  {
    name: "iphone-12-portrait",
    width: 390,
    height: 844,
    columns: 4,
    margin: 20,
    note: "iPhone 12 Pro layout viewport. The performance profile uses this size at DPR 2.",
  },
  {
    name: "iphone-12-landscape",
    width: 844,
    height: 390,
    columns: 4,
    margin: 20,
    note: "iPhone 12 Pro landscape layout viewport. Phone columns stay 4.",
  },
  {
    name: "iphone-se",
    width: 375,
    height: 667,
    columns: 4,
    margin: 20,
    note: "Small-phone layout viewport.",
  },
  {
    name: "iphone-chrome-ios",
    width: 375,
    height: 547,
    columns: 4,
    margin: 20,
    note: "iPhone Chrome on iOS, small phone, toolbar height from the review.",
  },
  {
    name: "ipad-mini-portrait-chrome",
    width: 744,
    height: 999,
    columns: 8,
    margin: 48,
    note: "iPad mini portrait with a Chrome toolbar estimate: full height 1133 minus the 134px already used by 1133×610.",
  },
  {
    name: "ios-safari-toolbar",
    width: 390,
    height: 703,
    project: "webkit",
    columns: 4,
    margin: 20,
    note: "Safari toolbars expanded. First-load estimate for a 390×844 notch phone: 844 − 47 − 94.",
  },
  {
    name: "ios-safari-landscape",
    width: 844,
    height: 340,
    project: "webkit",
    columns: 4,
    margin: 20,
    note: "Safari landscape with about 50px of bars.",
  },
  {
    name: "ios-chrome-toolbar",
    width: 390,
    height: 664,
    project: "webkit",
    columns: 4,
    margin: 20,
    note: "Chrome on iOS is WebKit with a taller toolbar. 664 is the shorter stand-in already used in the lookbook suite, not a lab measurement of Chrome.",
  },
];
