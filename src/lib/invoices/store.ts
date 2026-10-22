import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Invoice, InvoiceInput } from "./model";
import {
  databaseInvoiceTransaction,
  invoiceDatabase,
  invoiceTransactionContext,
  onlineAdmin,
} from "./database";

const directory = path.join(process.cwd(), ".local-admin");
const filename = path.join(directory, "invoices.json");
const globalStore = globalThis as typeof globalThis & {
  invoiceQueue?: Promise<unknown>;
};
export class InvoiceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function readInvoices(): Promise<Invoice[]> {
  if (onlineAdmin())
    return (
      (
        await invoiceDatabase().query(
          "select invoices from thrive4_admin.workspace where id=1",
        )
      ).rows[0]?.invoices || []
    );
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
export async function archiveInvoice(
  invoice: Invoice,
  action: "edit" | "delete",
) {
  if (onlineAdmin()) {
    const client = invoiceTransactionContext.getStore();
    if (!client) throw new Error("Invoice history requires a transaction.");
    await client.query(
      "insert into thrive4_admin.history(invoice_id,revision,action,invoice) values($1,$2,$3,$4::jsonb) on conflict do nothing",
      [invoice.id, invoice.revision, action, JSON.stringify(invoice)],
    );
    return;
  }
  await mkdir(path.join(directory, "history"), { recursive: true });
  const archive = path.join(
    directory,
    "history",
    `${invoice.id}-r${invoice.revision}-${action}.json`,
  );
  try {
    await writeFile(
      archive,
      JSON.stringify(
        { action, archivedAt: new Date().toISOString(), invoice },
        null,
        2,
      ),
      { flag: "wx", mode: 0o600 },
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}
async function writeInvoices(invoices: Invoice[]) {
  await mkdir(directory, { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(invoices, null, 2), {
    mode: 0o600,
  });
  await rename(temporary, filename);
}
export async function invoiceTransaction<T>(
  operation: (invoices: Invoice[]) => Promise<T>,
): Promise<T> {
  if (onlineAdmin()) return databaseInvoiceTransaction(operation);
  const previous = globalStore.invoiceQueue || Promise.resolve();
  const pending = previous
    .catch(() => {})
    .then(async () => {
      const invoices = await readInvoices();
      const result = await operation(invoices);
      await writeInvoices(invoices);
      return result;
    });
  globalStore.invoiceQueue = pending.catch(() => {});
  return pending;
}
export function findInvoice(
  invoices: Invoice[],
  id: string,
  revision?: number,
) {
  const invoice = invoices.find((invoice) => invoice.id === id);
  if (!invoice) throw new InvoiceError("Invoice not found.", 404);
  if (revision !== undefined && invoice.revision !== revision)
    throw new InvoiceError(
      "This invoice changed. Refresh the page before continuing.",
      409,
    );
  return invoice;
}
export function saveInvoice(
  invoices: Invoice[],
  data: InvoiceInput,
  id?: string,
  revision?: number,
) {
  if (
    invoices.some(
      (invoice) =>
        invoice.number.toLowerCase() === data.number.toLowerCase() &&
        invoice.id !== id,
    )
  )
    throw new InvoiceError("This invoice number is already in use.", 409);
  const now = new Date().toISOString();
  if (id) {
    const invoice = findInvoice(invoices, id, revision);
    Object.assign(invoice, data, {
      revision: invoice.revision + 1,
      updatedAt: now,
      paymentToken: undefined,
      checkout: undefined,
    });
    return invoice;
  }
  const invoice: Invoice = {
    ...data,
    id: randomUUID(),
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  invoices.unshift(invoice);
  return invoice;
}
export function generatePreviewLink(invoice: Invoice) {
  invoice.paymentToken ||= randomBytes(24).toString("hex");
  return invoice;
}
export function deleteInvoice(
  invoices: Invoice[],
  id: string,
  revision: number,
) {
  const invoice = findInvoice(invoices, id, revision);
  invoices.splice(invoices.indexOf(invoice), 1);
  return invoice.id;
}
export function paymentUrl(invoice: Invoice, origin: string) {
  if (invoice.checkout)
    return invoice.checkout.status === "open" &&
      invoice.checkout.paymentStatus !== "paid"
      ? invoice.checkout.url
      : undefined;
  return invoice.paymentToken
    ? `${origin}/admin/pay/${invoice.paymentToken}`
    : undefined;
}
