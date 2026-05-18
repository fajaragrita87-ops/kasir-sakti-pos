import https from 'https';
import fs from 'fs';
import path from 'path';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const dir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  console.log('Downloading 192x192 icon...');
  await download('https://ui-avatars.com/api/?name=V&size=192&background=0f172a&color=fff&format=png', path.join(dir, 'icon-192x192.png'));
  
  console.log('Downloading 512x512 icon...');
  await download('https://ui-avatars.com/api/?name=V&size=512&background=0f172a&color=fff&format=png', path.join(dir, 'icon-512x512.png'));
  
  console.log('Done!');
}

main();
