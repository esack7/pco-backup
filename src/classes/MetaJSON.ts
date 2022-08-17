export default class MetaJSON implements MetaJson {
  total_count: number;
  can_include?: string[];
  can_order_by?: string[];
  can_query_by?: string[];
  parent: Role;

  constructor(meta: Meta) {
    this.total_count = meta.total_count;
    this.can_include = meta.can_include;
    this.can_order_by = meta.can_order_by;
    this.can_query_by = meta.can_query_by;
    this.parent = meta.parent;
  }
}
