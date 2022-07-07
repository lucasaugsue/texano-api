import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentsRelations extends Model {
    static tableName = "contents_relations";
    static relationMappings = {
        from: {
            relation: Model.HasManyRelation,
            modelClass: require("./Contents").Contents,
            join: {
                from: "contents_relations.from_id",
                to: "contents.id",
            }
        },
        to: {
            relation: Model.HasManyRelation,
            modelClass: require("./Contents").Contents,
            join: {
                from: "contents_relations.to_id",
                to: "contents.id",
            }
        },
    }
}