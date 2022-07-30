interface CookieQueryResult {
  id: number;
  source: number;
  json: string;
  active: boolean;
  date_added: string;
  date_modified: string | null;
}

interface SourceQueryResult {
  id: number;
  desciption: string;
  json: string;
}
