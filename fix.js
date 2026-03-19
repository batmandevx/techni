const { spawnSync } = require('child_process');
const path = require('path');

const cwd = process.cwd();
console.log('Running native Node Prisma script in:', cwd);

try {
  console.log('Pushing Prisma schema...');
  const push = spawnSync(process.execPath, [path.join('node_modules', 'prisma', 'build', 'index.js'), 'db', 'push', '--accept-data-loss'], { stdio: 'inherit', cwd });
  if (push.status !== 0) throw new Error('Prisma push failed');

  console.log('Generating Prisma client...');
  const gen = spawnSync(process.execPath, [path.join('node_modules', 'prisma', 'build', 'index.js'), 'generate'], { stdio: 'inherit', cwd });
  if (gen.status !== 0) throw new Error('Prisma generate failed');

  console.log('Checking TypeScript for compilation tracking...');
  const tsc = spawnSync(process.execPath, [path.join('node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'], { stdio: 'inherit', cwd });
  if (tsc.status !== 0) throw new Error('TypeScript check failed');
  
  console.log('All checks passed! The S&OP app is fully configured.');
} catch (error) {
  console.error('Task failed:', error.message);
  process.exit(1);
}
