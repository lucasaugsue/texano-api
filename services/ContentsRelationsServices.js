import { transaction } from "objection";
import { ContentsRelations } from "../lib/models/ContentsRelations";

export default class ContentsRelationsServices {
  static async deactivateContentsRelations(ctx, id) {
    return await ContentsRelations.query().patchAndFetchById(id, {
      active: false,
    });
  }
  static async activateContentsRelations(ctx, id) {
    return await ContentsRelations.query().patchAndFetchById(id, {
      active: true,
    });
  }
}
