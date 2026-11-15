/**
 * Reads a product spreadsheet saved as CSV and checks every row with the same
 * rules the server uses, so problems show before anything is uploaded.
 */
import {
  IMPORT_COLUMNS,
  IMPORT_FIELD_MESSAGES,
  IMPORT_MAX_ROWS,
  ImportRowSchema,
  type ImportColumn,
  type ImportRow,
} from "@mojud/contracts";

/** The byte order mark Excel puts at the start of a "CSV UTF-8" file. */
const BOM = String.fromCharCode(0xfeff);

/** Splits CSV text into rows of cells: quotes, "" escapes and CRLF. */
export function parseCsv(text: string): string[][] {
  const body = text.startsWith(BOM) ? text.slice(1) : text;
  const firstLine = body.split(/\r?\n/, 1)[0] ?? "";
  // Excel in some regions saves with semicolons.
  const delimiter =
    firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (quoted) {
      if (char === '"' && body[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && body[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}

/** "Unit cost", "unit_cost" and "UNITCOST" all mean unitCost. */
function columnKey(header: string): ImportColumn | undefined {
  const plain = header.toLowerCase().replace(/[\s_()৳]|bdt|taka/g, "");
  return IMPORT_COLUMNS.find((column) => column.toLowerCase() === plain);
}

/** A number as typed in Excel: "1,250.50", "৳ 100", or empty (0). */
function toNumber(text: string): number {
  const plain = text.replace(/[,৳\s]/g, "");
  return plain === "" ? 0 : Number(plain);
}

export interface ImportProblem {
  /** The spreadsheet row number (the header is row 1); 0 for the file. */
  row: number;
  message: string;
}

export interface ImportPreview {
  rows: ImportRow[];
  problems: ImportProblem[];
}

const REQUIRED: readonly ImportColumn[] = ["sku", "name", "unit"];
const NUMBER_COLUMNS: readonly ImportColumn[] = [
  "unitCost",
  "minStock",
  "openingStock",
];

export function readProductCsv(text: string): ImportPreview {
  const [header, ...data] = parseCsv(text);
  if (!header) {
    return { rows: [], problems: [{ row: 0, message: "The file is empty." }] };
  }
  const columns = header.map(columnKey);
  const missing = REQUIRED.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    return {
      rows: [],
      problems: [
        {
          row: 1,
          message: `Missing column: ${missing.join(", ")}. Use the template.`,
        },
      ],
    };
  }
  if (data.length === 0) {
    return {
      rows: [],
      problems: [{ row: 0, message: "The file has no product rows." }],
    };
  }
  if (data.length > IMPORT_MAX_ROWS) {
    return {
      rows: [],
      problems: [
        {
          row: 0,
          message: `Import at most ${IMPORT_MAX_ROWS} products at a time.`,
        },
      ],
    };
  }

  const rows: ImportRow[] = [];
  const problems: ImportProblem[] = [];
  const seen = new Map<string, number>();
  data.forEach((cells, index) => {
    const rowNumber = index + 2;
    const raw: Record<string, unknown> = {
      unitCost: 0,
      minStock: 0,
      openingStock: 0,
    };
    columns.forEach((column, i) => {
      if (!column) return;
      const value = cells[i] ?? "";
      raw[column] = NUMBER_COLUMNS.includes(column) ? toNumber(value) : value;
    });
    const parsed = ImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0] as ImportColumn;
      problems.push({
        row: rowNumber,
        message: IMPORT_FIELD_MESSAGES[field] ?? "Check this row.",
      });
      return;
    }
    const earlier = seen.get(parsed.data.sku);
    if (earlier !== undefined) {
      problems.push({
        row: rowNumber,
        message: `SKU ${parsed.data.sku} is also on row ${earlier}.`,
      });
      return;
    }
    seen.set(parsed.data.sku, rowNumber);
    rows.push(parsed.data);
  });
  return { rows, problems };
}

/** The template file: the header and one example row. */
export const PRODUCT_TEMPLATE_CSV =
  `${BOM}sku,name,unit,unit_cost,min_stock,opening_stock\r\n` +
  "RICE-25,Miniket rice 25kg,bag,1250.50,5,40\r\n";
