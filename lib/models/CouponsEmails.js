import { Model } from 'objection';

export class CouponsEmails extends Model {
    static tableName = "coupons_emails" 
    static relationMappings = {
        coupon : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Coupons").Coupons,
            join: {
                from: "coupons_emails.coupon_id",
                to: "coupons.id",
            }
        },
        sent_by: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "coupons_emails.sent_by",
                to: "customer.id",
            }
        },
    }
}