const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const targetDir = __dirname;

if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Run "npm run build:dev" first.');
    process.exit(1);
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
    }
}

['index.html', 'static'].forEach(item => {
    const src = path.join(buildDir, item);
    const dest = path.join(targetDir, item);
    
    if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        console.log(`✓ Copied ${item} to frontend root`);
    } else {
        console.warn(`⚠ ${item} not found in build directory`);
    }
});

console.log('✓ Build files copied successfully!');

