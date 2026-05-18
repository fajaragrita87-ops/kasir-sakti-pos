const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:\\Users\\HP\\.gemini\\antigravity\\scratch\\kasir-sakti-pos', function(filePath) {
    if (!filePath.includes('.git') && !filePath.includes('node_modules') && !filePath.includes('dist')) {
        let ext = path.extname(filePath);
        if (['.tsx', '.ts', '.html', '.css', '.json', '.js', '.md'].includes(ext)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content
                .replace(/Kasir Sakti POS/g, 'JD POS')
                .replace(/Kasir Sakti/g, 'JD POS')
                .replace(/KasirSakti/g, 'JDPOS')
                .replace(/Sakti POS/g, 'JD POS')
                .replace(/SaktiPOS/g, 'JDPOS')
                .replace(/Sakti/g, 'Jagadaya')
                .replace(/saktipos/g, 'jdpos')
                .replace(/kasirsakti/g, 'jdpos')
                .replace(/sakti/g, 'jd');
            
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log('Updated:', filePath);
            }
        }
    }
});
