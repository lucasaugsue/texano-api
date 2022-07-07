import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentTypesRelations extends Model {
    static tableName = "content_types_relations";
    static relationMappings = {
        from: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentsTypes").ContentsTypes,
            join: {
                from: "content_types_relations.from_id",
                to: "content_types.id",
            }
        },
        to: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentsTypes").ContentsTypes,
            join: {
                from: "content_types_relations.to_id",
                to: "contents_types.id",
            }
        },
    }
}