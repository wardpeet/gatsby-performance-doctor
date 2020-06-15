import { Resource, RawMetrics } from './get-metrics';
import * as path from 'path';

interface Metrics {
  url: string;
  javascript: number;
  fonts: number;
  stylesheet: number;
  'page-data': number;
}

export const sumResourcesByExtension = (
  extension: string,
  resources: Array<Resource>
) => {
  return resources.reduce((acc, resource) => {
    if (!resource.url.endsWith(extension)) {
      return acc;
    }

    return acc + resource.resourceSize;
  }, 0);
};

export const formatNumber = (value: number, precision = 0.01): string => {
  const roundedValue = Math.round(value / precision) * precision;

  return new Intl.NumberFormat().format(roundedValue);
};

export const createMetricDataRowFromRaw = (rawMetrics: {
  path: string;
  metrics: RawMetrics;
}): Metrics => {
  return {
    url: rawMetrics.path,
    javascript: sumResourcesByExtension('.js', rawMetrics.metrics.resources),
    fonts: sumResourcesByExtension('.woff2', rawMetrics.metrics.resources),
    stylesheet: sumResourcesByExtension('.css', rawMetrics.metrics.resources),
    'page-data': sumResourcesByExtension(
      path.posix.join(
        rawMetrics.path === '/' ? 'index' : rawMetrics.path,
        'page-data.json'
      ),
      rawMetrics.metrics.resources
    )
  };
};
