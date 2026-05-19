export type FileType = "image" | "pdf" | "unknown";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp|svg)$/i;
const PDF_EXTENSION = /\.pdf$/i;

export function detectFileType(
  filename: string | null,
  url: string,
): FileType {
  const source = filename || url;
  const lower = source.toLowerCase();

  if (PDF_EXTENSION.test(lower)) return "pdf";
  if (IMAGE_EXTENSIONS.test(lower)) return "image";

  return "unknown";
}

export function getFileExtension(
  filename: string | null,
  url: string,
): string {
  const source = filename || url;
  const match = source.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}
