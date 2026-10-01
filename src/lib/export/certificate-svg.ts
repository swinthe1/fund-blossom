/**
 * Client-side export of the rendered certificate pages into a standalone
 * SVG file. Each page is embedded in a <foreignObject>; computed styles are
 * inlined per element so the file renders identically when opened in a
 * browser, without needing the app's stylesheet.
 */

const PROPS = [
  // Layout
  "display", "position", "top", "right", "bottom", "left", "transform",
  "transform-origin", "z-index", "opacity", "visibility", "overflow",
  "overflow-x", "overflow-y", "box-sizing", "isolation",
  // Sizing
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  // Flex
  "flex-direction", "flex-wrap", "flex-flow", "flex-grow", "flex-shrink",
  "flex-basis", "align-items", "align-self", "align-content",
  "justify-content", "justify-items", "gap", "row-gap", "column-gap", "order",
  // Grid
  "grid-template-columns", "grid-template-rows", "grid-auto-flow",
  "grid-auto-rows", "grid-auto-columns", "grid-column-start",
  "grid-column-end", "grid-row-start", "grid-row-end", "place-items",
  "place-content",
  // Spacing
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  // Colors / background
  "color", "background-color", "background-image", "background-size",
  "background-repeat", "background-position", "background-clip",
  "background-origin",
  // Borders
  "border-top-width", "border-top-style", "border-top-color",
  "border-right-width", "border-right-style", "border-right-color",
  "border-bottom-width", "border-bottom-style", "border-bottom-color",
  "border-left-width", "border-left-style", "border-left-color",
  "border-radius", "border-collapse", "border-spacing",
  "list-style-type", "list-style-position", "list-style-image",
  // Effects
  "box-shadow", "text-shadow",
  // Typography
  "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "word-spacing", "white-space", "text-align",
  "text-decoration-line", "text-decoration-color", "text-transform",
  "text-overflow", "text-indent", "vertical-align", "word-break",
  "overflow-wrap", "direction",
  // Misc
  "table-layout", "object-fit", "object-position",
];

function absolutizeUrls(value: string): string {
  return value.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q: string, u: string) => {
    if (!u || u.startsWith("data:") || u.startsWith("#")) return m;
    try {
      return `url(${q}${new URL(u, window.location.href).href}${q})`;
    } catch {
      return m;
    }
  });
}

function inlineStyles(el: Element): string {
  const cs = window.getComputedStyle(el);
  let out = "";
  for (const p of PROPS) {
    let v = cs.getPropertyValue(p);
    if (!v) continue;
    if (p === "background-image" || p === "filter") v = absolutizeUrls(v);
    out += `${p}:${v};`;
  }
  return out;
}

function cloneWithStyles(src: Element): Element {
  const clone = src.cloneNode(true) as Element;
  const srcEls: Element[] = [];
  const walk = (n: Element) => {
    srcEls.push(n);
    for (const c of n.children) walk(c);
  };
  walk(src);
  let i = 0;
  const walkClone = (n: Element) => {
    const orig = srcEls[i];
    if (orig) {
      n.setAttribute("style", inlineStyles(orig));
      if (n instanceof HTMLImageElement && orig instanceof HTMLImageElement && orig.src) {
        n.setAttribute("src", new URL(orig.src, window.location.href).href);
        n.removeAttribute("srcset");
      }
    }
    i++;
    for (const c of n.children) walkClone(c);
  };
  walkClone(clone);
  return clone;
}

export function buildCertificateSvg(pages: Element[]): string {
  const rects = pages.map((p) => p.getBoundingClientRect());
  if (!rects.length) return "";
  const W = Math.max(...rects.map((r) => Math.ceil(r.width)));
  const GAP = 48;
  const totalH =
    rects.reduce((acc, r) => acc + Math.ceil(r.height), 0) + GAP * (pages.length - 1);

  let foHtml = "";
  let y = 0;
  pages.forEach((p, idx) => {
    const w = Math.ceil(rects[idx].width);
    const h = Math.ceil(rects[idx].height);
    const inner = new XMLSerializer().serializeToString(cloneWithStyles(p));
    foHtml += `<foreignObject x="0" y="${y}" width="${w}" height="${h}"><html xmlns="http://www.w3.org/1999/xhtml"><body style="margin:0;padding:0;">${inner}</body></html></foreignObject>`;
    y += h + GAP;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${totalH}" viewBox="0 0 ${W} ${totalH}"><rect width="${W}" height="${totalH}" fill="#ffffff"/>${foHtml}</svg>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`;
}

export function downloadCertificateSvg(pages: Element[], filename: string) {
  const svg = buildCertificateSvg(pages);
  if (!svg) return;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
