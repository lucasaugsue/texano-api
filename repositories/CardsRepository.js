import moment from "moment";
import { transaction } from "objection";
import { CreditCards } from "../lib/models/CreditCards";
import { CustomerCards } from "../lib/models/CustomerCards";


class CardsRepository {
  constructor() {}

  async getAll() {
    return await CreditCards.query()
  }

  async getAllUsersCards() {
  return await CustomerCards.query().withGraphFetched("[customer, card]")      
  }
  
  async getUserCards(customer_id) {
    return await CustomerCards.query().withGraphFetched("[customer, card]").where('customer_id',customer_id)
  }

  async getActiveUserCards(customer_id) {
    return await CustomerCards.query().withGraphFetched("[customer, card]").where('customer_id',customer_id).andWhere('active', true)
  }
  
  async getCardInfo(card_id) {
    return await CustomerCards.query().withGraphFetched("card").findById(card_id)
  }


  // async createUserCard(data, customer_id, transact) {
  //     const trx = transact || await transaction.start(CustomerCards.knex())
  //     try{
  //       const {cep, country, uf, city, neighborhood, address, complement, number} = data;
  //       // const newCard = await CustomerCards.query(trx).insertGraphAndFetch({
  //       //   customer_id: customer_id,
  //       //   card:{

  //       //   }
  //       // })
  //       // return newCard
  //     }catch(err){
  //       return err
  //     }
  // }

  async deleteUserCard(customer_id,card_id, transact) {
    const trx = transact || await transaction.start(CustomerCards.knex())
    try{
        return await CustomerCards.query(trx).update({active:false}).where('customer_id', customer_id).where('card_id', card_id).where('active', true)
    }catch(err){
        return err
    }
  }
}

const cardsRepository = new CardsRepository();
Object.freeze(cardsRepository);

export default cardsRepository;