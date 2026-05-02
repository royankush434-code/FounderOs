const { exec } = require('child_process');

exec('npx tsx --env-file=.env.local scripts/seed_database.ts', (error, stdout, stderr) => {
  if (error) {
    console.error('STDERR:', stderr);
    return;
  }
  console.log('STDOUT:', stdout);
});
