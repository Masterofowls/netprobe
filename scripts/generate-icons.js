const sharp = require("sharp");
const path = require("path");

const SIZE = 1024;
const FG_SIZE = 768;

// NetProbe icon: dark background (#1a1a2e) with a radar/pulse design
// Concentric rings + signal wave + center dot
const iconSvg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f3460"/>
      <stop offset="100%" style="stop-color:#533483"/>
    </linearGradient>
    <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="50%" style="stop-color:#0f3460"/>
      <stop offset="100%" style="stop-color:#00d2ff"/>
    </linearGradient>
    <radialGradient id="center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00d2ff"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#00d2ff" flood-opacity="0.4"/>
    </filter>
    <filter id="innerGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#e94560" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" rx="200" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.06" stroke="#fff" stroke-width="1">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${112 * (i + 1)}" y1="100" x2="${112 * (i + 1)}" y2="924"/>`).join("\n    ")}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="100" y1="${112 * (i + 1)}" x2="924" y2="${112 * (i + 1)}"/>`).join("\n    ")}
  </g>

  <!-- Outer radar ring -->
  <circle cx="512" cy="512" r="340" fill="none" stroke="#0f3460" stroke-width="3" opacity="0.4"/>
  <circle cx="512" cy="512" r="260" fill="none" stroke="#0f3460" stroke-width="2.5" opacity="0.35"/>
  <circle cx="512" cy="512" r="180" fill="none" stroke="#0f3460" stroke-width="2" opacity="0.3"/>

  <!-- Signal arcs (Wi-Fi-like) - left side -->
  <path d="M 290 400 A 200 200 0 0 1 290 624" fill="none" stroke="#00d2ff" stroke-width="28" stroke-linecap="round" opacity="0.9" filter="url(#shadow)"/>
  <path d="M 340 440 A 140 140 0 0 1 340 584" fill="none" stroke="#00d2ff" stroke-width="22" stroke-linecap="round" opacity="0.7"/>
  <path d="M 385 472 A 90 90 0 0 1 385 552" fill="none" stroke="#00d2ff" stroke-width="16" stroke-linecap="round" opacity="0.5"/>

  <!-- Signal arcs - right side -->
  <path d="M 734 400 A 200 200 0 0 0 734 624" fill="none" stroke="#e94560" stroke-width="28" stroke-linecap="round" opacity="0.9" filter="url(#innerGlow)"/>
  <path d="M 684 440 A 140 140 0 0 0 684 584" fill="none" stroke="#e94560" stroke-width="22" stroke-linecap="round" opacity="0.7"/>
  <path d="M 639 472 A 90 90 0 0 0 639 552" fill="none" stroke="#e94560" stroke-width="16" stroke-linecap="round" opacity="0.5"/>

  <!-- Center pulse dot -->
  <circle cx="512" cy="512" r="52" fill="url(#center)" filter="url(#shadow)"/>
  <circle cx="512" cy="512" r="32" fill="#00d2ff" opacity="0.9"/>
  <circle cx="512" cy="512" r="14" fill="#fff" opacity="0.95"/>

  <!-- Heartbeat/pulse line through center -->
  <polyline points="172,512 380,512 420,512 445,430 470,600 495,460 520,570 545,490 560,512 640,512 852,512"
    fill="none" stroke="url(#pulse)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>

  <!-- "NP" text at bottom -->
  <text x="512" y="850" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="88" fill="#fff" opacity="0.15" letter-spacing="16">NETPROBE</text>
</svg>`;

// Foreground SVG for adaptive icon (no background, just the design)
const foregroundSvg = `
<svg width="${FG_SIZE}" height="${FG_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="50%" style="stop-color:#0f3460"/>
      <stop offset="100%" style="stop-color:#00d2ff"/>
    </linearGradient>
    <radialGradient id="center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00d2ff"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00d2ff" flood-opacity="0.5"/>
    </filter>
    <filter id="innerGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#e94560" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Radar rings -->
  <circle cx="384" cy="384" r="280" fill="none" stroke="#0f3460" stroke-width="2.5" opacity="0.4"/>
  <circle cx="384" cy="384" r="210" fill="none" stroke="#0f3460" stroke-width="2" opacity="0.35"/>
  <circle cx="384" cy="384" r="140" fill="none" stroke="#0f3460" stroke-width="1.5" opacity="0.3"/>

  <!-- Signal arcs left -->
  <path d="M 180 290 A 160 160 0 0 1 180 478" fill="none" stroke="#00d2ff" stroke-width="22" stroke-linecap="round" opacity="0.9" filter="url(#shadow)"/>
  <path d="M 220 320 A 110 110 0 0 1 220 448" fill="none" stroke="#00d2ff" stroke-width="17" stroke-linecap="round" opacity="0.7"/>
  <path d="M 256 346 A 70 70 0 0 1 256 422" fill="none" stroke="#00d2ff" stroke-width="12" stroke-linecap="round" opacity="0.5"/>

  <!-- Signal arcs right -->
  <path d="M 588 290 A 160 160 0 0 0 588 478" fill="none" stroke="#e94560" stroke-width="22" stroke-linecap="round" opacity="0.9" filter="url(#innerGlow)"/>
  <path d="M 548 320 A 110 110 0 0 0 548 448" fill="none" stroke="#e94560" stroke-width="17" stroke-linecap="round" opacity="0.7"/>
  <path d="M 512 346 A 70 70 0 0 0 512 422" fill="none" stroke="#e94560" stroke-width="12" stroke-linecap="round" opacity="0.5"/>

  <!-- Center -->
  <circle cx="384" cy="384" r="42" fill="url(#center)" filter="url(#shadow)"/>
  <circle cx="384" cy="384" r="26" fill="#00d2ff" opacity="0.9"/>
  <circle cx="384" cy="384" r="11" fill="#fff" opacity="0.95"/>

  <!-- Pulse line -->
  <polyline points="90,384 270,384 300,384 320,318 342,456 364,340 386,438 408,364 424,384 500,384 678,384"
    fill="none" stroke="url(#pulse)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
</svg>`;

// Splash icon - larger center design on transparent background
const splashSvg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="50%" style="stop-color:#0f3460"/>
      <stop offset="100%" style="stop-color:#00d2ff"/>
    </linearGradient>
    <radialGradient id="center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00d2ff"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#00d2ff" flood-opacity="0.5"/>
    </filter>
    <filter id="innerGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#e94560" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Radar rings -->
  <circle cx="512" cy="440" r="320" fill="none" stroke="#0f3460" stroke-width="3" opacity="0.4"/>
  <circle cx="512" cy="440" r="240" fill="none" stroke="#0f3460" stroke-width="2.5" opacity="0.35"/>
  <circle cx="512" cy="440" r="160" fill="none" stroke="#0f3460" stroke-width="2" opacity="0.3"/>

  <!-- Signal arcs left -->
  <path d="M 260 320 A 200 200 0 0 1 260 560" fill="none" stroke="#00d2ff" stroke-width="26" stroke-linecap="round" opacity="0.9" filter="url(#shadow)"/>
  <path d="M 310 358 A 140 140 0 0 1 310 522" fill="none" stroke="#00d2ff" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
  <path d="M 354 390 A 90 90 0 0 1 354 490" fill="none" stroke="#00d2ff" stroke-width="14" stroke-linecap="round" opacity="0.5"/>

  <!-- Signal arcs right -->
  <path d="M 764 320 A 200 200 0 0 0 764 560" fill="none" stroke="#e94560" stroke-width="26" stroke-linecap="round" opacity="0.9" filter="url(#innerGlow)"/>
  <path d="M 714 358 A 140 140 0 0 0 714 522" fill="none" stroke="#e94560" stroke-width="20" stroke-linecap="round" opacity="0.7"/>
  <path d="M 670 390 A 90 90 0 0 0 670 490" fill="none" stroke="#e94560" stroke-width="14" stroke-linecap="round" opacity="0.5"/>

  <!-- Center -->
  <circle cx="512" cy="440" r="48" fill="url(#center)" filter="url(#shadow)"/>
  <circle cx="512" cy="440" r="30" fill="#00d2ff" opacity="0.9"/>
  <circle cx="512" cy="440" r="13" fill="#fff" opacity="0.95"/>

  <!-- Pulse line -->
  <polyline points="140,440 340,440 380,440 405,370 430,520 455,385 480,500 505,410 522,440 600,440 884,440"
    fill="none" stroke="url(#pulse)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>

  <!-- NETPROBE text -->
  <text x="512" y="700" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="72" fill="#fff" opacity="0.85" letter-spacing="12">NETPROBE</text>
  <text x="512" y="760" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="32" fill="#00d2ff" opacity="0.6" letter-spacing="8">CONNECTIVITY MONITOR</text>
</svg>`;

async function generate() {
  const projectRoot = path.resolve(__dirname, "..");
  const assetsDir = path.join(projectRoot, "assets");

  // 1. Main icon (1024x1024)
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, "icon.png"));
  console.log("✓ icon.png (1024x1024)");

  // 2. Adaptive icon foreground (768x768)
  await sharp(Buffer.from(foregroundSvg))
    .resize(768, 768)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, "adaptive-icon.png"));
  console.log("✓ adaptive-icon.png (768x768)");

  // 3. Splash icon (1024x1024 on transparent)
  await sharp(Buffer.from(splashSvg))
    .resize(1024, 1024)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, "splash-icon.png"));
  console.log("✓ splash-icon.png (1024x1024)");

  // 4. Favicon (48x48)
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, "favicon.png"));
  console.log("✓ favicon.png (48x48)");

  // 5. Generate all Android mipmap sizes from the icon
  const mipmaps = [
    { name: "mdpi", size: 48 },
    { name: "hdpi", size: 72 },
    { name: "xhdpi", size: 96 },
    { name: "xxhdpi", size: 144 },
    { name: "xxxhdpi", size: 192 },
  ];

  const androidResDir = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "res",
  );

  for (const mip of mipmaps) {
    const dir = path.join(androidResDir, `mipmap-${mip.name}`);
    await sharp(Buffer.from(iconSvg))
      .resize(mip.size, mip.size)
      .png({ quality: 100 })
      .toFile(path.join(dir, "ic_launcher.png"));

    // Round icon (circular crop)
    const roundSvg = `
    <svg width="${mip.size}" height="${mip.size}">
      <circle cx="${mip.size / 2}" cy="${mip.size / 2}" r="${mip.size / 2}" fill="white"/>
    </svg>`;
    await sharp(Buffer.from(iconSvg))
      .resize(mip.size, mip.size)
      .composite([
        {
          input: Buffer.from(roundSvg),
          blend: "dest-in",
        },
      ])
      .png({ quality: 100 })
      .toFile(path.join(dir, "ic_launcher_round.png"));

    console.log(`✓ mipmap-${mip.name} (${mip.size}x${mip.size})`);
  }

  // 6. Adaptive icon foreground for Android mipmaps
  const foregroundMipmaps = [
    { name: "mdpi", size: 108 },
    { name: "hdpi", size: 162 },
    { name: "xhdpi", size: 216 },
    { name: "xxhdpi", size: 324 },
    { name: "xxxhdpi", size: 432 },
  ];

  for (const mip of foregroundMipmaps) {
    const dir = path.join(androidResDir, `mipmap-${mip.name}`);
    await sharp(Buffer.from(foregroundSvg))
      .resize(mip.size, mip.size)
      .png({ quality: 100 })
      .toFile(path.join(dir, "ic_launcher_foreground.png"));
    console.log(
      `✓ mipmap-${mip.name}/ic_launcher_foreground.png (${mip.size}x${mip.size})`,
    );
  }

  console.log("\n✅ All icons generated!");
}

generate().catch(console.error);
