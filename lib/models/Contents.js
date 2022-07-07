import { Model } from "objection"
import { Stock } from '../models/Stock';

export class Contents extends Model {
    static tableName = "contents";
    static relationMappings = {
        attributes: {
            relation: Model.HasManyRelation,
            modelClass: require("./Attributes").Attributes,
            join: {
                from: "contents.id",
                to: "attributes.contents_id",
            }
        },
        content_type: {
            relation: Model.HasOneRelation,
            modelClass: require("./ContentsTypes").ContentsTypes,
            join: {
                from: "contents.contents_types_id",
                to: "contents_types.id",
            }
        },
        contents_relations: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentsRelations").ContentsRelations,
            join: {
                from: "contents.id",
                to: "contents_relations.from_id",
            }
        }
    }
}