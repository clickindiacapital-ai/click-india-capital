const fs = require('fs');
const path = require('path');

const packages = [
  'shared-types',
  'shared-services',
  'shared-ui',
  'shared-agents',
  'shared-audit',
  'shared-events',
  'shared-governance'
];

const basePath = path.join(__dirname, 'packages');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}

const packageJsonTemplate = (name) => `{
  "name": "@click-india/${name}",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.2.2"
  }
}
`;

const tsconfigJsonTemplate = `{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["src"]
}
`;

const indexTsTemplate = `export const hello = "world";\n`;

for (const pkg of packages) {
  const pkgPath = path.join(basePath, pkg);
  if (!fs.existsSync(pkgPath)) {
    fs.mkdirSync(pkgPath);
  }
  
  const srcPath = path.join(pkgPath, 'src');
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }

  fs.writeFileSync(path.join(pkgPath, 'package.json'), packageJsonTemplate(pkg));
  fs.writeFileSync(path.join(pkgPath, 'tsconfig.json'), tsconfigJsonTemplate);
  
  // For UI package, maybe export a dummy component to be safe, but a string is fine for minimal scaffolding.
  let indexContent = indexTsTemplate;
  if (pkg === 'shared-ui') {
     // use jsx for UI
     fs.writeFileSync(path.join(srcPath, 'index.tsx'), `import * as React from 'react';\nexport const Dummy = () => <div>Dummy</div>;\n`);
     const uiPackageJson = packageJsonTemplate(pkg).replace('"dependencies": {}', '"dependencies": {\n    "react": "^18.3.1"\n  }');
     fs.writeFileSync(path.join(pkgPath, 'package.json'), uiPackageJson.replace('src/index.ts', 'src/index.tsx').replace('src/index.ts', 'src/index.tsx'));
  } else {
     fs.writeFileSync(path.join(srcPath, 'index.ts'), indexContent);
  }
}

console.log('Scaffolding complete!');
