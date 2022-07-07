import { Model } from 'objection';

export class CustomerAddress extends Model {
    static tableName = "customer_address";
    static relationMappings = {
        customer:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "customer_address.customer_id",
                to: "customer.id",
            }
        },
        address:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Addresses").Addresses,
            join: {
                from: "customer_address.address_id",
                to: "addresses.id",
            }
        },
    }
}