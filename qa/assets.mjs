import sharp from "sharp";
import fs from "node:fs";
const files = fs.readdirSync("public/images");
const tiles = await Promise.all(
  files.map(async (n, i) => ({
    input: await sharp("public/images/" + n)
      .resize(240, 150, { fit: "cover" })
      .extend({ bottom: 30, background: "#ffffff" })
      .composite([
        {
          input: Buffer.from(
            `<svg width="240" height="30"><text x="10" y="20" font-size="15">${n}</text></svg>`,
          ),
          top: 150,
          left: 0,
        },
      ])
      .png()
      .toBuffer(),
    left: (i % 4) * 240,
    top: Math.floor(i / 4) * 180,
  })),
);
await sharp({
  create: {
    width: 960,
    height: Math.ceil(files.length / 4) * 180,
    channels: 3,
    background: "#fff",
  },
})
  .composite(tiles)
  .png()
  .toFile("qa/assets.png");
