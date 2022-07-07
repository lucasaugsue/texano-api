import moment from 'moment'
import Authenticate from '../../middlewares/Authenticate'
import { Resources as ResourcesModel } from '../models/Resources'
import { ResourcesProfiles as ResourcesProfilesModel } from '../models/ResourcesProfiles'
import AuthService from '../../services/AuthService'
import { CustomerAddress } from '../models/CustomerAddress'
import { Addresses } from '../models/Addresses'
import { isCEP } from '../../utils/Util'
import isValidCep from '@brazilian-utils/is-valid-cep';
import { transaction } from 'objection'
import addressRepository from '../../repositories/AddressRepository'


export const Address = (router) => {

    router.get('/', async (ctx, next) => {
        ctx.body = await addressRepository.getAll()
    })
    
    router.get('/customers', async (ctx, next) => {
        ctx.body = await addressRepository.getAllUsersAddresses()
    })
    
    router.get('/all/:customer_id', async (ctx, next) => {
        const {customer_id} = ctx.params
        ctx.body = await addressRepository.getUserAddresses(customer_id)
    })
    
    router.get('/active/:customer_id', async (ctx, next) => {
        const {customer_id} = ctx.params
        ctx.body = await addressRepository.getActiveUserAddresses(customer_id)
    })
    
    router.post('/new/:customer_id', async (ctx, next) => {
        const data = {...ctx.data}
        const {customer_id} = ctx.params
        const trx = await transaction.start(CustomerAddress.knex())
        try{
            if(!data.cep) throw new Error("Por favor informe o CEP!");
            if(!data.country) throw new Error("Por favor informe o país!");
            if(!data.uf) throw new Error("Por favor informe a UF!");
            if(!data.city) throw new Error("Por favor informe a Cidade!");
            if(!data.neighborhood) throw new Error("Por favor informe o Bairro!");
            if(!data.address) throw new Error("Por favor informe o Endereço!");
            if(!data.number) throw new Error("Por favor informe o Número!");
            const iC = isCEP(data.cep)
            const validCep = isValidCep(data.cep)

            if(!iC || (iC && !validCep)) throw new Error("Este CEP é inválido ou inexistente!");

            const newAddress = await addressRepository.createUserAddress(data,customer_id, trx);
            
            await trx.commit();
            ctx.body = newAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema com o cadastro do endereço: ${err.message}`)
        }
        
    })

    router.patch('/edit/:address_id', async (ctx, next) => {
        const data = {...ctx.data}
        const {address_id} = ctx.params
        const trx = await transaction.start(Addresses.knex())
        try{
            if(!data.cep) throw new Error("Por favor informe o CEP!");
            if(!data.country) throw new Error("Por favor informe o país!");
            if(!data.uf) throw new Error("Por favor informe a UF!");
            if(!data.city) throw new Error("Por favor informe a Cidade!");
            if(!data.neighborhood) throw new Error("Por favor informe o Bairro!");
            if(!data.address) throw new Error("Por favor informe o Endereço!");
            if(!data.number) throw new Error("Por favor informe o Número!");

            const iC = isCEP(data.cep)
            const validCep = isValidCep(data.cep)

            if(!iC || (iC && !validCep)) throw new Error("Este CEP é inválido ou inexistente!");

            const editedAddress = await addressRepository.editUserAddress(data, address_id, trx)
            
            await trx.commit();
            ctx.body = editedAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema com a edição do endereço: ${err.message}`)
        }
        
    })

    router.patch('/delete/:customer_id/:address_id', async (ctx, next) => {
        const {customer_id, address_id} = ctx.params
        const trx = await transaction.start(CustomerAddress.knex())
        try{
            if(!address_id) throw new Error("Não encontramos este endereço, por favor tente novamente!");
            const deletedAddress = await addressRepository.deleteUserAddress(customer_id, address_id, trx);
            
            await trx.commit();
            ctx.body = deletedAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema ao deletar o endereço: ${err.message}`)
        }
        
    })

    router.get('/company/:company_id', async (ctx, next) => {
        const {company_id} = ctx.params
        ctx.body = await addressRepository.getCompanyAddresses(company_id)
    })
    
    router.get('/main/:company_id', async (ctx, next) => {
        const {company_id} = ctx.params
        ctx.body = await addressRepository.getMainCompanyAddress(company_id)
    })
    
    router.post('/company/new/:company_id', async (ctx, next) => {
        const data = {...ctx.data}
        const {company_id} = ctx.params
        const trx = await transaction.start(CustomerAddress.knex())
        try{
            if(!data.cep) throw new Error("Por favor informe o CEP!");
            if(!data.country) throw new Error("Por favor informe o país!");
            if(!data.uf) throw new Error("Por favor informe a UF!");
            if(!data.city) throw new Error("Por favor informe a Cidade!");
            if(!data.neighborhood) throw new Error("Por favor informe o Bairro!");
            if(!data.address) throw new Error("Por favor informe o Endereço!");

            const iC = isCEP(data.cep)
            const validCep = isValidCep(data.cep)

            if(!iC || (iC && !validCep)) throw new Error("Este CEP é inválido ou inexistente!");

            const newAddress = await addressRepository.createCompanyAddress(data,company_id, trx);
            
            await trx.commit();
            ctx.body = newAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema com o cadastro do endereço: ${err.message}`)
        }
        
    })

    router.patch('/company/edit/:company_id/:company_address_id', async (ctx, next) => {
        const data = {...ctx.data}
        const {company_address_id, company_id} = ctx.params
        const trx = await transaction.start(Addresses.knex())
        try{
            if(!data.cep) throw new Error("Por favor informe o CEP!");
            if(!data.country) throw new Error("Por favor informe o país!");
            if(!data.uf) throw new Error("Por favor informe a UF!");
            if(!data.city) throw new Error("Por favor informe a Cidade!");
            if(!data.neighborhood) throw new Error("Por favor informe o Bairro!");
            if(!data.address) throw new Error("Por favor informe o Endereço!");

            const iC = isCEP(data.cep)
            const validCep = isValidCep(data.cep)

            if(!iC || (iC && !validCep)) throw new Error("Este CEP é inválido ou inexistente!");

            const editedAddress = await addressRepository.editCompanyAddress(data, company_address_id,company_id, trx)
            
            await trx.commit();
            ctx.body = editedAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema com a edição do endereço: ${err.message}`)
        }
        
    })
    
    router.get('/company/info/:address_id', async (ctx, next) => {
        const {address_id} = ctx.params
        try{
            const address = await addressRepository.getCompanyAddressInfo(address_id)
            if(!address) throw new Error("Não contramos este endereço");
            ctx.body = address
            ctx.status = 200
        }catch(err){
            ctx.status = 400
            throw new Error(`Houve um problema com o endereço: ${err.message}`)
        }
        
    })

    router.patch('/company/delete/:company_id/:address_id', async (ctx, next) => {
        const {company_id, address_id} = ctx.params
        const trx = await transaction.start(CustomerAddress.knex())
        try{
            if(!address_id) throw new Error("Não encontramos este endereço, por favor tente novamente!");
            const deletedAddress = await addressRepository.deleteCompanyAddress(company_id, address_id, trx);
            
            await trx.commit();
            ctx.body = deletedAddress
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema ao deletar o endereço: ${err.message}`)
        }
        
    })
    
}
