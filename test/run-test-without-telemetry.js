/* eslint-disable no-console */

const execa = require('execa');
const path = require('path');

// resolved from the root of the project
const inputDir = path.resolve('./test/fixtures/without-telemetry/input');
const binPath = path.resolve('./bin/cli.js');
const execOpts = { cwd: inputDir, stderr: 'inherit' };

(async () => {
  console.log('running codemod');

  const codemod = execa(binPath, ['app'], execOpts);
  codemod.stdout.pipe(process.stdout);
  await codemod;

  console.log('codemod complete');

  console.log('comparing results');

  try {
    await execa('diff', ['-rq', './app', '../output/app'], execOpts);
  } catch (e) {
    console.error('codemod did not run successfully');
    console.log(e);

    process.exit(1);
  }

  console.log('codemod ran successfully! 🎉');
  process.exit(0);
})();
