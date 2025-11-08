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
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

['index.html', 'static'].forEach(item => {
    const src = path.join(buildDir, item);
    const dest = path.join(targetDir, item);
    
    if (fs.existsSync(src)) {
        if (fs.existsSync(dest)) {
            if (fs.statSync(dest).isDirectory()) {
                fs.rmSync(dest, { recursive: true, force: true });
            } else {
                fs.unlinkSync(dest);
            }
        }
        copyRecursive(src, dest);
        console.log(`Copied ${item} to frontend root`);
    }
});

console.log('Build files copied successfully!');

