import fs from "node:fs/promises";
import path from "node:path";
const out = "design";
await fs.mkdir(out, { recursive: true });
const c = {
  navy: "#123C5A",
  aqua: "#25B7C4",
  teal: "#42C7BC",
  light: "#EAF9FA",
  soft: "#F7FBFC",
  white: "#FFFFFF",
  text: "#16313D",
  secondary: "#61747D",
  border: "#DEEAED",
};
await fs.writeFile(
  path.join(out, "tokens.json"),
  JSON.stringify(
    {
      brand: "Clearora Cleaning Co.",
      colours: c,
      typography: {
        heading: "Manrope",
        body: "Inter",
        headingWeight: 700,
        bodyWeight: 400,
      },
      spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      radius: { button: 9, input: 8, card: 20, section: 26 },
      breakpoints: [375, 390, 430, 768, 1024, 1280, 1440],
      motion: {
        micro: 200,
        reveal: 650,
        image: 800,
        easing: [0.22, 1, 0.36, 1],
        reducedMotion: "Disable movement and reveal immediately",
      },
    },
    null,
    2,
  ),
);
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const photos = {};
for (const name of [
  "hero",
  "regular",
  "deep",
  "lease",
  "commercial",
  "airbnb",
  "carpet",
  "team",
])
  photos[name] =
    "data:image/jpeg;base64," +
    (await fs.readFile(`public/images/${name}.jpg`)).toString("base64");
function art(w, type) {
  let a = [],
    y = 0;
  const mobile = w < 700,
    pad = mobile ? 20 : w < 1100 ? 32 : 64,
    inner = w - 2 * pad;
  const rect = (x, y, width, height, fill = c.white, r = 0, stroke = "none") =>
    a.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`,
    );
  const text = (s, x, y, size = 14, fill = c.navy, weight = 400) =>
    a.push(
      `<text x="${x}" y="${y}" font-family="${weight >= 600 ? "Manrope" : "Inter"}, Arial, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(s)}</text>`,
    );
  const lines = (
    s,
    x,
    y,
    width,
    size = 14,
    fill = c.secondary,
    weight = 400,
  ) => {
    const chars = Math.floor(width / (size * 0.53));
    let line = "",
      row = 0;
    for (const word of s.split(" ")) {
      if ((line + " " + word).length > chars && line) {
        text(line, x, y + row * size * 1.65, size, fill, weight);
        row++;
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) {
      text(line, x, y + row * size * 1.65, size, fill, weight);
      row++;
    }
    return row * size * 1.65;
  };
  const photo = (name, x, y, width, height) => {
    const id = `clip${a.length}`;
    a.push(
      `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20"/></clipPath></defs><image href="${photos[name]}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`,
    );
  };
  const button = (s, x, y, width = 175, secondary = false) => {
    rect(
      x,
      y,
      width,
      48,
      secondary ? c.white : c.aqua,
      9,
      secondary ? c.border : "none",
    );
    text(s, x + 18, y + 29, 12, c.navy, 700);
    text("→", x + width - 28, y + 29, 16, c.navy);
  };
  const heading = (eyebrow, title, desc) => {
    text(eyebrow.toUpperCase(), pad, y + 16, 10, "#087781", 700);
    y += 50;
    y += lines(title, pad, y, inner, mobile ? 32 : 44, c.navy, 700);
    if (desc) {
      y += 12;
      y += lines(desc, pad, y, Math.min(inner, 680), 14);
    }
    y += 35;
  };
  const field = (name, value, x, yy, width) => {
    text(name, x, yy, 11, c.navy, 600);
    rect(x, yy + 11, width, 46, c.soft, 8, c.border);
    text(value, x + 13, yy + 40, 12, c.secondary);
  };
  rect(0, 0, w, 30, c.navy);
  text(
    "Clean Spaces. Better Living.",
    mobile ? pad : w / 2 - 100,
    20,
    9,
    "#D8EFF3",
  );
  rect(0, 30, w, 82, c.white);
  text("✳", pad, 80, 27, c.aqua);
  text("clearora", pad + 36, 75, 27, c.navy, 700);
  text("CLEANING CO.", pad + 38, 91, 7, c.navy, 600);
  if (!mobile && w >= 1100) {
    text(
      "Home     Who We Are     Services     Pricing     Service Areas     Reviews     Contact",
      pad + 225,
      77,
      11,
      c.secondary,
    );
    button("Book a Clean", w - pad - 160, 47, 160);
  } else text("☰", w - pad - 22, 80, 24, c.navy);
  y = 112;
  if (type === "home") {
    const top = y;
    rect(0, top, w, mobile ? 905 : 600, c.soft);
    text("THE CLEARORA STANDARD", pad, top + 62, 10, "#087781", 700);
    const tw = mobile ? inner : inner * 0.5;
    let yy = top + 125;
    for (const [i, line] of [
      "Professional",
      "Cleaning.",
      "Beautifully Done.",
    ].entries()) {
      text(line, pad, yy, mobile ? 43 : 64, i === 2 ? "#168E98" : c.navy, 700);
      yy += mobile ? 52 : 74;
    }
    yy += 8;
    yy += lines(
      "From everyday homes to busy workplaces, we take care of the cleaning. So you can make room for what matters.",
      pad,
      yy,
      tw - 20,
      mobile ? 14 : 15,
    );
    button("Book a Clean", pad, yy + 18, mobile ? 155 : 175);
    button(
      "Explore Services",
      pad + (mobile ? 169 : 190),
      yy + 18,
      mobile ? inner - 169 : 175,
      true,
    );
    if (mobile) {
      photo("hero", pad, top + 495, inner, 350);
      y = top + 920;
    } else {
      photo("hero", pad + inner * 0.55, top + 60, inner * 0.45, 450);
      rect(w - pad - 210, top + 92, 230, 66, c.white, 13, c.border);
      text("A considered clean", w - pad - 190, top + 119, 12, c.navy, 700);
      text("Care in every detail", w - pad - 190, top + 140, 10, c.secondary);
      y = top + 625;
    }
    rect(pad, y, inner, mobile ? 370 : 120, c.white, 15, c.border);
    if (mobile) {
      for (const [i, [n, v]] of [
        ["Cleaning service", "Regular House Cleaning"],
        ["Property", "House"],
        ["Bedrooms / Bathrooms", "2 bedrooms · 1 bathroom"],
        ["Postcode", "e.g. 3000"],
      ].entries())
        field(n, v, pad + 20, y + 27 + i * 72, inner - 40);
      button("Get My Quote", pad + 20, y + 310, inner - 40);
      y += 420;
    } else {
      const fw = (inner - 230) / 4;
      for (const [i, [n, v]] of [
        ["Cleaning service", "Regular House Cleaning"],
        ["Property", "House"],
        ["Rooms", "2 bed · 1 bath"],
        ["Postcode", "e.g. 3000"],
      ].entries())
        field(n, v, pad + 20 + i * fw, y + 27, fw - 15);
      button("Get My Quote", w - pad - 190, y + 45, 170);
      y += 180;
    }
    heading(
      "What we do",
      "A fresh start for every space.",
      "The everyday upkeep. The big reset. The new beginning. Find the clean that fits your life.",
    );
  }
  if (type === "services") {
    rect(0, y, w, 290, c.light);
    y += 45;
    heading(
      "Our Services",
      "Professional cleaning for every space.",
      "Your everyday home. Your next chapter. Your place of work. Find the cleaning service that fits.",
    );
    y = 435;
    for (const [i, s] of [
      "All services",
      "Residential",
      "Commercial",
      "Specialist",
    ].entries()) {
      if (mobile) {
        if (i === 0) button(s, pad, y, inner, true);
      } else button(s, pad + i * 155, y, 145, i !== 0);
    }
    y += 85;
  }
  if (type === "home" || type === "services") {
    const list = [
      [
        "regular",
        "Regular House Cleaning",
        "Thoughtful care for a fresh everyday home.",
      ],
      ["deep", "Deep Cleaning", "A fresh start, down to the details."],
      [
        "lease",
        "End of Lease Cleaning",
        "A considered clean for your next chapter.",
      ],
      ["commercial", "Commercial Cleaning", "A better space to do business."],
      ["airbnb", "Airbnb Cleaning", "A thoughtful welcome for every guest."],
      ["carpet", "Carpet Cleaning", "A refresh from the floor up."],
    ];
    const cols = mobile ? 1 : w < 1050 ? 2 : 3,
      cw = (inner - (cols - 1) * 24) / cols,
      ch = 390;
    for (const [i, [img, title, desc]] of list.entries()) {
      const xx = pad + (i % cols) * (cw + 24),
        yy = y + Math.floor(i / cols) * (ch + 24);
      rect(xx, yy, cw, ch, c.white, 20, c.border);
      photo(img, xx, yy, cw, 205);
      text(title, xx + 22, yy + 245, mobile ? 20 : 19, c.navy, 700);
      lines(desc, xx + 22, yy + 273, cw - 44, 12);
      text("Explore service →", xx + 22, yy + 355, 12, "#087781", 700);
    }
    y += Math.ceil(list.length / cols) * (ch + 24) + 65;
    if (type === "home") {
      rect(0, y, w, mobile ? 740 : 550, c.soft);
      if (mobile) {
        photo("lease", pad, y + 35, inner, 300);
        y += 385;
        heading(
          "Moving on, beautifully",
          "Moving out? Leave the cleaning to us.",
          "A room-by-room cleaning plan, a clear scope and thoughtful extras for your move.",
        );
        button("Explore End of Lease", pad, y, inner);
        y += 90;
      } else {
        photo("lease", pad, y + 50, inner * 0.46, 430);
        let yy = y + 130;
        yy += lines(
          "Moving out? Leave the cleaning to us.",
          pad + inner * 0.55,
          yy,
          inner * 0.43,
          40,
          c.navy,
          700,
        );
        lines(
          "There’s enough on your moving-day list. Let us help with a detailed clean tailored to your property.",
          pad + inner * 0.55,
          yy + 20,
          inner * 0.43,
          15,
        );
        button("Explore End of Lease", pad + inner * 0.55, yy + 125, 230);
        y += 610;
      }
      heading(
        "The difference is in the details",
        "A better cleaning experience starts here.",
        "Your schedule, considered. Details that matter. People you can talk to.",
      );
      photo("team", pad, y, inner, mobile ? 260 : 400);
      y += mobile ? 315 : 460;
      heading(
        "Less to do. More to enjoy.",
        "A cleaner space in three simple steps.",
      );
      for (const [i, [title, desc]] of [
        ["Choose your clean", "Find the service that suits your space."],
        ["Make it work for you", "Agree on scope, availability and price."],
        ["Enjoy your fresh start", "Take back a little time for yourself."],
      ].entries()) {
        const xx = mobile ? pad : pad + i * (inner / 3);
        const yy = mobile ? y + i * 150 : y;
        rect(xx, yy, 45, 45, c.navy, 12);
        text("0" + (i + 1), xx + 12, yy + 28, 14, c.white, 600);
        text(
          title,
          xx + (mobile ? 65 : 0),
          yy + (mobile ? 25 : 80),
          20,
          c.navy,
          700,
        );
        lines(
          desc,
          xx + (mobile ? 65 : 0),
          yy + (mobile ? 52 : 110),
          mobile ? inner - 65 : inner / 3 - 40,
          13,
        );
      }
      y += mobile ? 480 : 220;
      heading(
        "Clear scope. Considered pricing.",
        "Your clean, without the guesswork.",
        "Every space is different. Build your cleaning plan and send it to the team for a personalised quote.",
      );
      button("Build my cleaning plan", pad, y, 230);
      y += 120;
      heading(
        "Good questions. Clear answers.",
        "A little clarity before your clean.",
      );
      for (const [i, q] of [
        "How do I book a clean?",
        "What is included in a regular clean?",
        "Do you clean in my suburb?",
      ].entries()) {
        rect(pad, y + i * 64, inner, 58, c.soft, 10, c.border);
        text(q, pad + 16, y + i * 64 + 35, mobile ? 12 : 14, c.navy, 600);
        text("+", w - pad - 30, y + i * 64 + 35, 18, "#087781");
      }
      y += 250;
    }
  }
  if (type === "pricing" || type === "booking") {
    rect(0, y, w, mobile ? 310 : 290, c.light);
    y += 48;
    heading(
      type === "pricing" ? "Pricing & Quotes" : "Book a Clean",
      type === "pricing"
        ? "Professional Cleaning With Transparent Pricing"
        : "Your fresh start begins here.",
      type === "pricing"
        ? "Build a cleaning plan around your space. Confirm scope and price before you commit."
        : "Choose your service and request your preferred appointment. We’ll confirm the details with you.",
    );
    y = mobile ? 480 : 460;
    const formW = mobile ? inner : inner * 0.62,
      sideW = inner - formW - 32,
      formX = pad,
      formY = y;
    rect(
      formX,
      formY,
      formW,
      type === "pricing" ? 740 : 780,
      c.white,
      22,
      c.border,
    );
    text(
      type === "pricing" ? "MAKE IT YOURS" : "STEP 1 OF 6",
      formX + 25,
      formY + 37,
      10,
      "#087781",
      700,
    );
    lines(
      type === "pricing"
        ? "Every home is different. Your clean should be, too."
        : "Choose your clean.",
      formX + 25,
      formY + 78,
      formW - 50,
      28,
      c.navy,
      700,
    );
    if (type === "pricing") {
      const yy = formY + 175;
      field("Property type", "House", formX + 25, yy, formW - 50);
      field(
        "Bedrooms / Bathrooms",
        "2 bedrooms · 1 bathroom",
        formX + 25,
        yy + 90,
        formW - 50,
      );
      field(
        "Cleaning frequency",
        "Fortnightly",
        formX + 25,
        yy + 180,
        formW - 50,
      );
      text(
        "Little extras, big difference",
        formX + 25,
        yy + 285,
        13,
        c.navy,
        600,
      );
      for (const [i, s] of [
        "Oven cleaning",
        "Fridge cleaning",
        "Interior windows",
        "Carpet cleaning",
      ].entries()) {
        rect(
          formX + 25,
          yy + 310 + i * 43,
          formW - 50,
          34,
          c.soft,
          7,
          c.border,
        );
        text("□   " + s, formX + 37, yy + 332 + i * 43, 12, c.navy);
      }
      field(
        "Australian postcode",
        "e.g. 3000",
        formX + 25,
        yy + 510,
        formW - 50,
      );
    } else {
      const options = [
        ["Regular House Cleaning", "Thoughtful care for your everyday spaces."],
        ["Deep Cleaning", "A fresh start, down to the details."],
        ["End of Lease Cleaning", "One less thing on your moving-day list."],
        ["Commercial Cleaning", "A better place to do business."],
      ];
      for (const [i, [title, desc]] of options.entries()) {
        const yy = formY + 145 + i * 135;
        rect(
          formX + 25,
          yy,
          formW - 50,
          115,
          i === 0 ? c.light : c.soft,
          12,
          i === 0 ? "#158590" : c.border,
        );
        text(title, formX + 42, yy + 38, mobile ? 16 : 20, c.navy, 700);
        lines(desc, formX + 42, yy + 66, formW - 85, 12);
        text(i === 0 ? "●" : "○", formX + formW - 60, yy + 32, 18, "#158590");
      }
      button("Continue →", formX + 25, formY + 710, formW - 50);
    }
    const sy = mobile ? formY + (type === "pricing" ? 780 : 820) : formY,
      sx = mobile ? pad : pad + formW + 32,
      sw = mobile ? inner : sideW;
    rect(sx, sy, sw, 430, c.navy, 22);
    text("YOUR CLEANING PLAN", sx + 25, sy + 40, 10, "#8DE4DF", 700);
    lines(
      "A clearer kind of clean.",
      sx + 25,
      sy + 75,
      sw - 50,
      21,
      c.white,
      700,
    );
    for (const [i, [label, value]] of [
      ["Property", "House"],
      ["Rooms", "2 bed · 1 bath"],
      ["Frequency", "Fortnightly"],
      ["Extras", "None selected"],
    ].entries()) {
      text(label, sx + 25, sy + 135 + i * 38, 12, "#C4DCE5");
      text(value, sx + sw - 130, sy + 135 + i * 38, 12, c.white);
    }
    text("PERSONALISED QUOTE", sx + 25, sy + 315, 10, "#8DE4DF", 600);
    lines("Made for your space.", sx + 25, sy + 345, sw - 50, 20, c.white, 700);
    lines(
      "No payment collected. Price and availability are confirmed by the team.",
      sx + 25,
      sy + 385,
      sw - 50,
      11,
      "#C4DCE5",
    );
    y = mobile ? sy + 490 : formY + 850;
  }
  rect(pad, y, inner, mobile ? 310 : 280, c.light, 26);
  text("A LITTLE MORE TIME FOR YOU", pad + 25, y + 50, 10, "#087781", 700);
  lines(
    "Your space, at its best.",
    pad + 25,
    y + 105,
    inner - 50,
    mobile ? 32 : 43,
    c.navy,
    700,
  );
  lines(
    "Tell us what you need. We’ll help you find your fresh start.",
    pad + 25,
    y + (mobile ? 175 : 160),
    inner - 50,
    13,
  );
  button("Book a Clean", pad + 25, y + (mobile ? 225 : 200), 180);
  y += mobile ? 370 : 350;
  rect(0, y, w, mobile ? 390 : 230, c.soft);
  text("clearora", pad, y + 60, 28, c.navy, 700);
  text("Clean Spaces. Better Living.", pad, y + 95, 12, c.secondary);
  lines(
    "Who We Are · Services · Pricing · Service Areas · Reviews · Contact · Careers · Journal · FAQs",
    pad,
    y + 140,
    inner,
    12,
  );
  lines(
    "© 2026 Clearora Cleaning Co. All Rights Reserved.",
    pad,
    y + (mobile ? 260 : 195),
    inner,
    10,
  );
  y += mobile ? 390 : 230;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${y}" viewBox="0 0 ${w} ${y}"><title>Clearora ${type} — ${w}px editable design layout</title><rect width="${w}" height="${y}" fill="white"/>${a.join("")}</svg>`;
}
for (const w of [390, 768, 1024, 1280, 1440])
  for (const type of ["home", "services", "pricing", "booking"])
    await fs.writeFile(path.join(out, `${type}-${w}.svg`), art(w, type));
const mark = `<path d="M37 16a19 19 0 1 0 0 32" fill="none" stroke="CURRENT" stroke-width="6" stroke-linecap="round"/><path d="m45 16 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#25B7C4"/>`;
for (const [name, colour] of [
  ["primary", "#123C5A"],
  ["dark", "#16313D"],
  ["light", "#FFFFFF"],
]) {
  await fs.mkdir("public/brand", { recursive: true });
  await fs.writeFile(
    `public/brand/logo-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="70" viewBox="0 0 280 70">${mark.replace("CURRENT", colour)}<text x="73" y="38" font-family="Manrope,Arial,sans-serif" font-size="36" font-weight="700" letter-spacing="-1.5" fill="${colour}">clearora</text><text x="76" y="56" font-family="Inter,Arial,sans-serif" font-size="9" letter-spacing="3.3" fill="${colour}">CLEANING CO.</text></svg>`,
  );
}
await fs.writeFile(
  "design/components.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="430"><rect width="960" height="430" fill="#F7FBFC"/><text x="40" y="55" font-family="Manrope,Arial" font-size="28" fill="#123C5A">Clearora — components &amp; states</text>${["Default", "Hover", "Disabled", "Secondary"].map((s, i) => `<g><text x="${40 + i * 225}" y="110" font-family="Inter,Arial" font-size="12" fill="#61747D">${s}</text><rect x="${40 + i * 225}" y="130" width="190" height="52" rx="9" fill="${i === 1 ? "#42C7BC" : i === 3 ? "white" : "#25B7C4"}" stroke="#DEEAED" opacity="${i === 2 ? 0.45 : 1}"/><text x="${62 + i * 225}" y="162" font-family="Manrope,Arial" font-size="13" font-weight="700" fill="#123C5A">Book a Clean →</text></g>`).join("")}${["Default", "Focused", "Error"].map((s, i) => `<g><text x="${40 + i * 300}" y="245" font-family="Inter,Arial" font-size="12" fill="#123C5A">Postcode · ${s}</text><rect x="${40 + i * 300}" y="265" width="260" height="48" rx="8" fill="white" stroke="${i === 1 ? "#25B7C4" : i === 2 ? "#B22F38" : "#DEEAED"}" stroke-width="${i === 1 ? 2 : 1}"/><text x="${55 + i * 300}" y="295" font-family="Inter,Arial" font-size="13" fill="#61747D">${i === 2 ? "123" : "3000"}</text>${i === 2 ? '<text x="640" y="340" font-family="Inter,Arial" font-size="11" fill="#B22F38">Enter a four-digit Australian postcode</text>' : ""}</g>`).join("")}</svg>`,
);
console.log(
  "Exported 20 editable SVG layouts, component states, tokens and 3 logo variants.",
);
