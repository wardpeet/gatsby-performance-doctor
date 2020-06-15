import { URL } from 'url';
import puppeteer from 'puppeteer';
import * as nodePath from 'path';

declare global {
  interface Window {
    ___timings: PaintMetrics;
  }
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
}

export interface Resource {
  url: string;
  transferSize: number;
  resourceSize: number;
}

export interface PaintMetrics {
  'largest-contentful-paint': number;
  'first-paint': number;
  'first-contentful-paint': number;
}

export interface RawMetrics {
  timings: PaintMetrics;
  resources: Array<Resource>;
}

export const getMetrics = async (url: string, browser: puppeteer.Browser) => {
  const urlObj = new URL(url);

  const { timings, resources } = await navigateToPageAndgetMetrics({
    origin: urlObj.origin,
    path: urlObj.pathname,
    browser
  });

  return {
    timings,
    resources
  };
};

async function navigateToPageAndgetMetrics(
  {
    origin,
    path,
    browser
  }: {
    origin: string;
    path: string;
    browser: puppeteer.Browser;
  },
  retry = 0
): Promise<RawMetrics> {
  try {
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(observePaintTimings);

    await page.goto(nodePath.posix.join(origin, path), {
      waitUntil: 'networkidle0'
    });

    const resourceData = await page.evaluate(getResourceData);
    const paintTimings = await page.evaluate(() => {
      return window.___timings;
    });

    await page.close();

    return {
      resources: resourceData,
      timings: paintTimings
    };
  } catch (err) {
    if (retry === 0) {
      return navigateToPageAndgetMetrics(
        {
          origin,
          path,
          browser
        },
        retry + 1
      );
    }

    console.log(origin, path, retry);

    throw err;
  }
}

/**
 * observe paint timings
 */
function observePaintTimings() {
  window.___timings = {
    'largest-contentful-paint': 0,
    'first-paint': 0,
    'first-contentful-paint': 0
  };
  const po = new PerformanceObserver(list => {
    const entries = list.getEntries();
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].entryType === 'largest-contentful-paint') {
        const lcpEntry = entries[i] as LargestContentfulPaintEntry;
        window.___timings['largest-contentful-paint'] =
          lcpEntry.renderTime || lcpEntry.loadTime;
      }
      if (entries[i].entryType === 'paint') {
        if (entries[i].name === 'first-paint') {
          window.___timings['first-paint'] = entries[i].startTime;
        }
        if (entries[i].name === 'first-contentful-paint') {
          window.___timings['first-contentful-paint'] = entries[i].startTime;
        }
      }
    }
  });

  po.observe({
    entryTypes: ['paint', 'largest-contentful-paint']
  });
}

function getResourceData(): Array<Resource> {
  const resources: Array<PerformanceResourceTiming> = performance.getEntriesByType(
    'resource'
  ) as Array<PerformanceResourceTiming>;

  const pageResources: Array<Resource> = [];
  for (const key in resources) {
    const resource = resources[key];
    pageResources.push({
      url: resource.name,
      transferSize: resource.transferSize,
      resourceSize: resource.decodedBodySize
    });
  }

  return pageResources;
}
