"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  FileText,
  ReceiptText,
  X,
} from "lucide-react";
import type { PaymentDocument } from "@/lib/payments/documents";
import { site } from "@/lib/config";
import styles from "./payment-success.module.css";

export function PaymentSuccess({
  payment,
  reference,
  initialReceipt = false,
}: {
  payment: PaymentDocument;
  reference: { sessionId?: string; invoiceId?: string };
  initialReceipt?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const started = useRef(false);
  const [receipt, setReceipt] = useState(initialReceipt);
  const [downloadState, setDownloadState] = useState(
    "Preparing your invoice and receipt PDFs…",
  );
  const [busy, setBusy] = useState(false);
  const query = new URLSearchParams(
    reference.sessionId
      ? { session_id: reference.sessionId }
      : { invoice_id: reference.invoiceId! },
  );
  const documentUrl = (type: string) =>
    `/api/payments/documents?${query}&type=${type}`;
  const back = reference.invoiceId
    ? `/admin/review?id=${reference.invoiceId}`
    : "/pricing";
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    if (started.current || initialReceipt) return;
    started.current = true;
    const key = `thrive4-documents-${payment.key}`;
    try {
      if (sessionStorage.getItem(key)) {
        queueMicrotask(() =>
          setDownloadState(
            "Your documents are ready. Download another copy below.",
          ),
        );
        return;
      }
      sessionStorage.setItem(key, "started");
    } catch {
      /* Downloads remain available if storage is restricted. */
    }
    async function downloadBoth() {
      await Promise.resolve();
      setBusy(true);
      try {
        const urls = ["invoice", "receipt"].map(
          (type) =>
            `/api/payments/documents?${new URLSearchParams(reference.sessionId ? { session_id: reference.sessionId } : { invoice_id: reference.invoiceId! })}&type=${type}`,
        );
        const files = await Promise.all(
          urls.map(async (url) => {
            const response = await fetch(url);
            if (
              !response.ok ||
              !response.headers.get("content-type")?.includes("application/pdf")
            )
              throw new Error("PDF not ready");
            return response.blob();
          }),
        );
        files.forEach((blob, index) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `Thrive4-${index === 0 ? "Invoice" : "Receipt"}-${index === 0 ? payment.invoiceNumber : payment.receiptNumber}.pdf`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        });
        setDownloadState(
          "Downloads started. If your browser blocked them, use the buttons below.",
        );
      } catch {
        try {
          sessionStorage.removeItem(key);
        } catch {}
        setDownloadState(
          "Automatic download could not complete. Use the download buttons below to retry.",
        );
      } finally {
        setBusy(false);
      }
    }
    void downloadBoth();
  }, [
    initialReceipt,
    payment.key,
    payment.invoiceNumber,
    payment.receiptNumber,
    reference.sessionId,
    reference.invoiceId,
  ]);
  const date = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(new Date(payment.paidAt));
  return (
    <div className={styles.stage}>
      <dialog
        ref={dialog}
        className={`${styles.modal} ${receipt ? styles.receiptModal : styles.successModal}`}
        aria-labelledby="payment-heading"
        onCancel={(event) => {
          event.preventDefault();
          window.location.assign(back);
        }}
      >
        <Link
          href={back}
          className={styles.close}
          aria-label="Close payment confirmation"
        >
          <X size={20} />
        </Link>
        {!receipt ? (
          <div className={styles.success}>
            <div className={styles.celebration} aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <i key={i} style={{ "--piece": i } as React.CSSProperties} />
              ))}
              <span className={styles.check}>
                <Check size={40} strokeWidth={2.5} />
              </span>
            </div>
            <span className={styles.eyebrow}>
              THANK YOU FOR CHOOSING THRIVE4
            </span>
            <h1 id="payment-heading">Payment successful!</h1>
            <p className={styles.intro}>
              Your payment is complete.
              <br />A little less to do. A little more room to thrive.
            </p>
            <div className={styles.summary}>
              <span>
                {payment.service}
                <small>
                  {payment.hours > 0
                    ? `${payment.hours} ${payment.hours === 1 ? "hour" : "hours"}`
                    : "Cleaning service"}
                </small>
              </span>
              <strong>AUD ${payment.amount.toFixed(2)}</strong>
            </div>
            <button className={styles.primary} onClick={() => setReceipt(true)}>
              <ReceiptText size={18} />
              View receipt
            </button>
            <div className={styles.downloads}>
              <a href={documentUrl("invoice")} download>
                <FileText size={16} />
                Invoice PDF
              </a>
              <a href={documentUrl("receipt")} download>
                <ArrowDownToLine size={16} />
                Receipt PDF
              </a>
            </div>
            <p className={styles.downloadStatus} role="status">
              {busy ? "Preparing your PDFs…" : downloadState}
            </p>
            <span className={styles.testBadge}>
              {payment.live
                ? "SECURE PAYMENT · VERIFIED BY STRIPE"
                : "STRIPE TEST MODE · NO REAL MONEY COLLECTED"}
            </span>
            <Link href={back} className={styles.back}>
              {reference.invoiceId ? "Back to invoice" : "Back to pricing"}
            </Link>
          </div>
        ) : (
          <div className={styles.receiptView}>
            <div className={styles.toolbar}>
              <button onClick={() => setReceipt(false)}>
                <ArrowLeft size={16} />
                Payment details
              </button>
              <a href={documentUrl("receipt")} download>
                <ArrowDownToLine size={17} />
                Download PDF
              </a>
            </div>
            <article className={styles.paper}>
              <header className={styles.paperHeader}>
                <Image
                  src="/brand/thrive4-logo.png"
                  alt="Thrive4 Cleaning"
                  width={180}
                  height={60}
                />
                <div>
                  <span className={styles.paid}>PAID</span>
                  <h1 id="payment-heading">Payment receipt</h1>
                  <p>{payment.receiptNumber}</p>
                </div>
              </header>
              <div className={styles.parties}>
                <div>
                  <span>FROM</span>
                  <strong>Thrive4 Cleaning</strong>
                  <p>
                    {site.address}
                    <br />
                    {site.email}
                    <br />
                    {site.phone}
                  </p>
                </div>
                <div>
                  <span>RECEIVED FROM</span>
                  <strong>{payment.customerName}</strong>
                  <p>{payment.customerEmail}</p>
                  <span>PAYMENT DATE</span>
                  <p>{date}</p>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Hours</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{payment.service}</td>
                      <td>{payment.hours || "—"}</td>
                      <td>
                        {payment.hourlyRate
                          ? `$${payment.hourlyRate.toFixed(2)}`
                          : "—"}
                      </td>
                      <td>${payment.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.totals}>
                <div>
                  <span>Subtotal</span>
                  <strong>${payment.amount.toFixed(2)}</strong>
                </div>
                <div className={styles.totalPaid}>
                  <span>Total paid</span>
                  <strong>AUD ${payment.amount.toFixed(2)}</strong>
                </div>
              </div>
              <dl className={styles.paymentDetails}>
                <div>
                  <dt>Payment method</dt>
                  <dd>
                    {payment.cardLast4
                      ? `${payment.cardBrand.toUpperCase()} ···· ${payment.cardLast4}`
                      : "Stripe"}
                  </dd>
                </div>
                <div>
                  <dt>Payment reference</dt>
                  <dd>{payment.paymentIntentId}</dd>
                </div>
                <div>
                  <dt>Invoice</dt>
                  <dd>{payment.invoiceNumber}</dd>
                </div>
              </dl>
              <footer className={styles.paperFooter}>
                <strong>Thank you for choosing Thrive4 Cleaning.</strong>
                <p>
                  {payment.live
                    ? "Your payment has been received."
                    : "Stripe test document. No real money was collected."}
                  <br />
                  Appointment scheduling is confirmed separately.
                </p>
              </footer>
            </article>
          </div>
        )}
      </dialog>
      <noscript>
        <p>
          Your payment is verified.{" "}
          <a href={documentUrl("invoice")}>Download invoice PDF</a> ·{" "}
          <a href={documentUrl("receipt")}>Download receipt PDF</a>
        </p>
      </noscript>
    </div>
  );
}
