import sade from 'sade';
// @ts-ignore
import { version } from '../package.json';
import { command as checkCommand } from './commands/check';

export const init = () => {
  const prog = sade('gatsby-performance-doctor');

  prog
    .version(version)
    .command('check <origin> [compareOrigin]')
    .action(checkCommand);

  prog.parse(process.argv);
};
