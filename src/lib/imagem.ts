import { db } from '@/db/db';
import type { Foto } from '@/db/tipos';

/** Comprime uma imagem para no máximo `max` px no maior lado (JPEG). */
export async function comprimirImagem(arquivo: Blob, max = 1280, qualidade = 0.82): Promise<Blob> {
  const bitmap = await carregar(arquivo);
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return arquivo;
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? arquivo), 'image/jpeg', qualidade));
}

async function carregar(arquivo: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    } catch {
      /* cai para <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Salva a foto comprimida no aparelho e retorna o id. Substitui a anterior da mesma referência. */
export async function salvarFoto(arquivo: Blob, tipo: Foto['tipo'], ref: string, substituirId?: number): Promise<number> {
  const blob = await comprimirImagem(arquivo);
  if (substituirId) await db.fotos.delete(substituirId);
  return db.fotos.add({ tipo, ref, blob, criadoEm: new Date().toISOString() });
}

export function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function base64ParaBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
