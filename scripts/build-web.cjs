'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist');
const webAssets = [
  'index.html',
  'style.css',
  'script.js',
  'service-worker.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-192.png',
  'icon-512.png'
];

async function buildWeb() {
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });
  await Promise.all(webAssets.map((asset) =>
    fs.copyFile(path.join(projectRoot, asset), path.join(outputDirectory, asset))
  ));
  console.log(`Built installable web app in ${outputDirectory}`);
}

buildWeb().catch((error) => {
  console.error(`Failed to build web app: ${error.message}`);
  process.exitCode = 1;
});
