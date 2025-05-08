const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [192, 512];
  const inputSvg = path.join(__dirname, '../public/base-icon.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const output = path.join(outputDir, `android-chrome-${size}x${size}.png`);
    const outputMaskable = path.join(outputDir, `android-chrome-maskable-${size}x${size}.png`);

    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(output);

    // Copy for maskable icons
    await fs.copyFile(output, outputMaskable);
  }
}

generateIcons().catch(console.error); 