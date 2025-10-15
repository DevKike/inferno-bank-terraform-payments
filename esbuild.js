const { build } = require('esbuild');
const fg = require('fast-glob');

const buildEntryPoints = (dir) => {
  return fg.sync(dir);
};

const buildLambdas = async () => {
  const handlersDir = 'src/handlers';

  const entryPoints = buildEntryPoints(`${handlersDir}/**/index.ts`);

  if (!entryPoints || entryPoints.length === 0) {
    console.log('No handlers were found!');
    return;
  }

  try {
    await build({
      entryPoints,
      minify: true,
      bundle: true,
      platform: 'node',
      outdir: 'dist',
      outbase: handlersDir,
      entryNames: 'handlers/[dir]/index',
      format: 'cjs',
      tsconfig: 'tsconfig.json',
      target: ['node24'],
      external: ['node:*'],
      metafile: true,
    });

    console.log(`Built ${entryPoints.length} handlers`);
  } catch (error) {
    console.error('Build failed: ', error);
    throw error;
  }
};

buildLambdas().catch((err) => {
  console.error(err);
  process.exit(1);
});
