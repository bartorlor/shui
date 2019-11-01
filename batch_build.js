require('shelljs/global');
config.fatal = true;
config.verbose = true;

const curFolder = pwd();
const prodFolder = `${curFolder}/production`;

rm('-rf', 'public/*','dist/*');
// rm('-rf', '/node_modules/'');
// exec('npm install');
exec('npm run compile');
cp('-R', 'public', `${prodFolder}/`);
cp('-R', 'dist', `${prodFolder}/`);
cp('-R', ['package.json','webpack.config.js','webpack.serverHMR.js'], `${prodFolder}/`);
cd(`${prodFolder}`);
// rm('-rf', '/node_modules/'');
// exec('npm install');
exec('npm run start');
cd('..');
