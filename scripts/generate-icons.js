const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const sizes = [16, 24, 32, 48, 64, 128, 256, 512];

app.whenReady().then(async () => {
  const sourcePath = path.join(__dirname, '..', 'build', 'icon.svg');
  const outputDir = path.join(__dirname, '..', 'build', 'icons');
  const window = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true
  });

  await window.loadFile(sourcePath);
  const source = await window.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });

  fs.mkdirSync(outputDir, { recursive: true });
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${size}x${size}.png`);
    fs.writeFileSync(outputPath, source.resize({ width: size, height: size, quality: 'best' }).toPNG());
  }

  console.log(`ICON_BUILD_OK ${sizes.length} sizes`);
  window.destroy();
  app.exit(0);
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
