#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const APP_FILES = new Map([
  ['index.html', 'text/html; charset=utf-8'],
  ['style.css', 'text/css; charset=utf-8'],
  ['script.js', 'text/javascript; charset=utf-8'],
  ['service-worker.js', 'text/javascript; charset=utf-8'],
  ['manifest.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['icon.svg', 'image/svg+xml'],
  ['icon-192.png', 'image/png'],
  ['icon-512.png', 'image/png']
]);

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port "${value}". Use a number from 0 to 65535.`);
  }
  return port;
}

function parseOptions(args, env = process.env) {
  const options = {
    host: env.HOST || '127.0.0.1',
    port: parsePort(env.PORT || '4174')
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') {
      return { ...options, help: true };
    }

    const [flag, inlineValue] = arg.split('=', 2);
    const value = inlineValue === undefined ? args[++index] : inlineValue;
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${flag}.`);
    }

    if (flag === '--host') {
      options.host = value;
    } else if (flag === '--port' || flag === '-p') {
      options.port = parsePort(value);
    } else {
      throw new Error(`Unknown option "${arg}". Use --help for usage.`);
    }
  }

  return options;
}

function createAppServer() {
  return http.createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400);
      response.end('Invalid request path');
      return;
    }

    if (pathname.includes('\\') || pathname.includes('\0')) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const asset = pathname === '/' ? 'index.html' : pathname.slice(1);
    const contentType = APP_FILES.get(asset);
    if (!contentType) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const filePath = path.join(__dirname, '..', asset);
    try {
      const content = await fs.readFile(filePath);
      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': asset === 'index.html' || asset === 'service-worker.js' ? 'no-cache' : 'public, max-age=3600'
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
      } else {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Unable to load calculator asset');
        console.error(`Failed to read ${asset}: ${error.message}`);
      }
    }
  });
}

function printHelp() {
  console.log(`Hisab Calculator - Bengali calculator PWA

Usage: hisab-calculator [options]

Options:
  -p, --port <number>  Port to listen on (default: 4174; 0 selects a free port)
      --host <address> Host to bind (default: 127.0.0.1)
  -h, --help           Show this help

Examples:
  npx hisab-calculator
  hisab-calculator --port 8080
  hisab-calculator --host 0.0.0.0 --port 8080`);
}

function start(args = process.argv.slice(2), env = process.env) {
  const options = parseOptions(args, env);
  if (options.help) {
    printHelp();
    return null;
  }

  const server = createAppServer();
  server.once('error', (error) => {
    console.error(`Could not start Hisab Calculator: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(options.port, options.host, () => {
    const address = server.address();
    console.log(`Hisab Calculator is running at http://${options.host}:${address.port}`);
    console.log('Press Ctrl+C to stop.');
  });
  return server;
}

if (require.main === module) {
  try {
    start();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { createAppServer, parseOptions, parsePort, start };
