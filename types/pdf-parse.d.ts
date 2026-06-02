declare module 'pdf-parse' {
  type PdfParseResult = {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: Record<string, unknown>;
    metadata?: Record<string, unknown> | null;
    version?: string;
  };

  export default function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PdfParseResult>;
}
