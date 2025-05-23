const imagemin = require('imagemin').default;
const mozjpeg = require('imagemin-mozjpeg').default;
const webp = require('imagemin-webp').default;
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/icons');
const outputDir = inputDir;

(async () => {
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpe?g|png)$/i.test(file))
    .map(file => path.join(inputDir, file));

  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  // Optimize to JPEG
  await imagemin(files, {
    plugins: [mozjpeg({ quality: 80 })],
    destination: outputDir,
  });

  // Optimize to WebP
  await imagemin(files, {
    plugins: [webp({ quality: 80 })],
    destination: outputDir,
  });

  console.log('Images optimized to JPEG and WebP in', outputDir);
})(); 