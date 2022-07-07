import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentAttributes extends Model {
    static tableName = "content_attributes";
    static relationMappings = {
        content_type: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentsTypes").ContentsTypes,
            join: {
                from: "content_attributes.contents_types_id",
                to: "contents_types.id",
            }
        },
        content_options: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentOptions").ContentOptions,
            join: {
                from: "content_attributes.id",
                to: "content_options.content_attributes_id",
            }
        },
        contentType: {
            relation: Model.HasOneRelation,
            modelClass: require("./ContentsTypes").ContentsTypes,
            join: {
                from: "content_attributes.contents_types_id",
                to: "contents_types.id",
            }
        },
    }
}