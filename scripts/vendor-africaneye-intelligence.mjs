#!/usr/bin/env node
/**
 * Vendor the AfrOsint MAIN FRONTEND into AfricanEye without modifying AfrOsint.
 *
 * Source: BlackSurvivalGear/AfrOsint (read-only)
 * Destination: AfricanEye/assets/africaneye-intelligence
 *
 * This is intentionally a build-time operation. The resulting AfricanEye app
 * has no runtime dependency on the AfrOsint repository.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const owner = 'BlackSurvivalGear';
const repo = 'AfrOsint';
const ref = process.env.AFROSINT_REF || 'main';
const apiRoot = `https://api.github.com/repos/${owner}/${repo}`;
const outRoot = path.resolve('assets/africaneye-intelligence');

const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'AfricanEye-Frontend-Vendor' };

async function get(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub request failed ${response.status}: ${url}`);
  return response.json();
}

function isBackendPath(p) {
  const n = p.toLowerCase();
  return n === 'firebase.json' || n.startsWith('login/') || n.startsWith('functions/') ||
    n.startsWith('backend/') || n.startsWith('server/') || n.includes('afrosint-auth') ||
    n.includes('permissions');
}

function isFrontendAsset(p) {
  return /\.(html?|css|js|mjs|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf)$/i.test(p);
}

function rewriteText(file, text) {
  let s = text;
  s = s.replace(/AfrOsint/g, 'AfricanEye').replace(/AFROSINT/g, 'AFRICANEYE').replace(/afrosint/gi, 'africaneye');
  s = s.replace(/<script[^>]+(?:firebase|permissions|africaneye-auth|afrosint-auth)[^>]*><\/script>\s*/gi, '');
  s = s.replace(/<link[^>]+(?:firebase|permissions|afrosint)[^>]*>\s*/gi, '');
  s = s.replace(/<script[^>]*>[^<]*(?:firebase|handleLogout|authLoadingScreen)[\s\S]*?<\/script>/gi, '');
  s = s.replace(/id=["']authLoadingScreen["'][\s\S]*?<\/div>\s*<div id=["']mainAppContainer["'][^>]*>/i, '<div id="mainAppContainer">');
  return s;
}

async function main() {
  const tree = await get(`${apiRoot}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  if (tree.truncated) throw new Error('AfrOsint tree is truncated; aborting rather than creating a partial vendor.');

  await fs.rm(outRoot, { recursive: true, force: true });
  await fs.mkdir(outRoot, { recursive: true });

  for (const entry of tree.tree) {
    if (entry.type !== 'blob' || isBackendPath(entry.path) || !isFrontendAsset(entry.path)) continue;

    const raw = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${entry.path}`,
      { headers: { 'User-Agent': 'AfricanEye-Frontend-Vendor' } });
    if (!raw.ok) throw new Error(`Unable to fetch ${entry.path}: ${raw.status}`);

    const relative = entry.path;
    const destination = path.join(outRoot, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });

    if (/\.(html?|css|js|mjs|json)$/i.test(relative)) {
      await fs.writeFile(destination, rewriteText(relative, await raw.text()), 'utf8');
    } else {
      const bytes = Buffer.from(await raw.arrayBuffer());
      await fs.writeFile(destination, bytes);
    }
  }

  // Replace the source entry point with an explicitly frontend-only version.
  const index = path.join(outRoot, 'index.html');
  let html = await fs.readFile(index, 'utf8');
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>AfricanEye Intelligence</title>');
  html = html.replace(/<div id=["']authLoadingScreen["'][\s\S]*?<div id=["']mainAppContainer["'][^>]*>/i, '<div id="mainAppContainer">');
  html = html.replace(/<script[^>]+(?:firebase|permissions|africaneye-auth|afrosint-auth)[^>]*><\/script>\s*/gi, '');
  await fs.writeFile(index, html, 'utf8');

  console.log(`Vendored AfrOsint frontend into ${outRoot}`);
}

main().catch(error => { console.error(error); process.exit(1); });
