import { transaction } from "objection";
import { ContentTypesRelations } from "../lib/models/ContentTypesRelations";

export default class ContentTypesRelationsServices {
  static async deactivateContentTypesRelations(ctx, id) {
    return await ContentTypesRelations.query().patchAndFetchById(id, {
      active: false,
    });
  }
  static async activateContentTypesRelations(ctx, id) {
    return await ContentTypesRelations.query().patchAndFetchById(id, {
      active: true,
    });
  }
}
