declare module 'pdfmake' {
  interface TDocumentDefinitions {
    content: unknown;
    styles?: Record<string, unknown>;
    defaultStyle?: Record<string, unknown>;
    pageSize?: string | { width: number; height: number };
    pageOrientation?: 'portrait' | 'landscape';
    pageMargins?: [number, number, number, number];
    header?: unknown;
    footer?: unknown;
    background?: unknown;
    images?: Record<string, unknown>;
    watermark?: unknown;
    info?: Record<string, unknown>;
    compress?: boolean;
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      printing?: 'highResolution' | 'lowResolution';
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
    };
  }

  interface TFontDictionary {
    [fontName: string]: {
      normal?: string;
      bold?: string;
      italics?: string;
      bolditalics?: string;
    };
  }

  interface TCreatedPdf {
    download: (defaultFileName?: string, cb?: () => void, options?: Record<string, unknown>) => void;
    open: (options?: Record<string, unknown>, win?: Window) => void;
    print: (options?: Record<string, unknown>, win?: Window) => void;
    getDataUrl: (cb?: (dataUrl: string) => void, options?: Record<string, unknown>) => void;
    getBase64: (cb?: (data: string) => void, options?: Record<string, unknown>) => void;
    getBuffer: (cb?: (buffer: ArrayBuffer) => void, options?: Record<string, unknown>) => void;
    getBlob: (cb?: (blob: Blob) => void, options?: Record<string, unknown>) => void;
  }

  interface PDFMake {
    vfs: Record<string, string>;
    fonts: TFontDictionary;
    createPdf: (documentDefinition: TDocumentDefinitions) => TCreatedPdf;
  }

  const pdfMake: PDFMake;
  export default pdfMake;
}
