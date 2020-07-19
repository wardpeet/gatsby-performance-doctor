import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as Table from 'cli-table3';
import { fetchDiffPages } from '../lib/fetch-diff-pages';

export const command = async (
  originA: string,
  originB?: string,
  options?: { routes?: string }
) => {
  const routes = await fetchDiffPages(originA, options?.routes);

  const browser = await puppeteer.launch();

  try {
  } finally {
    await browser.close();
  }
};
