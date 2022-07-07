import moment from "moment";
import { transaction } from "objection";
import { Addresses } from "../lib/models/Addresses";
import { CustomerAddress } from "../lib/models/CustomerAddress";
import { CompanyAddress } from "../lib/models/CompanyAddress";

class AddressRepository {
  constructor() {}

  async getAll() {
    return await Addresses.query()
  }

  async getAllUsersAddresses() {
    return await CustomerAddress.query().withGraphFetched("[customer, address]")      
  }
  
  async getUserAddresses(customer_id) {
    return await CustomerAddress.query().withGraphFetched("[customer, address]").where('customer_id',customer_id)
  }

  async getActiveUserAddresses(customer_id) {
    return await CustomerAddress.query().withGraphFetched("[customer, address]").where('customer_id',customer_id).andWhere('active', true)
  }


  async createUserAddress(data, customer_id, transact) {
      const trx = transact || await transaction.start(CustomerAddress.knex())
      try{
        const {cep, country, uf, city, neighborhood, address, complement, number} = data;
        let existentCustomerAddress
        let response
        const existentAddress = await Addresses.query(trx).findOne({cep,country,uf});
        console.log({existentAddress})
        if(existentAddress){
          existentCustomerAddress = await CustomerAddress.query(trx).findOne({customer_id,address_id:existentAddress.id})
          console.log({existentCustomerAddress})
          if(existentCustomerAddress) response = existentCustomerAddress;
        }
        if(!existentCustomerAddress){
          if(!existentAddress){
            const newAddress = await CustomerAddress.query(trx).insertGraphAndFetch({
              customer_id: customer_id,
              address:{
                cep,
                country, 
                uf, 
                city, 
                neighborhood, 
                address, 
                complement, 
                number,
                created_at: moment().format(),
                updated_at: moment().format(),
              }
            })
          response = newAddress
          }else{
            response = await CustomerAddress.query(trx).withGraphFetched("address").insertGraphAndFetch({
              customer_id: customer_id,
              address_id:existentAddress.id
            })
          }
        }
        return response
      }catch(err){
        return err
      }
  }
  
  async editUserAddress(data, address_id, transact) {
    const trx = transact || await transaction.start(CustomerAddress.knex())
      try{
        const {cep, country, uf, city, neighborhood, address, complement, number} = data;
        const editedAddress = await Addresses.query(trx).updateAndFetchById(address_id,{
            cep,
            country, 
            uf, 
            city, 
            neighborhood, 
            address, 
            complement, 
            number,
            updated_at: moment().format(),
        })

        return editedAddress
      }catch(err){
        return err
      }
  }

  async deleteUserAddress(customer_id, address_id, transact) {
    const trx = transact || await transaction.start(CustomerAddress.knex())
    try{
        return await CustomerAddress.query(trx).update({active:false}).where('customer_id', customer_id).where('address_id', address_id).where('active', true)
    }catch(err){
        return err
    }
  }
  
  async getCompanyAddresses(company_id) {
    return await CompanyAddress.query()
    .withGraphFetched("[company, address]")
    .where({company_id})
    .where('active', true)
  }
  
  async getCompanyAddressInfo(address_id) {
    return await CompanyAddress.query()
    .withGraphFetched("[company, address]")
    .findById(address_id)
    .where('active', true)
  }

  async getMainCompanyAddress(company_id) {
    return await CompanyAddress.query().withGraphFetched("[company, address]").where({company_id}).andWhere('main', true)
  }

  async createCompanyAddress(data, company_id, transact) {
    const trx = transact || await transaction.start(CompanyAddress.knex())
    try{
      const {cep, country, uf, city, neighborhood, address, complement="", number="", main} = data;
      if(main && (main=="true" || main==true)){
        const alreadyHasMainAddress = await CompanyAddress.query().findOne({company_id,main});
        if(alreadyHasMainAddress) throw new Error ("Você já possui um endereço principal nesta empresa! Desative-o primeiro para tornar este o seu principal.");
      }
      const companyAddress = await CompanyAddress.query().findById(company_address_id);
      if(!companyAddress){
        throw new Error("Não foi possível encontar este endereço");
      }else{
        const updatedRegister = await CompanyAddress.query().updateAndFetchById(company_address_id,{main})
      }
      const newAddress = await CompanyAddress.query(trx).insertGraphAndFetch({
          company_id: company_id,
          main,
          address:{
              cep,
              country, 
              uf, 
              city, 
              neighborhood, 
              address, 
              complement, 
              number: number,
              created_at: moment().format(),
              updated_at: moment().format(),
          }
      })
      await trx.commit();
      return newAddress
    }catch(err){
      await trx.rollback();
      return err
    }
}

async editCompanyAddress(data, company_address_id, company_id, transact) {
  const trx = transact || await transaction.start(CompanyAddress.knex())
    try{
      const {cep, country, uf, city, neighborhood, address, complement, number, main} = data;
      if(main && (main=="true" || main==true)){
        const alreadyHasMainAddress = await CompanyAddress.query().findOne({company_id,main});
        if(alreadyHasMainAddress) throw new Error ("Você já possui um endereço principal nesta empresa! Desative-o primeiro para tornar este o seu principal.");
      }
      const companyAddress = await CompanyAddress.query().findById(company_address_id)
      if(!companyAddress){
        throw new Error("Não foi possível encontar este endereço");
      }else{
        const updatedRegister = await CompanyAddress.query().updateAndFetchById(company_address_id,{main})
      }
      const editedAddress = await Addresses.query(trx).updateAndFetchById(address_id,{
          cep,
          country, 
          uf, 
          city, 
          neighborhood, 
          address, 
          complement, 
          number,
          updated_at: moment().format(),
      })

      await trx.commit();
      return editedAddress
    }catch(err){
      await trx.rollback();
      return err
    }
}

async deleteCompanyAddress(company_id, address_id, transact) {
  const trx = transact || await transaction.start(CompanyAddress.knex())
  try{
    const updated = await CompanyAddress.query(trx).updateAndFetchById(address_id,{active:false, main:false})
    await trx.commit();
    return updated
  }catch(err){
    await trx.rollback();
    return err
  }
}
}

const addressRepository = new AddressRepository();
Object.freeze(addressRepository);

export default addressRepository;