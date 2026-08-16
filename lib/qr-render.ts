import qrcode from 'qrcode-generator';
import { QRGenerateOptions } from '@/types/qr-types';

export interface QrRenderOptions {
  matrix: boolean[][];
  size: number;
  fgColor: string;
  gradient?: QRGenerateOptions['gradient'];
  moduleStyle?: 'square' | 'rounded' | 'circle';
  pattern?: string | null;
  includeMargin: boolean;
  imageSettings?: QRGenerateOptions['imageSettings'];
  logos?: QRGenerateOptions['logos'];
  scale?: number;
}

function logoRect(size: number, logo: NonNullable<QRGenerateOptions['logos']>[number]) {
  const w = (size * logo.size) / 100;
  const h = (size * logo.size) / 100;
  const x = (size * (logo.x ?? 50)) / 100 - w / 2;
  const y = (size * (logo.y ?? 50)) / 100 - h / 2;
  return { x, y, w, h };
}

export function getQrMatrix(value: string, level: 'L' | 'M' | 'Q' | 'H'): boolean[][] {
  const qr = qrcode(0, level);
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const matrix: boolean[][] = [];
  for (let row = 0; row < count; row++) {
    const line: boolean[] = [];
    for (let col = 0; col < count; col++) {
      line.push(qr.isDark(row, col));
    }
    matrix.push(line);
  }
  return matrix;
}

function isFinderModule(row: number, col: number, count: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= count - 7) ||
    (row >= count - 7 && col < 7)
  );
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getFill(ctx: CanvasRenderingContext2D, opts: QrRenderOptions): string | CanvasGradient {
  const { size, fgColor, gradient } = opts;
  if (gradient?.enabled) {
    if (gradient.type === 'radial') {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, gradient.startColor);
      g.addColorStop(1, gradient.endColor);
      return g;
    }
    const diagonal = gradient.direction === 'diagonal';
    const vertical = gradient.direction === 'vertical';
    const x2 = diagonal ? size : vertical ? 0 : size;
    const y2 = diagonal ? size : vertical ? size : 0;
    const g = ctx.createLinearGradient(0, 0, x2, y2);
    g.addColorStop(0, gradient.startColor);
    g.addColorStop(1, gradient.endColor);
    return g;
  }
  return fgColor;
}

export async function drawQrToCanvas(canvas: HTMLCanvasElement, opts: QrRenderOptions) {
  const { matrix, size, moduleStyle, pattern, includeMargin, imageSettings, logos } = opts;
  const scale = opts.scale || 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = size * scale;
  canvas.height = size * scale;
  ctx.clearRect(0, 0, size * scale, size * scale);
  ctx.scale(scale, scale);

  const count = matrix.length;
  const margin = includeMargin ? 4 : 0;
  const moduleSize = size / (count + margin * 2);
  const offset = margin * moduleSize;
  const fill = getFill(ctx, opts);
  const corner = moduleSize * 0.35;
  const radius = moduleSize / 2;
  const effectivePattern = pattern && pattern !== 'none' ? pattern : null;

  ctx.fillStyle = fill;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!matrix[row][col]) continue;
      const x = offset + col * moduleSize;
      const y = offset + row * moduleSize;
      const finder = isFinderModule(row, col, count);

      if (finder) {
        ctx.fillRect(x, y, moduleSize, moduleSize);
        continue;
      }

      const style = effectivePattern || moduleStyle || 'square';
      switch (style) {
        case 'circle':
        case 'dots':
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rounded':
          roundRectPath(ctx, x, y, moduleSize, moduleSize, corner);
          ctx.fill();
          break;
        case 'grid': {
          const gap = moduleSize * 0.3;
          ctx.fillRect(x + gap / 2, y + gap / 2, moduleSize - gap, moduleSize - gap);
          break;
        }
        case 'diagonal': {
          ctx.beginPath();
          ctx.moveTo(x + moduleSize / 2, y);
          ctx.lineTo(x + moduleSize, y + moduleSize / 2);
          ctx.lineTo(x + moduleSize / 2, y + moduleSize);
          ctx.lineTo(x, y + moduleSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'checker': {
          if ((row + col) % 2 === 0) {
            ctx.fillRect(x, y, moduleSize, moduleSize);
          } else {
            const inset = moduleSize * 0.35;
            const pad = (moduleSize - inset) / 2;
            ctx.fillRect(x + pad, y + pad, inset, inset);
          }
          break;
        }
        case 'stripes': {
          const barHeight = moduleSize * 0.5;
          ctx.fillRect(x, y + (moduleSize - barHeight) / 2, moduleSize, barHeight);
          break;
        }
        default:
          ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }

  if (imageSettings?.src) {
    const img = await loadImage(imageSettings.src);
    if (img.naturalWidth > 0) {
      const imgW = (size * imageSettings.width) / 100;
      const imgH = (size * imageSettings.height) / 100;
      const x = (size - imgW) / 2;
      const y = (size - imgH) / 2;
      if (imageSettings.excavate) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - moduleSize, y - moduleSize, imgW + moduleSize * 2, imgH + moduleSize * 2);
      }
      ctx.drawImage(img, x, y, imgW, imgH);
    }
  }
  await drawLogos(ctx, size, logos);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

async function drawLogos(ctx: CanvasRenderingContext2D, size: number, logos?: QRGenerateOptions['logos']) {
  if (!logos || logos.length === 0) return;
  for (const logo of logos) {
    const img = await loadImage(logo.src);
    if (img.naturalWidth === 0) continue;
    const { x, y, w, h } = logoRect(size, logo);
    ctx.drawImage(img, x, y, w, h);
  }
}

export async function renderExportCanvas(
  value: string,
  options: QRGenerateOptions,
  scale = 2,
  forceOpaque = false
): Promise<HTMLCanvasElement> {
  const matrix = getQrMatrix(value, options.errorCorrectionLevel);
  const padding = 24;
  const qrSize = options.size;
  const total = qrSize + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = total * scale;
  canvas.height = total * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(scale, scale);

  const shape = () => {
    if (options.containerStyle === 'circle') {
      ctx.arc(total / 2, total / 2, total / 2, 0, Math.PI * 2);
    } else if (options.containerStyle === 'rounded') {
      roundRectPath(ctx, 0, 0, total, total, 16);
    } else {
      ctx.rect(0, 0, total, total);
    }
  };

  const transparent = !!options.transparentBackground && !forceOpaque;
  if (transparent) {
    ctx.clearRect(0, 0, total, total);
  } else {
    ctx.save();
    ctx.fillStyle = forceOpaque && options.transparentBackground ? '#ffffff' : options.backgroundColor;
    if (options.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 25;
    }
    ctx.beginPath();
    shape();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.beginPath();
  shape();
  ctx.clip();

  const inner = document.createElement('canvas');
  await drawQrToCanvas(inner, {
    matrix,
    size: qrSize,
    fgColor: options.foregroundColor,
    gradient: options.gradient,
    moduleStyle: options.moduleStyle,
    pattern: options.pattern,
    includeMargin: options.includeMargin,
    imageSettings: options.imageSettings,
    logos: options.logos,
    scale
  });
  ctx.drawImage(inner, padding, padding, qrSize, qrSize);
  ctx.restore();

  if (options.borderWidth) {
    ctx.strokeStyle = options.foregroundColor;
    ctx.lineWidth = options.borderWidth;
    ctx.beginPath();
    shape();
    ctx.stroke();
  }

  return canvas;
}

export function buildQrSvg(opts: QrRenderOptions): string {
  const { matrix, size, fgColor, gradient, moduleStyle, pattern, includeMargin, imageSettings, logos } = opts;
  const count = matrix.length;
  const margin = includeMargin ? 4 : 0;
  const moduleSize = size / (count + margin * 2);
  const offset = margin * moduleSize;
  const corner = moduleSize * 0.35;
  const radius = moduleSize / 2;
  const effectivePattern = pattern && pattern !== 'none' ? pattern : null;
  const fillId = 'yoqr-gradient';

  let defs = '';
  let fill = fgColor;
  if (gradient?.enabled) {
    if (gradient.type === 'radial') {
      defs = `<radialGradient id="${fillId}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${gradient.startColor}"/><stop offset="100%" stop-color="${gradient.endColor}"/></radialGradient>`;
    } else {
      const diagonal = gradient.direction === 'diagonal';
      const vertical = gradient.direction === 'vertical';
      const x2 = diagonal ? size : vertical ? 0 : size;
      const y2 = diagonal ? size : vertical ? size : 0;
      defs = `<linearGradient id="${fillId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${gradient.startColor}"/><stop offset="100%" stop-color="${gradient.endColor}"/></linearGradient>`;
    }
    fill = `url(#${fillId})`;
  }

  const shapes: string[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!matrix[row][col]) continue;
      const x = offset + col * moduleSize;
      const y = offset + row * moduleSize;
      const finder = isFinderModule(row, col, count);

      if (finder) {
        shapes.push(`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`);
        continue;
      }

      const style = effectivePattern || moduleStyle || 'square';
      switch (style) {
        case 'circle':
        case 'dots':
          shapes.push(`<circle cx="${x + radius}" cy="${y + radius}" r="${radius}"/>`);
          break;
        case 'rounded':
          shapes.push(`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${corner}"/>`);
          break;
        case 'grid': {
          const gap = moduleSize * 0.3;
          shapes.push(`<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${moduleSize - gap}" height="${moduleSize - gap}"/>`);
          break;
        }
        case 'diagonal':
          shapes.push(`<path d="M${x + moduleSize / 2} ${y}L${x + moduleSize} ${y + moduleSize / 2}L${x + moduleSize / 2} ${y + moduleSize}L${x} ${y + moduleSize / 2}Z"/>`);
          break;
        case 'checker': {
          if ((row + col) % 2 === 0) {
            shapes.push(`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`);
          } else {
            const inset = moduleSize * 0.35;
            const pad = (moduleSize - inset) / 2;
            shapes.push(`<rect x="${x + pad}" y="${y + pad}" width="${inset}" height="${inset}"/>`);
          }
          break;
        }
        case 'stripes': {
          const barHeight = moduleSize * 0.5;
          shapes.push(`<rect x="${x}" y="${y + (moduleSize - barHeight) / 2}" width="${moduleSize}" height="${barHeight}"/>`);
          break;
        }
        default:
          shapes.push(`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`);
      }
    }
  }

  let imageTag = '';
  if (imageSettings?.src) {
    const imgW = (size * imageSettings.width) / 100;
    const imgH = (size * imageSettings.height) / 100;
    const x = (size - imgW) / 2;
    const y = (size - imgH) / 2;
    if (imageSettings.excavate) {
      imageTag = `<rect x="${x - moduleSize}" y="${y - moduleSize}" width="${imgW + moduleSize * 2}" height="${imgH + moduleSize * 2}" fill="#ffffff"/>`;
    }
    imageTag += `<image href="${imageSettings.src}" x="${x}" y="${y}" width="${imgW}" height="${imgH}"/>`;
  }
  if (logos && logos.length > 0) {
    logos.forEach((logo) => {
      const { x, y, w, h } = logoRect(size, logo);
      imageTag += `<image href="${logo.src}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    });
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${defs}</defs><g fill="${fill}">${shapes.join('')}</g>${imageTag}</svg>`;
}

export function buildPdf(imageBytes: Uint8Array, width: number, height: number): Uint8Array {
  const enc = (s: string) => new TextEncoder().encode(s);
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let byteCount = 0;
  const push = (arr: Uint8Array) => {
    parts.push(arr);
    byteCount += arr.length;
  };

  push(enc('%PDF-1.4\n'));
  offsets[1] = byteCount;
  push(enc('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'));
  offsets[2] = byteCount;
  push(enc('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'));
  offsets[3] = byteCount;
  push(enc(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 5 0 R >> /ProcSet [/PDF /ImageB /ImageC /ImageI] >> /Contents 4 0 R >>\nendobj\n`));
  offsets[4] = byteCount;
  const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`;
  push(enc(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`));
  offsets[5] = byteCount;
  push(enc(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`));
  push(imageBytes);
  push(enc('\nendstream\nendobj\n'));
  const xrefStart = byteCount;
  push(enc('xref\n0 6\n0000000000 65535 f \n'));
  for (let i = 1; i <= 5; i++) {
    push(enc(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`));
  }
  push(enc(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`));

  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}