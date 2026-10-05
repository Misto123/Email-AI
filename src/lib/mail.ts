import "server-only";

import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { decryptMailboxPassword } from "@/lib/mailbox-crypto";

const host = "imap.purelymail.com";
const smtpHost = "smtp.purelymail.com";

export function createImapClient(
  email: string, 
  encryptedPassword: string,
  customHost?: string,
  customPort?: number
) {
  const imapHost = customHost || host;
  const imapPort = customPort || 993;
  return new ImapFlow({ 
    host: imapHost, 
    port: imapPort, 
    secure: true, 
    auth: { user: email, pass: decryptMailboxPassword(encryptedPassword) }, 
    logger: false 
  });
}

export function createSmtpTransport(
  email: string, 
  encryptedPassword: string,
  customHost?: string,
  customPort?: number
) {
  const transportHost = customHost || smtpHost;
  const transportPort = customPort || 465;
  return nodemailer.createTransport({ 
    host: transportHost, 
    port: transportPort, 
    secure: true, 
    auth: { user: email, pass: decryptMailboxPassword(encryptedPassword) } 
  });
}

export async function testMailboxConnection(
  email: string, 
  encryptedPassword: string, 
  type: "imap" | "smtp",
  customHost?: string,
  customPort?: number
) {
  if (type === "smtp") {
    const transport = createSmtpTransport(email, encryptedPassword, customHost, customPort);
    await transport.verify();
    transport.close();
    return;
  }
  const client = createImapClient(email, encryptedPassword, customHost, customPort);
  await client.connect();
  await client.logout();
}
