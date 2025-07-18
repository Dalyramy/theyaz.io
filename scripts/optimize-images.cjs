const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/icons');
const outputDir = inputDir;

async function optimizeImages() {
  try {
    const files = fs.readdirSync(inputDir)
      .filter(file => /\.(jpe?g|png)$/i.test(file))
      .map(file => path.join(inputDir, file));

    if (files.length === 0) {
      console.log('No images found to optimize.');
      return;
    }

    for (const file of files) {
      const filename = path.basename(file, path.extname(file));
      
      // Optimize to JPEG
      await sharp(file)
        .jpeg({ quality: 80, progressive: true })
        .toFile(path.join(outputDir, `${filename}.jpg`));

      // Optimize to WebP
      await sharp(file)
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${filename}.webp`));

      console.log(`Optimized ${path.basename(file)}`);
    }

    console.log('Images optimized to JPEG and WebP in', outputDir);
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages(); 