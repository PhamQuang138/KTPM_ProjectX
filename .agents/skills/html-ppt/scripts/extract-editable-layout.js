const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const [htmlArg, outputArg, edgeArg] = process.argv.slice(2);
if (!htmlArg || !outputArg || !edgeArg) {
  console.error("Usage: node extract-editable-layout.js <html> <json> <edge>");
  process.exit(1);
}

const htmlPath = path.resolve(htmlArg);
const outputPath = path.resolve(outputArg);
const profilePath = path.join(
  process.env.TEMP || process.env.TMP || ".",
  `html-ppt-editable-${process.pid}`,
);
const port = 9333 + (process.pid % 500);
const fileUrl = `file:///${htmlPath.replace(/\\/g, "/").replace(/ /g, "%20")}`;

const edge = spawn(
  edgeArg,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1920,1080",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    fileUrl,
  ],
  { stdio: "ignore", windowsHide: true },
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPage() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json`).then((res) =>
        res.json(),
      );
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // Chromium may need a moment to expose the debugging endpoint.
    }
    await wait(100);
  }
  throw new Error("Could not connect to the Chromium debugging endpoint.");
}

function evaluate(ws, expression) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1_000_000_000);
    const onMessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.id !== id) return;
      ws.removeEventListener("message", onMessage);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result.result.value);
    };
    ws.addEventListener("message", onMessage);
    ws.send(
      JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: {
          expression,
          returnByValue: true,
          awaitPromise: true,
        },
      }),
    );
  });
}

const snapshotExpression = String.raw`
(async () => {
  const waitFrame = () => new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
  const slides = [...document.querySelectorAll('.deck > .slide')];
  const rgba = value => {
    const match = String(value || '').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)/i);
    if (!match) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4])
    };
  };
  const gradientColor = value => {
    const colors = [...String(value || '').matchAll(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/gi)];
    if (!colors.length) return null;
    const total = colors.reduce((sum, color) => ({
      r: sum.r + Number(color[1]),
      g: sum.g + Number(color[2]),
      b: sum.b + Number(color[3])
    }), { r: 0, g: 0, b: 0 });
    return {
      r: Math.round(total.r / colors.length),
      g: Math.round(total.g / colors.length),
      b: Math.round(total.b / colors.length),
      a: 1
    };
  };
  const rectOf = element => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.max(0, rect.x),
      y: Math.max(0, rect.y),
      w: Math.min(innerWidth, rect.right) - Math.max(0, rect.x),
      h: Math.min(innerHeight, rect.bottom) - Math.max(0, rect.y)
    };
  };
  const visible = (element, style, rect) =>
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    Number(style.opacity || 1) > 0.01 &&
    rect.w > 1 && rect.h > 1 &&
    rect.x < innerWidth && rect.y < innerHeight;
  const isLeafText = element =>
    ![...element.children].some(child => (child.innerText || '').trim());
  const textOwner = element => {
    const tag = element.tagName;
    if (
      !['H1', 'H2', 'H3', 'H4', 'P', 'LI'].includes(tag) &&
      element.parentElement?.closest('h1,h2,h3,h4,p,li')
    ) {
      return false;
    }
    return ['H1', 'H2', 'H3', 'H4', 'P', 'LI'].includes(tag) || isLeafText(element);
  };
  const normalizedText = element => {
    let text = (element.innerText || '').replace(/\u00a0/g, ' ').trim();
    if (element.tagName === 'LI') text = '• ' + text;
    return text;
  };
  const result = [];
  for (let index = 0; index < slides.length; index += 1) {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
      slide.classList.remove('is-prev');
      slide.style.opacity = slideIndex === index ? '1' : '0';
      slide.style.transform = 'none';
      slide.querySelectorAll('[data-anim], [class*="anim-"]').forEach(element => {
        element.style.animation = 'none';
        element.style.transition = 'none';
        element.style.opacity = '1';
        element.style.transform = 'none';
      });
    });
    await waitFrame();
    const slide = slides[index];
    const elements = [...slide.querySelectorAll('*')].filter(element =>
      !element.closest('aside.notes') &&
      !element.classList.contains('notes') &&
      !element.classList.contains('deck-footer')
    );
    const shapes = [];
    const texts = [];
    for (const element of elements) {
      const style = getComputedStyle(element);
      const rect = rectOf(element);
      if (!visible(element, style, rect)) continue;
      const background = rgba(style.backgroundColor);
      const gradient = style.backgroundImage !== 'none'
        ? gradientColor(style.backgroundImage)
        : null;
      const borders = [
        Number.parseFloat(style.borderTopWidth) || 0,
        Number.parseFloat(style.borderRightWidth) || 0,
        Number.parseFloat(style.borderBottomWidth) || 0,
        Number.parseFloat(style.borderLeftWidth) || 0
      ];
      const borderWidth = Math.max(...borders);
      const border = rgba(style.borderTopColor);
      const hasShape =
        style.backgroundClip !== 'text' &&
        style.webkitBackgroundClip !== 'text' &&
        (
          background.a > 0.01 ||
          gradient ||
          borderWidth > 0.1 ||
          element.classList.contains('cover-orbit')
        );
      if (hasShape) {
        shapes.push({
          rect,
          fill: gradient || background,
          fillVisible: Boolean(gradient || background.a > 0.01),
          border,
          borderWidth,
          radius: Number.parseFloat(style.borderRadius) || 0,
          oval: style.borderRadius === '50%' ||
            (Number.parseFloat(style.borderRadius) >= Math.min(rect.w, rect.h) / 2 - 2),
          className: element.className || '',
        });
      }
      if (!textOwner(element)) continue;
      const text = normalizedText(element);
      if (!text) continue;
      const color = rgba(style.color);
      const weight = Number.parseInt(style.fontWeight, 10);
      texts.push({
        rect,
        text,
        color,
        fontSize: Number.parseFloat(style.fontSize) || 16,
        fontFamily: style.fontFamily || 'Arial',
        bold: Number.isFinite(weight) ? weight >= 600 : /bold/i.test(style.fontWeight),
        italic: style.fontStyle === 'italic',
        align: style.textAlign || 'left',
        lineHeight: Number.parseFloat(style.lineHeight) || 0,
        tag: element.tagName,
        className: element.className || '',
      });
    }
    const slideStyle = getComputedStyle(slide);
    const bodyStyle = getComputedStyle(document.body);
    const slideBackground = rgba(slideStyle.backgroundColor);
    result.push({
      title: slide.dataset.title || ('Slide ' + (index + 1)),
      background: slideBackground.a > 0.01
        ? slideBackground
        : rgba(bodyStyle.backgroundColor),
      shapes,
      texts,
    });
  }
  return JSON.stringify({
    viewport: { width: innerWidth, height: innerHeight },
    slides: result,
  });
})()
`;

(async () => {
  try {
    const page = await getPage();
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    await wait(600);
    const snapshot = await evaluate(ws, snapshotExpression);
    ws.close();
    fs.writeFileSync(outputPath, snapshot, "utf8");
    console.log(`Extracted editable layout to ${outputPath}`);
  } finally {
    edge.kill();
    await wait(200);
    fs.rmSync(profilePath, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  edge.kill();
  process.exit(1);
});
