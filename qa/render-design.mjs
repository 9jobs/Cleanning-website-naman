import sharp from "sharp";
for (const w of [390, 1440])
  await sharp(`design/home-${w}.svg`)
    .extract({ left: 0, top: 0, width: w, height: 1000 })
    .png()
    .toFile(`qa/design-${w}.png`);
console.log("Rendered desktop and mobile design exports for inspection.");
