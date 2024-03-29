/* eslint-disable no-console */

const { spawn } = require('child_process');
const execa = require('execa');
const path = require('path');

// resolved from the root of the project
const inputDir = path.resolve('./test/fixtures/with-telemetry/input');
const execOpts = { cwd: inputDir, stderr: 'inherit' };

(async () => {
  console.log('installing deps');

  await execa('pnpm', ['install', '--no-lockfile'], execOpts);

  console.log('starting serve');

  // We use spawn for this one so we can kill it later without throwing an error
  const emberServe = spawn('pnpm', ['start'], execOpts);
  emberServe.stderr.pipe(process.stderr);
  emberServe.stdout.pipe(process.stdout);

  await new Promise((resolve) => {
    emberServe.stdout.on('data', (data) => {
      if (data.toString().includes('Build successful')) {
        resolve();
      }
    });
  });

  console.log('running codemod');

  const codemod = execa(
    path.resolve('./bin/cli.js'),
    ['--telemetry', 'http://localhost:4200', 'app'],
    execOpts
  );
  codemod.stdout.pipe(process.stdout);
  await codemod;

  console.log('codemod complete, ending serve');

  emberServe.kill('SIGTERM');

  console.log('comparing results');

  try {
    const compareFixture = await import('compare-fixture');
    compareFixture.default(path.join(inputDir, 'app'), path.join(inputDir, '../output/app'));
  } catch (e) {
    console.error('codemod did not run successfully');
    console.log(e);

    process.exit(1);
  }

  console.log('codemod ran successfully! 🎉');
  process.exit(0);
})();
