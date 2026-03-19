import "dotenv/config";

const applicationId = process.env.PCO_APPLICATION_ID;
const secret = process.env.PCO_SECRET;

/**
 * PCO requires a User-Agent that identifies your app (e.g. name + contact).
 * @see https://api.planningcenteronline.com/docs/overview/authentication
 */
const USER_AGENT =
  process.env.PCO_USER_AGENT ||
  "pco-backup (https://github.com/your-repo/pco-backup)";

export interface AuthHeaders {
  Authorization: string;
  "User-Agent": string;
}

/**
 * Personal Access Token auth for a single Planning Center account.
 * Create a PAT at https://api.planningcenteronline.com/oauth/applications
 * and set PCO_APPLICATION_ID and PCO_SECRET in .env.
 */
export function getPatAuth(): AuthHeaders | null {
  if (!applicationId || !secret) {
    return null;
  }
  const credentials = Buffer.from(`${applicationId}:${secret}`).toString(
    "base64"
  );
  return {
    Authorization: `Basic ${credentials}`,
    "User-Agent": USER_AGENT,
  };
}

/**
 * Returns auth headers if PAT is configured; otherwise null.
 * Use this for the main backup flow (no browser or cookies).
 */
export function getAuth(): AuthHeaders | null {
  return getPatAuth();
}

export function isAuthConfigured(): boolean {
  return getAuth() !== null;
}
