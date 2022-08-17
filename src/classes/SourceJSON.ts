import MetaJSON from "./MetaJson";

export default class SourceJSON implements SourceJson {
  included: [];
  meta: MetaJson;

  constructor(request: SongsRequest) {
    this.included = request.included;
    this.meta = new MetaJSON(request.meta);
  }
}
