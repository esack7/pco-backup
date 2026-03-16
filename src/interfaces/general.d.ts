interface MainVariables {
  /** Auth headers for PCO API (Authorization + User-Agent). */
  authHeaders: { Authorization: string; "User-Agent": string };
  callCount: number;
  currentTime: number;
  sourceID: number;
}
