import * as sade from 'sade';
// @ts-ignore
import { version } from '../package.json';
import { command as checkCommand } from './commands/check';

export const init = () => {
  const prog = sade('gatsby-performance-doctor');

  prog
    .version(version)
    .command('size <origin> [compareOrigin]')
    .option('--routes', 'List of json routes')
    .action(checkCommand)
    .command('webvitals <origin> [compareOrigin]')
    .option('--routes', 'List of json routes')
    .action(checkCommand);

  prog.parse(process.argv);
};
