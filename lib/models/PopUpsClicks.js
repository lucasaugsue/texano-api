import { Model } from 'objection';

export class PopUpsClicks extends Model {
    static tableName = "popups_clicks" 
    static relationMappings = {
        popup : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./PopUps").PopUps,
            join: {
                from: "popups_clicks.popups_id",
                to: "popups.id",
            }
        },
    }
}