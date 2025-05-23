const imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const webp = require('imagemin-webp');
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
    destination: outputDir,
    plugins: [mozjpeg({ quality: 80 })],
  });

  // Optimize to WebP
  await imagemin(files, {
    destination: outputDir,
    plugins: [webp({ quality: 80 })],
  });

  console.log('Images optimized to JPEG and WebP in', outputDir);
})(); 