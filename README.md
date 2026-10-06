# হিসাব | Hisab Calculator

A lightweight Bengali calculator PWA with Bengali numerals, calculation history, and quick VAT calculations. No runtime dependencies are required.

## Run with npm

After publishing, run it without installing it globally:

```bash
npx hisab-calculator
```

Open the address printed in the terminal (by default, `http://127.0.0.1:4174`).

To install it into a project:

```bash
npm install hisab-calculator
npx hisab-calculator
```

The command is local-only by default. To change its port or make it reachable on another network interface:

```bash
npx hisab-calculator --port 8080
npx hisab-calculator --host 0.0.0.0 --port 8080
```

Use `hisab-calculator --help` for all options. Binding to `0.0.0.0` exposes the app to the network; use it only on a trusted network.

## Run from a checkout

Requires Node.js 20 or later:

```bash
npm start
npm test
```

No `npm install` step is needed. The server uses Node's built-in HTTP and file-system modules.

## Features

- Bengali digit display and keypad, with keyboard input support
- Addition, subtraction, multiplication, division, and percentage
- Quick VAT calculations at 5%, 7.5%, and 15%
- Recent calculation history
- Installable progressive web app with offline caching

The calculator runs in your browser. The local server serves only the app's static files and binds to loopback by default.

## Install on Android

The installable web app and Android APK are published at:

<https://komoizdead.github.io/hisab-calculator/>

- **Install from the web:** Open the link in Chrome on Android and choose **Install app** when offered. If the install button is not shown, use Chrome's menu and choose **Install app** or **Add to Home screen**. Once installed, the calculator works offline.
- **Install the APK:** Tap **অ্যান্ড্রয়েড APK** on the page to download `hisab-calculator.apk`, open it, and approve Android's prompt to allow installs from that browser if requested. The APK is a debug-signed sideload build, not a Play Store release.

The APK packages the calculator locally, so calculations continue to work without a network connection. A new APK built by GitHub Actions may need the previous sideloaded version uninstalled before updating because CI debug signing keys are ephemeral.

## Release

GitHub Actions runs the tests and checks the npm package contents on pushes and pull requests. To publish a version, configure npm trusted publishing for this repository's `publish.yml` workflow, update the package version, and push a matching `v*` tag. The workflow publishes with npm provenance without storing a long-lived npm token in GitHub.
