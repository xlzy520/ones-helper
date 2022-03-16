import fs from 'fs-extra';
import type { Manifest } from 'webextension-polyfill';
import type PkgType from '../package.json';
import { isDev, port, r } from '../scripts/utils';

export async function getManifest() {
  const pkg = (await fs.readJSON(r('package.json'))) as typeof PkgType;

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description + (isDev ? '(开发版)' : ''),
    homepage_url: 'https://github.com/xlzy520/ones-helper',
    action: {
      default_title: pkg.displayName,
      default_icon: './assets/favicon16.png',
      default_popup: './dist/popup/index.html',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    background: {
      service_worker: './dist/background/background.global.js',
      // persistent: true,
    },
    devtools_page: './dist/devtools/index.html',
    icons: {
      16: './assets/favicon16.png',
      48: './assets/favicon128.png',
      128: './assets/favicon128.png',
    },
    permissions: [
      'cookies',
      'downloads',
      'downloads.open',
      'tabs',
      'storage',
      // 'webRequest',
      // 'webRequestBlocking',
      'contextMenus',
      'declarativeNetRequest',
      'declarativeNetRequestFeedback',
      // 'activeTab',
    ],
    host_permissions: ['*://*/*'],
    content_scripts: [
      {
        matches: [
          // 'https://github.com/BangWork/*',
          // 'https://ones.ai/*',
          // 'https://*.myones.net/*',
          // 'http://dev.localhost/*',
          // 'http://localhost/*',
          // 'http://112.74.163.102/*',
          '<all_urls>',
          'https://*/*',
          'https://*/*',
        ],
        js: ['./dist/contentScripts/index.global.js'],
        css: ['./dist/contentScripts/style.css'],
      },
    ],
    // web_accessible_resources: [
    //   {
    //     resources: ['./dist/contentScripts/style.css'],
    //     matches: [
    //       'https://github.com/BangWork/*',
    //       'https://ones.ai/*',
    //       'https://*.myones.net/*',
    //       'http://dev.localhost/*',
    //       'http://localhost/*',
    //       'http://112.74.163.102/*',
    //     ],
    //   },
    // ],
    omnibox: { keyword: 'ones' },
  };

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts;
    manifest.permissions?.push('webNavigation');

    // this is required on dev for Vite script to load
    manifest.content_security_policy = {
      extension_pages: isDev
        ? // this is required on dev for Vite script to load
          `script-src 'self' http://localhost:${port}; object-src 'self' http://localhost:${port}`
        : "script-src 'self'; object-src 'self'",
    };
  }

  return manifest;
}
