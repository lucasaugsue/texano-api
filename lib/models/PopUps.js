import { Model } from 'objection';

export class PopUps extends Model {
    static tableName = "popups" 
    static relationMappings = {
        coupon : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Coupons").Coupons,
            join: {
                from: "coupons.id",
                to: "popups.coupon_id",
            }
        },
        clicks : {
            relation: Model.HasManyRelation,
            modelClass: require("./PopUpsClicks").PopUpsClicks,
            join: {
                from: "popups.id",
                to: "popups_clicks.popup_id",
            }
        },
    }
}