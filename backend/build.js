const fs = require('fs');
const path = require('path');

// Copy node_modules to dist for Lambda
const copyNodeModules = () => {
  const srcDir = path.join(__dirname, 'node_modules');
  const destDir = path.join(__dirname, 'dist', 'node_modules');
  
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log('✅ Copied node_modules to dist/');
  }
};

// Copy package.json to dist
const copyPackageJson = () => {
  const srcFile = path.join(__dirname, 'package.json');
  const destFile = path.join(__dirname, 'dist', 'package.json');
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log('✅ Copied package.json to dist/');
  }
};

copyNodeModules();
copyPackageJson();
console.log('🎉 Build completed!');