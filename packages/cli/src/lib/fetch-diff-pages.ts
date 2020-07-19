import got from 'got';
import * as path from 'path';

interface ComponentRoutes {
  routes: Array<{
    component: string;
    pages: Array<string>;
  }>;
}

export const fetchDiffPages = async (origin: string, routes?: string) => {
  const routesUrl = routes ?? path.posix.join(origin, '_routes.json');

  try {
    const componentRoutes: ComponentRoutes = await got.get(routesUrl).json();

    return componentRoutes.routes.map(component => component.pages[0]);
  } catch (err) {
    throw new Error(
      "Site does not have _routes.json, gatsby-plugin-performance-doctor wasn't installed"
    );
  }
};
