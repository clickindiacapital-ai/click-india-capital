const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.pnpm-store', '.vercel'];

let totalFiles = 0;
let totalSize = 0;

function walkDir(dir, prefix = '') {
  let output = '';
  const files = fs.readdirSync(dir);
  
  const entries = [];
  for (const file of files) {
    if (EXCLUDE_DIRS.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    entries.push({ file, stat, isDir: stat.isDirectory() });
  }
  
  // Sort: directories first
  entries.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.file.localeCompare(b.file);
  });
  
  for (let i = 0; i < entries.length; i++) {
    const { file, stat, isDir } = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    
    if (isDir) {
      output += `${prefix}${connector}**${file}/**\n`;
      output += walkDir(path.join(dir, file), prefix + (isLast ? '    ' : '│   '));
    } else {
      totalFiles++;
      totalSize += stat.size;
      const sizeStr = (stat.size / 1024).toFixed(1) + ' KB';
      output += `${prefix}${connector}${file} (${sizeStr})\n`;
    }
  }
  
  return output;
}

const rootDir = __dirname;
let treeOutput = walkDir(rootDir);

const report = `
# Codebase Review Report

## Executive Summary
This repository is a Monorepo structured with \`pnpm\` workspaces. It consists of multiple applications inside \`apps/\` and shared internal libraries inside \`packages/\`.
- **Total Files Tracked:** ${totalFiles}
- **Total Codebase Size:** ${(totalSize / 1024 / 1024).toFixed(2)} MB

## Directory Structure
\`\`\`text
${path.basename(rootDir)}/
${treeOutput}
\`\`\`

## Applications (\`apps/\`)
${fs.readdirSync(path.join(rootDir, 'apps')).map(app => {
  const appPath = path.join(rootDir, 'apps', app);
  if (!fs.statSync(appPath).isDirectory()) return '';
  let pkgName = app;
  let deps = '';
  if (fs.existsSync(path.join(appPath, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')));
    pkgName = pkg.name || app;
    deps = Object.keys(pkg.dependencies || {}).join(', ');
  }
  return '### ' + app + '\\n- **Package:** `' + pkgName + '`\\n- **Dependencies:** ' + (deps || 'None') + '\\n';
}).join('\n')}

## Packages (\`packages/\`)
${fs.readdirSync(path.join(rootDir, 'packages')).map(pkgDir => {
  const pkgPath = path.join(rootDir, 'packages', pkgDir);
  if (!fs.statSync(pkgPath).isDirectory()) return '';
  let pkgName = pkgDir;
  if (fs.existsSync(path.join(pkgPath, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json')));
    pkgName = pkg.name || pkgDir;
  }
  return '- **' + pkgName + '** (`packages/' + pkgDir + '`)\\n';
}).join('')}

## Architecture Overview
The project relies heavily on modern web stacks. The \`web\` app uses Vite, React, and Tailwind CSS. The monorepo utilizes shared packages to encapsulate UI components, types, services, and agents, allowing for strict boundaries and reusability across potential mobile or CRM applications.
`;

const artifactPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity-ide', 'brain', '5d560c23-a9ff-4d97-a4f8-4cc8a3072302', 'codebase_review.md');
fs.writeFileSync(artifactPath, report.trim());
console.log('Report generated at', artifactPath);
