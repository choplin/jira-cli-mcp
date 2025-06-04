// Atlassian Document Format (ADF) type definitions
// Based on: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/

export interface AdfDocument {
  type: "doc";
  version: 1;
  content: AdfNode[];
}

// Base node type
export type AdfNode = 
  | AdfParagraph
  | AdfHeading
  | AdfBulletList
  | AdfOrderedList
  | AdfListItem
  | AdfCodeBlock
  | AdfBlockquote
  | AdfRule
  | AdfMediaSingle
  | AdfTable
  | AdfText
  | AdfHardBreak
  | AdfEmoji
  | AdfMention
  | AdfInlineCard;

// Block nodes
export interface AdfParagraph {
  type: "paragraph";
  content?: AdfInlineNode[];
}

export interface AdfHeading {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: AdfInlineNode[];
}

export interface AdfBulletList {
  type: "bulletList";
  content: AdfListItem[];
}

export interface AdfOrderedList {
  type: "orderedList";
  attrs?: {
    start?: number;
  };
  content: AdfListItem[];
}

export interface AdfListItem {
  type: "listItem";
  content: AdfBlockNode[];
}

export interface AdfCodeBlock {
  type: "codeBlock";
  attrs?: {
    language?: string;
  };
  content?: AdfText[];
}

export interface AdfBlockquote {
  type: "blockquote";
  content: AdfBlockNode[];
}

export interface AdfRule {
  type: "rule";
}

export interface AdfMediaSingle {
  type: "mediaSingle";
  attrs: {
    layout?: "center" | "wide" | "full-width";
  };
  content: AdfMedia[];
}

export interface AdfMedia {
  type: "media";
  attrs: {
    id: string;
    type: "file" | "link";
    collection?: string;
    width?: number;
    height?: number;
  };
}

export interface AdfTable {
  type: "table";
  attrs?: {
    isNumberColumnEnabled?: boolean;
    layout?: "default" | "wide" | "full-width";
  };
  content: AdfTableRow[];
}

export interface AdfTableRow {
  type: "tableRow";
  content: Array<AdfTableCell | AdfTableHeader>;
}

export interface AdfTableCell {
  type: "tableCell";
  attrs?: {
    colspan?: number;
    rowspan?: number;
    background?: string;
  };
  content?: AdfBlockNode[];
}

export interface AdfTableHeader {
  type: "tableHeader";
  attrs?: {
    colspan?: number;
    rowspan?: number;
    background?: string;
  };
  content?: AdfBlockNode[];
}

// Inline nodes
export interface AdfText {
  type: "text";
  text: string;
  marks?: AdfMark[];
}

export interface AdfHardBreak {
  type: "hardBreak";
}

export interface AdfEmoji {
  type: "emoji";
  attrs: {
    shortName: string;
    id?: string;
    text?: string;
  };
}

export interface AdfMention {
  type: "mention";
  attrs: {
    id: string;
    text: string;
    accessLevel?: string;
  };
}

export interface AdfInlineCard {
  type: "inlineCard";
  attrs: {
    url: string;
  };
}

// Marks
export interface AdfMark {
  type: AdfMarkType;
  attrs?: Record<string, unknown>;
}

export type AdfMarkType = 
  | "strong"
  | "em"
  | "code"
  | "strike"
  | "underline"
  | "textColor"
  | "link"
  | "subsup";

export interface AdfLinkMark extends AdfMark {
  type: "link";
  attrs: {
    href: string;
    title?: string;
  };
}

export interface AdfTextColorMark extends AdfMark {
  type: "textColor";
  attrs: {
    color: string;
  };
}

export interface AdfSubSupMark extends AdfMark {
  type: "subsup";
  attrs: {
    type: "sub" | "sup";
  };
}

// Helper type unions
export type AdfBlockNode = 
  | AdfParagraph
  | AdfHeading
  | AdfBulletList
  | AdfOrderedList
  | AdfCodeBlock
  | AdfBlockquote
  | AdfRule
  | AdfMediaSingle
  | AdfTable;

export type AdfInlineNode = 
  | AdfText
  | AdfHardBreak
  | AdfEmoji
  | AdfMention
  | AdfInlineCard;