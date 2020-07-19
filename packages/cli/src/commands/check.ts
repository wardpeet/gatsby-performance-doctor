import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as Table from 'cli-table3';
import { fetchDiffPages } from '../lib/fetch-diff-pages';
import { getMetrics } from '../lib/get-metrics';
import { createMetricDataRowFromRaw, formatNumber } from '../lib/utils';

interface Metrics {
  url: string;
  javascript: number;
  fonts: number;
  stylesheet: number;
  'page-data': number;
}

const headers: Array<keyof Metrics> = [
  'url',
  'javascript',
  'page-data',
  'fonts',
  'stylesheet'
];

const showTable = (data: Array<Metrics>) => {
  const table = new Table({
    head: headers
  }) as Table.HorizontalTable;

  data.forEach(line => {
    const row: Array<string> = [];
    headers.forEach(header => {
      if (header === `url`) {
        row.push(String(line[header]));
      } else {
        row.push(`${formatNumber(line[header] / 1024)}kb`);
      }
    });

    table.push(row);
  });

  console.log(table.toString());
};

export const command = async (
  originA: string,
  originB?: string,
  options?: { routes?: string }
) => {
  const routes = await fetchDiffPages(originA, options?.routes);

  const browser = await puppeteer.launch();

  try {
    const metricsA = await getMetricsOfOrigin(originA, routes, browser);
    let metricsB;
    if (originB) {
      metricsB = await getMetricsOfOrigin(originB, routes, browser);
    }

    const dataA: Array<Metrics> = metricsA.map(createMetricDataRowFromRaw);

    console.log('Origin A:', originA);
    showTable(dataA);

    if (metricsB) {
      const dataB: Array<Metrics> = metricsB.map(createMetricDataRowFromRaw);
      console.log('Origin B:', originB);
      showTable(dataB);

      console.log(`Diff ${originB} - ${originA}`);
      showTable(createDiff(dataA, dataB));
    }
  } finally {
    await browser.close();
  }
};

function getMetricsOfOrigin(
  origin: string,
  routes: Array<string>,
  browser: puppeteer.Browser
) {
  const metricPromises = routes.map(route =>
    getMetrics(path.posix.join(origin, route), browser).then(metrics => ({
      metrics,
      path: route
    }))
  );

  return Promise.all(metricPromises);
}

function createDiff(dataA: Array<Metrics>, dataB: Array<Metrics>) {
  return dataA.map((row, index) => {
    const diffedObject: Metrics = {
      url: '',
      'page-data': 0,
      fonts: 0,
      javascript: 0,
      stylesheet: 0
    };

    (Object.keys(row) as Array<keyof Metrics>).forEach(key => {
      if (key === 'url') {
        diffedObject[key] = row[key];
      } else {
        diffedObject[key] = dataB[index][key] - row[key];
      }
    });

    return diffedObject;
  });
}
