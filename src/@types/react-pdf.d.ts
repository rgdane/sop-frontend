declare module "@react-pdf/renderer" {
  import * as React from "react";

  export class Document extends React.Component<any> { }
  export class Page extends React.Component<any> { }
  export class Text extends React.Component<any> { }
  export class View extends React.Component<any> { }
  export class StyleSheet {
    static create(styles: any): any;
  }
  export class PDFDownloadLink extends React.Component<any> { }
  export const Font: {
    register: (options: {
      family: string;
      src: string | Buffer | ArrayBuffer;
      fontWeight?: string | number;
      fontStyle?: string;
    }) => void;

    registerEmojiSource: (options: {
      format: 'png' | 'svg';
      url: string;
    }) => void;

    registerHyphenationCallback: (callback: (word: string) => string[]) => void;

    clear: () => void;

    getRegisteredFonts: () => string[];

    getRegisteredFontFamilies: () => string[];
  };

  export function pdf(element: React.ReactElement): {
    toBlob(): Promise<Blob>;
    toString(): Promise<string>;
    toBuffer(): Promise<Buffer>;
  };
}
