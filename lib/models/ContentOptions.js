import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentOptions extends Model {
    static tableName = "content_options";
    static relationMappings = {
        options: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./ContentAttributes").ContentAttributes,
            join: {
                from: "content_options.content_attributes_id",
                to: "content_attributes.id",
            }
        },
    }
}