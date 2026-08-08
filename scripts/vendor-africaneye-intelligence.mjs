#!/usr/bin/env node
/**
 * Build-time vendor for the AfrOsint MAIN FRONTEND.
 * AfrOsint is read-only. This script writes only to AfricanEye.
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
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`GitHub request failed ${r.status}: ${url}`);
  return r.json();
}

function isBackendPath(p) {
  const n = p.toLowerCase();
  return n === 'firebase.json' || n === 'firestore.rules' || n === 'storage.rules' ||
    n.startsWith('login/') || n.startsWith('functions/') || n.startsWith('backend/') ||
    n.startsWith('server/') || n.includes('afrosint-auth') || n.includes('permissions') ||
    n === 'verify_ranks.py' || n === 'cname' || n === 'readme.md' || n === 'reports.md';
}

function isMainFrontendPath(p) {
  return p === 'index.html' || p.startsWith('css/') || p.startsWith('js/') || p.startsWith('assets/');
}

function isFrontendAsset(p) {
  return /\.(html?|css|js|mjs|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp4|webm)$/i.test(p);
}

function rewriteText(text) {
  let s = text
    .replace(/AfrOsint/g, 'AfricanEye')
    .replace(/AFROSINT/g, 'AFRICANEYE')
    .replace(/afrosint/gi, 'africaneye');
  s = s.replace(/<script[^>]+(?:firebase|permissions|africaneye-auth|africaneye-auth|afrosint-auth)[^>]*><\/script>\s*/gi, '');
  s = s.replace(/<link[^>]+(?:firebase|permissions|afrosint)[^>]*>\s*/gi, '');
  s = s.replace(/<div id=["']authLoadingScreen["'][\s\S]*?<div id=["']mainAppContainer["'][^>]*>/i, '<div id="mainAppContainer">');
  return s;
}

async function main() {
  const tree = await get(`${apiRoot}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  if (tree.truncated) throw new Error('AfrOsint tree is truncated; aborting rather than creating a partial vendor.');

  await fs.rm(outRoot, { recursive: true, force: true });
  await fs.mkdir(outRoot, { recursive: true });

  for (const entry of tree.tree) {
    if (entry.type !== 'blob' || isBackendPath(entry.path) || !isMainFrontendPath(entry.path) || !isFrontendAsset(entry.path)) continue;
    const raw = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${entry.path}`, { headers: { 'User-Agent': 'AfricanEye-Frontend-Vendor' } });
    if (!raw.ok) throw new Error(`Unable to fetch ${entry.path}: ${raw.status}`);
    let relative = entry.path;
    if (relative.toLowerCase().includes('afrosint logo')) continue;
    const destination = path.join(outRoot, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    if (/\.(html?|css|js|mjs|json)$/i.test(relative)) {
      await fs.writeFile(destination, rewriteText(await raw.text()), 'utf8');
    } else {
      await fs.writeFile(destination, Buffer.from(await raw.arrayBuffer()));
    }
  }

  // AfricanEye-owned replacement for the source logo; no AfrOsint logo is copied.
  const logoDir = path.join(outRoot, 'assets', 'images');
  await fs.mkdir(logoDir, { recursive: true });
  await fs.writeFile(path.join(logoDir, 'africaneye-logo.svg'), `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160"><rect width="600" height="160" rx="20" fill="#02070d"/><circle cx="82" cy="80" r="54" fill="none" stroke="#00ffee" stroke-width="5"/><path d="M45 80 Q82 40 119 80 Q82 120 45 80Z" fill="none" stroke="#00ffee" stroke-width="4"/><circle cx="82" cy="80" r="12" fill="#d6b36a"/><text x="155" y="92" fill="#fff" font-family="Arial,sans-serif" font-size="58" font-weight="700">AfricanEye</text></svg>`, 'utf8');

  const index = path.join(outRoot, 'index.html');
  let html = await fs.readFile(index, 'utf8');
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>AfricanEye Intelligence</title>');
  html = html.replace(/assets\/images\/[^"']*AFRICANEYE[^"']*\.(?:png|jpg|jpeg)/i, 'assets/images/africaneye-logo.svg');
  html = html.replace(/assets\/images\/[^"']*africaneye[^"']*logo[^"']*\.(?:png|jpg|jpeg)/i, 'assets/images/africaneye-logo.svg');
  html = rewriteText(html);
  await fs.writeFile(index, html, 'utf8');

  console.log(`Vendored frontend into ${outRoot}`);
}

main().catch(error => { console.error(error); process.exit(1); });
