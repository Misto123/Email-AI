import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'project_admin_session';

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'rereeu';
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY || getAdminPassword();
}

export function isValidAdminPassword(password: string) {
  const supplied = Buffer.from(password);
  const expected = Buffer.from(getAdminPassword());

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function getAdminSessionToken() {
  return createHmac('sha256', getSessionSecret())
    .update('project-admin-session')
    .digest('hex');
}

export function isValidAdminSession(token?: string) {
  if (!token) return false;

  const supplied = Buffer.from(token);
  const expected = Buffer.from(getAdminSessionToken());

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
