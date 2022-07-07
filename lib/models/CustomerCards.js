import { Model } from 'objection';

export class CustomerCards extends Model {
    static tableName = "customer_cards";
    static relationMappings = {
        customer:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "customer_cards.customer_id",
                to: "customer.id",
            }
        },
        card:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./CreditCards").CreditCards,
            join: {
                from: "customer_cards.credit_card_id",
                to: "credit_cards.id",
            }
        },
    }
}