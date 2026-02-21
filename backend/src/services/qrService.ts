import QRCode from "qrcode";

export async function makeQrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}
