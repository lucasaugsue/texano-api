import moment from 'moment'
import {Shipping as ShippingModel} from '../models/Shipping'
import {Products as ProductsModel} from '../models/Products'
import {CompanyAddress} from '../models/CompanyAddress'
import ShippingService from '../../services/ShippingService'
import { transaction } from 'objection'
import Correios from 'node-correios'
import SaleService from '../../services/SaleService'

export const Shipping = (router) => {
    
    router.get('/', async (ctx, next) => {
        ctx.body = await ShippingModel.query().joinRelated('product').where('product.company_id',(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id))
    })

    router.post('/', async (ctx, next) => {
        const {product_id,
               nCdEmpresa,
               sDsSenha,
            //    nCdServico,
            //    sCepOrigem,
               nVlPeso,
               nCdFormato,
               nVlComprimento,
               nVlAltura,
               nVlLargura,
               nVlDiametro,
               sCdMaoPropria,
               nVlValorDeclarado,
               sCdAvisoRecebimento
            } = {...ctx.data}
        const trx = await transaction.start(ShippingModel.knex());
        try{
            console.log({data:{...ctx.data}})
            if(!product_id) throw new Error("Precisa de informar um produto")
            if((!sDsSenha && nCdEmpresa) || (sDsSenha && !nCdEmpresa) || nCdEmpresa==='' || sDsSenha==='' ) throw new Error("Precisa das credenciais certas")
            // if(!nCdServico || nCdServico ==='' ) throw new Error("Precisa do código do serviço")
            // if(!sCepOrigem || sCepOrigem === '' ) throw new Error("Precisa do CEP de origem")
            if(!nVlPeso || nVlPeso === '' || !nVlPeso.match(/kg$/g)) throw new Error("Precisa do peso em kg")
            if(!nCdFormato) throw new Error("Precisa do tipo do formato")
            if(!nVlComprimento ) throw new Error("Precisa do comprimento")
            if(!nVlAltura ) throw new Error("Precisa do altura")
            if(!nVlLargura ) throw new Error("Precisa do largura")
            if(!nVlDiametro ) throw new Error("Precisa do diametro")
            
            
            const product = await ProductsModel.query().findOne({id:product_id,company_id:(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)})
            if (!product) throw new Error("Produto nao existe")
            const companyCep = await CompanyAddress.query().withGraphFetched("address").where({company_id:product.company_id, main:true, active:true})
            const sCepOrigem = (companyCep && companyCep.address) ? companyCep.address.cep : ""
            
            const existent = await ShippingModel.query().findOne({product_id:product_id}) 
            if (existent) throw new Error("ja existe informaçoes desse produto")

            if(sCdMaoPropria && !["S","N"].includes(sCdMaoPropria)) throw new Error("Precisa do Mao propria no formato S ou N")
            if(sCdAvisoRecebimento && !["S","N"].includes(sCdAvisoRecebimento)) throw new Error("Precisa do aviso recebimento no formato S ou N")
            if(![1,2,3].includes(nCdFormato)) throw new Error("Selecione um formato certo")
            if (ShippingService.getWeightFromString(nVlPeso) > 1 &&  nCdFormato===3) throw new Error('O peso do envelope tem que ser menor que um quilograma')

            ctx.body = await ShippingModel.query(trx).insertAndFetch({...ctx.data, sCepOrigem})
            trx.commit()
        }catch(err){
            trx.rollback()
            throw new Error(err.message)
        }
    })

    router.patch('/:id', async (ctx, next) => {
        const {product_id,
            nCdEmpresa,
            sDsSenha,
            // nCdServico,
            sCepOrigem,
            nVlPeso,
            nCdFormato,
            sCdMaoPropria,
            sCdAvisoRecebimento
         } = {...ctx.data}
         const params = {...ctx.data}
         const {id} = ctx.params
         const trx = await transaction.start(ShippingModel.knex());
         try{
         if((!sDsSenha && nCdEmpresa) || (sDsSenha && !nCdEmpresa) || nCdEmpresa==='' || sDsSenha==='' ) throw new Error("Precisa das credenciais certas")
        //  if(nCdServico && nCdServico ==='' ) throw new Error("Precisa do código do serviço")
         if(sCepOrigem && sCepOrigem === '' ) throw new Error("Precisa do CEP de origem")
         if(nVlPeso && ( nVlPeso === '' || !nVlPeso.match(/kg$/g))) throw new Error("Precisa do peso em kg")

         if(sCdMaoPropria && !["S","N"].includes(sCdMaoPropria)) throw new Error("Precisa do Mao propria no formato S ou N")
         if(sCdAvisoRecebimento && !["S","N"].includes(sCdAvisoRecebimento)) throw new Error("Precisa do aviso recebimento no formato S ou N")
         if(![1,2,3].includes(nCdFormato)) throw new Error("Selecione um formato certo")
         if (ShippingService.getWeightFromString(nVlPeso) > 1 &&  nCdFormato===3) throw new Error('O peso do envelope tem que ser menor que um quilograma')

         const editedShipping = await ShippingModel.query(trx)
        .updateAndFetchById(id, params)
        //ctx.body = await ShippingModel.query(trx).updateAndFetchById(id,{product_id:product_id})
         ctx.body = editedShipping

        trx.commit()
         }catch(err){
             trx.rollback()
             throw new Error(err.message)
         }
    })

    router.delete('/:id', async (ctx, next) => {
        const trx = await transaction.start(ShippingModel.knex());
        try{
            const selected = await ShippingModel.query(trx).joinRelated('product').alias('s')
            .findOne({
                's.id':ctx.params.id,
                's.active':true,
                'product.company_id':(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
            })
            if (!selected) throw new Error('O id selecionado nao existe ou ja foi apagado')
            await selected.$query().patchAndFetch({active:false})
            trx.commit()
            ctx.status = 204
        }catch(err){
            trx.rollback()
            throw new Error(err.message)
        }
    })
    
    router.post('/frete', async (ctx, next) => {
        const {cep,product_id, products, sale_id} = {...ctx.data}

        console.log({cep,product_id,products,sale_id})
        try {
            let sale
            if(!products || !product_id){
                sale = await SaleService.getSale(ctx.data)
                if(!sale.products || sale.products.length == 0) throw new Error("Não conseguimos encontrar os produtos desta venda!");
            }
            let shipping 

            if(product_id && products){
                console.log({products})
                shipping = await ShippingService.calculateShipping({cep,product_id, products})
            }else{
                console.log({sale})
                const productsIds = sale.products.map(p => p.product_id)
                shipping = await ShippingService.calculateShipping({cep, product_id, products:productsIds})
            }
            console.log({shipping});
            ctx.body = shipping
       
        } catch (error) {
            console.log({error});
                throw new Error(`Erro ao calcular frete: ${error.message}`)
        }
    })
}