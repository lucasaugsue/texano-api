import { transaction } from "objection";
import { ContentOptions } from "../lib/models/ContentOptions";

export default class ContentOptionsServices {
  static async deactivateContentOptions(ctx, id) {
    return await ContentOptions.query().patchAndFetchById(id, {
      active: false,
    });
  }
  static async activateContentOptions(ctx, id) {
    return await ContentOptions.query().patchAndFetchById(id, {
      active: true,
    });
  }
}
