import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Bytes per pixel by PNG colour type, for the 8-bit types a browser screenshot produces. */
const CHANNELS = { 2: 3, 6: 4 };

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/**
 * Reverses PNG scanline filtering in place. Each scanline is prefixed with its filter type and is
 * predicted from the scanline above and the pixel to the left, so this must run top to bottom and
 * cannot be parallelised.
 */
const unfilter = (raw, width, height, bpp) => {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const target = out.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? target[i - bpp] : 0;
      const b = prior ? prior[i] : 0;
      const c = prior && i >= bpp ? prior[i - bpp] : 0;
      const x = line[i];
      let value;
      switch (filter) {
        case 0:
          value = x;
          break;
        case 1:
          value = x + a;
          break;
        case 2:
          value = x + b;
          break;
        case 3:
          value = x + ((a + b) >> 1);
          break;
        case 4:
          value = x + paeth(a, b, c);
          break;
        default:
          throw new Error(`unsupported PNG filter type ${filter} on scanline ${y}`);
      }
      target[i] = value & 0xff;
    }
  }
  return out;
};

/**
 * Reads a PNG and returns `{ width, height, pixel(x, y) }` where pixel returns `[r, g, b]`.
 *
 * Deliberately minimal: it handles only the 8-bit truecolour forms a browser screenshot produces
 * and refuses anything else loudly, rather than silently returning wrong colours. Sampling the
 * real pixel is the point — a computed style proves the CSS asked for a colour, not that the
 * colour reached the screen past an occluding element or a stray opacity.
 */
export const readPng = (path) => {
  const buf = readFileSync(path);
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error(`${path} is not a PNG`);

  let offset = 8;
  let header = null;
  const idat = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (!header) throw new Error(`${path} has no IHDR chunk`);
  if (header.bitDepth !== 8 || !CHANNELS[header.colorType]) {
    throw new Error(
      `${path} is bit depth ${header.bitDepth}, colour type ${header.colorType}; this reader ` +
        `handles 8-bit colour types 2 and 6 only`
    );
  }
  if (header.interlace !== 0) throw new Error(`${path} is interlaced, which this reader does not handle`);

  const bpp = CHANNELS[header.colorType];
  const pixels = unfilter(inflateSync(Buffer.concat(idat)), header.width, header.height, bpp);
  const stride = header.width * bpp;

  return {
    width: header.width,
    height: header.height,
    pixel: (x, y) => {
      if (x < 0 || y < 0 || x >= header.width || y >= header.height) {
        throw new Error(`pixel ${x},${y} is outside ${header.width}x${header.height}`);
      }
      const i = y * stride + x * bpp;
      return [pixels[i], pixels[i + 1], pixels[i + 2]];
    },
  };
};
