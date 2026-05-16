const sharp = require("sharp");

async function run() {
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#2563eb"
    }
  })
    .png()
    .composite([
      {
        input: Buffer.from(`
          <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="55%" font-size="180" text-anchor="middle" fill="white">C</text>
          </svg>
        `),
      },
    ])
    .toFile("./public/icon-512.png");

  await sharp("./public/icon-512.png")
    .resize(192, 192)
    .toFile("./public/icon-192.png");
}

run();