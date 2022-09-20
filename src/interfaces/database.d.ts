interface CookieQueryResult {
  id: number;
  sourceId: number;
  sourceDesription: string;
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

interface SourceJson {
  included: [];
  meta: MetaJson;
}

interface MetaJson {
  total_count: number;
  can_include?: string[];
  can_order_by?: string[];
  can_query_by?: string[];
  parent: Role;
}
