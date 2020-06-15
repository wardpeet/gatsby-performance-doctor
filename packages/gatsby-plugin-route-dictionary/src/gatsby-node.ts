import { GatsbyNode } from 'gatsby';
import * as path from 'path';
import { writeFile } from 'fs-extra';

export const onPostBuild: GatsbyNode['onPostBuild'] = async ({ store }) => {
  const {
    components,
    program
  }: {
    components: Array<{ pages: Set<any>; componentPath: string }>;
    program: { directory: string };
  } = store.getState();
  const fpath = path.join(program.directory, 'public', '_routes.json');

  const arr: Array<{ component: string; pages: Array<any> }> = [];
  components.forEach(value => {
    arr.push({
      component: path.relative(program.directory, value.componentPath),
      pages: Array.from(value.pages)
    });
  });

  await writeFile(
    fpath,
    JSON.stringify(
      {
        routes: arr
      },
      null,
      2
    )
  );
};
