import "server-only";

import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { decryptMailboxPassword } from "@/lib/mailbox-crypto";

const host = "imap.purelymail.com";
const smtpHost = "smtp.purelymail.com";

export function createImapClient(email: string, encryptedPassword: string) {
  return new ImapFlow({ host, port: 993, secure: true, auth: { user: email, pass: decryptMailboxPassword(encryptedPassword) }, logger: false });
}

export function createSmtpTransport(email: string, encryptedPassword: string) {
  return nodemailer.createTransport({ host: smtpHost, port: 465, secure: true, auth: { user: email, pass: decryptMailboxPassword(encryptedPassword) } });
}

export async function testMailboxConnection(email: string, encryptedPassword: string, type: "imap" | "smtp") {
  if (type === "smtp") {
    const transport = createSmtpTransport(email, encryptedPassword);
    await transport.verify();
    transport.close();
    return;
  }
  const client = createImapClient(email, encryptedPassword);
  await client.connect();
  await client.logout();
}
