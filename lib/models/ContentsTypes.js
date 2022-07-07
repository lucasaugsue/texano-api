import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentsTypes extends Model {
    static tableName = "contents_types";
    static relationMappings = {
        content_attribute: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentAttributes").ContentAttributes,
            join: {
                from: "contents_types.id",
                to: "content_attributes.contents_types_id",
            }
        },
        contents: {
            relation: Model.HasManyRelation,
            modelClass: require("./Contents").Contents,
            join: {
                from: "contents_types.id",
                to: "contents.contents_types_id",
            }
        },
        content_types_relations: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentTypesRelations").ContentTypesRelations,
            join: {
                from: "contents_types.id",
                to: "content_types_relations.from_id",
            }
        }
    }
}