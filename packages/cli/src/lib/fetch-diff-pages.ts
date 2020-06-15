import got from 'got';
import * as path from 'path';

interface ComponentRoutes {
  components: Array<{
    component: string;
    pages: Array<string>;
  }>;
}

export const fetchDiffPages = async (origin: string) => {
  try {
    const componentRoutes: ComponentRoutes = await got
      .get(path.posix.join(origin, '_componentRoutes.json'))
      .json();

    return componentRoutes.components.map(component => component.pages[0]);
  } catch (err) {
    throw new Error(
      "Site does not have _componentRoutes.json, gatsby-plugin-performance-doctor wasn't installed"
    );
  }
};
