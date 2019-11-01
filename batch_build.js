 require('shelljs/global');
const sh = require('shelljs');
sh.config.fatal = true;
sh.config.verbose = true;

const curFolder = pwd();
const prodFolder = `${curFolder}/production`;

sh.rm('-rf', '/public/*','/dist/*');
// sh.rm('-rf', '/node_modules/'');
// sh.exec('npm install');
// sh.exec('npm run compile');
sh.cp('-R', 'public', `${prodFolder}/`);
sh.cp('-R', 'dist', `${prodFolder}/`);
sh.cp('-R', ['package.json','webpack.config.js','webpack.serverHMR.js'], `${prodFolder}/`);
sh.cd(`${prodFolder}`);
// sh.rm('-rf', '/node_modules/'');
// sh.exec('npm install');
sh.exec('npm run start');
sh.cd('..');
