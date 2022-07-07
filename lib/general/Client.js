
import Router from "koa-router";
import { CustomerAuth } from './AuthCustomer'
import { Customer as CustomerModel } from "../models/Customer";
import { CustomerPassword as CustomerPasswordModel } from "../models/CustomerPassword";
import { CustomerCards as CustomerCardsModel } from "../models/CustomerCards";
import { raw, transaction } from 'objection'
import SaleService from "../../services/SaleService";
import md5 from "md5";
import { validCpf,isCEP,getExtenseMonth,formatReais,getStatus } from '../../utils/Util'
import isValidCep from '@brazilian-utils/is-valid-cep';
import addressRepository from '../../repositories/AddressRepository'
import { CustomerAddress } from '../models/CustomerAddress'
import { Addresses } from '../models/Addresses'
import CoalahPayService from "../../services/CoalahPayService";
import { CreditCards as CreditCardsModel } from '../models/CreditCards'
import { Companies, Companies as CompaniesModel } from '../models/Companies'
import { Transactions, Transactions as TransactionsModel } from '../models/Transactions'
import cardsRepository from '../../repositories/CardsRepository'
import { Sales } from "../models/Sales";
import { SaleHistory } from "../models/SaleHistory";
import moment from "moment";
import { RenderEmail } from "../../utils/RenderEmail";
import { CompanyInstallments as CompanyInstallmentsModel } from '../models/CompanyInstallments';
import { SaleAddress } from "../models/SaleAddress";
import ShippingService from "../../services/ShippingService";
import { SalesStock } from "../models/SalesStock";
import { PromotionProduct } from "../models/PromotionProduct";


export const Client = (router) => {

  //login & signup
  const authCustomer = new Router({prefix:'/auth'})
  CustomerAuth(authCustomer)
  router.use(authCustomer.routes())

  // Customer middleware
  router.use(async (ctx, next) => {
	const Customer = require("../models/Customer").Customer
	try {
	  if(ctx.request.header.customer_token && ctx.request.header.customer_token.startsWith('Bearer')) {
		let token = ctx.request.header.customer_token
		let url = ctx.request.url
		let companyId =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
		let breakup = token.split('.')
		let customerDetails = Buffer.from(breakup[1], 'base64').toString()
		let customer = JSON.parse(customerDetails)
		let customerInfo = customer.id && await Customer.query().findOne({id:customer.id,company_id:companyId})
		if(!customerInfo) throw new Error('Informe um usuario valido')

		ctx.customerInfo = customerInfo
	  }else{
		throw new Error('Informe um login valido')
	  }
	  await next()

	} catch (error) {
		throw new Error(error.message)
	}
  })

  // Client info related
  router.get("/", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	const customerInfo = await CustomerModel.query().findById(customer.id)

	ctx.body = customerInfo

  });

  router.patch('/', async (ctx, next) => {
	let params = {...ctx.data}
	const trx = await transaction.start(CustomerModel.knex())
	try{
		const customer = ctx.customerInfo
		if(!customer) throw new Error("Faça um login")

		if(!params.name || params.name.length ===0) throw new Error(ctx.strings.noName)
		if(!params.birthdate || params.birthdate.length <6) throw new Error(ctx.strings.noBirthday)
		if(!params.email || params.email.length <6) throw new Error("Informe o email")
		if(!params.cpf || params.cpf.length <6) throw new Error(ctx.strings.noCpf)
		if(!params.phone || params.phone.length <6) throw new Error(ctx.strings.noPhone)

		params.cpf = params.cpf.replace(/ |\.|\-|\_/g, "")
		if(!validCpf(params.cpf))throw new Error('insira um cpf valido')

		if(params.password || params.password_confirmation){
			if( params.password && params.password.length>6) throw new Error("Senha precisa ter mais de 6 digitos")
			if(params.password !== params.password_confirmation) throw new Error('As senhas devem ser iguais')
			await CustomerPasswordModel.query(trx).findOne({customer_id:customer.id}).patch({password:md5(params.password)})
			delete params.password_confirmation
			delete params.password
		}
		if (params.name) {
			params.name = params.name.toUpperCase()
		}
		
		const editedCustomer = await CustomerModel.query(trx)
		.patchAndFetchById(customer.id, params)
			
		await trx.commit()
		ctx.status = 200
		ctx.body = editedCustomer

	} catch(err){
		await trx.rollback()
		throw new Error(err.message)
	}
  })

  // Sales related 
  router.get("/all-sales", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	const response = await SaleService.salesByCustomer(customer.id)
	ctx.body = response
  });

  router.post("/add-item", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	params.company_id =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)

	try {
		if (!params.company_id) throw new Error(" é preciso do usuário");
		if (!params.stock_id && !params.product_id) throw new Error(" é preciso do id do estoque ou produto");
		if (params.amount && typeof params.amount === "string") throw new Error(" quantidade precisa ser numero");
		if (!params.amount) {params.amount = 1}

		const response = await SaleService.addItem(params)
		ctx.body = response
	} catch (error) {
		throw new Error(`Erro ao adicionar item a venda, ${error.message}`);
	}
  });

  router.post("/remove-item", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	try {
		if (!params.sale_id) throw new Error(" é preciso do id da venda ");
		if (!params.product_id) throw new Error(" é preciso do id do produto ");
		const response = await SaleService.removeItem(params,params.product_id)
		ctx.body = response
	} catch (error) {
		throw new Error(`Erro ao remover item da venda,${error.message}`);
	}
  });
  router.patch("/check-unfinished", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	if(params.price && params.itensInCart && (params.itensInCart.length>0)){
		const productPromotion = await PromotionProduct.query().whereIn("product_id",params.itensInCart.map(i => i.product.id));
		if(!productPromotion || (productPromotion.length == 0)){
			const salePrice = params.price;
			const itensPrice = params.itensInCart.map(i => i.price);
			const reducedPrice = itensPrice.reduce((pv, cv) => pv + cv,0);
			if(reducedPrice > salePrice){
				const updatedSale = await Sales.query().updateAndFetchById(params.id, {
					price:reducedPrice
				})
			}
		}
	}
	const response = await SaleService.salesByCustomer(customer.id)
	ctx.body = response
  });

  	// Installments related
	router.get('/available/:sale_id', async (ctx, next) => {
		const customer = ctx.customerInfo
		const sale = await Sales.query().findById(ctx.params.sale_id)

		var installments = await CompanyInstallmentsModel.query()
		.where("company_installments.company_id", customer.company_id)
		//.where("active", true)

		let final = installments.reduce((acc, curr) => {
			let item = (sale.price/parseInt(curr.num_installments)) >= parseFloat(curr.min_value) 
			if(item === true) {
				acc.push({
					id: curr.id,
					company_id: curr.company_id,
					num_installments: parseInt(curr.num_installments),
					price:(sale.price/parseInt(curr.num_installments))
				})
			}

			return acc
		}, [])

		ctx.body = final
	})
	router.post('/new-installment', async (ctx, next) => {
		const trx = await transaction.start(Sales.knex())
		try{
			const data = {...ctx.data}
			if(!data.sale) throw new Error("Não encontramos esta venda, entre em contato com o suporte!");
			const sale = await SaleService.getSale({sale_id: data.sale.id})
			if(!sale) throw new Error("Não encontramos esta venda, entre em contato com o suporte!");
			const updatedSale = await Sales.query().updateAndFetchById(sale.id,{
				installment_price: data.price,
				installment_amount:data.num_installments || 1
			})
			let response
			await trx.commit();
			ctx.body = response
		}catch(err){
			await trx.rollback();
			throw new Error(err.message);
		}
	})

  // Credit cards related
  router.get('/all-cards', async (ctx, next) => {
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
  
	ctx.body = await cardsRepository.getActiveUserCards(customer.id)
  })

  router.patch('/remove-card/:card_id', async (ctx, next) => {
	const {card_id} = ctx.params
	const trx = await transaction.start(CustomerCardsModel.knex())
	try{
		const customer = ctx.customerInfo
		if(!customer) throw new Error("Faça um login")
		if(!card_id) throw new Error("Não encontramos este cartão, por favor tente novamente!");
		const deletedCard = await cardsRepository.deleteUserCard(customer.id,card_id, trx);
		
		await trx.commit();
		ctx.body = deletedCard
		ctx.status = 200
	}catch(err){
		await trx.rollback();
		ctx.status = 400
		throw new Error(`Houve um problema ao deletar o cartão: ${err.message}`)
	}
	
  })

  router.post("/add-card", async (ctx, next) => {
	let params = { ...ctx.data };
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	const trx = await transaction.start(CustomerModel.knex())
	try {
		const company = await CompaniesModel.query().findById(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
		if (!company || !company.coalah_pay_key || company.coalah_pay_key==='')throw new Error('Nao foi possivel cadastrar o cartao, entre em contato com a empresa')
		if(!params.number) throw new Error("Para cadastrar um cartao de credito e necessario o numero")
		if(!params.brand) throw new Error("Para cadastrar um cartao de credito e necessario a marca")
		if(!params.holder) throw new Error("Para cadastrar um cartao de credito e necessario o nome do portador")
		if(!params.security) throw new Error("Para cadastrar um cartao de credito e necessario o cvc")
		if(!params.expiry) throw new Error("Para cadastrar um cartao de credito e necessario o prezo de expirar")

		const cardResponse = await CoalahPayService.createTokenCard(company.coalah_pay_key, {
			cpf: customer.cpf,
			card: {
				number: params.number,
				brand: params.brand,
				holder: params.holder,
				expiry: `${params.expiry.split("/")[0]}/${`20${params.expiry.split("/")[1]}`.slice(-4)}`,
				cvv: params.security,
			},
		})

		const crypted_number = md5(params.number)
		const creditCard = await CreditCardsModel.query(trx).insertAndFetch({
			key: cardResponse.token,
			origin: "coalah",
			crypted_number,
			brand: params.brand,
		})
		const response = await CustomerCardsModel.query(trx).insertAndFetch({
			customer_id:customer.id,
			credit_card_id:creditCard.id,
			last_digits:params.number.slice(-4)
		})
		await trx.commit()
		ctx.body = response

	} catch (error) {
		await trx.rollback()
		throw new Error(`Erro ao cadastrar cartao de credito,${error.message}`);
	}
  })

  //Address related
  router.get('/all-address', async (ctx, next) => {
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	ctx.body = await addressRepository.getActiveUserAddresses(customer.id)
  })

  router.post('/new-address', async (ctx, next) => {
	const data = {...ctx.data}
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
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

		const newAddress = await addressRepository.createUserAddress(data,customer.id, trx);
		
		await trx.commit();
		ctx.body = {...newAddress, customer_id: customer.id}
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

  router.patch('/remove-address/:address_id', async (ctx, next) => {
	const { address_id} = ctx.params
	const customer = ctx.customerInfo
	if(!customer) throw new Error("Faça um login")
	const trx = await transaction.start(CustomerAddress.knex())
	try{
		if(!address_id) throw new Error("Não encontramos este endereço, por favor tente novamente!");
		const deletedAddress = await addressRepository.deleteUserAddress(customer.id, address_id, trx);
		
		await trx.commit();
		ctx.body = deletedAddress
		ctx.status = 200
	}catch(err){
		await trx.rollback();
		ctx.status = 400
		throw new Error(`Houve um problema ao deletar o endereço: ${err.message}`)
	}
	
  })
  
  router.patch('/cart/finish', async (ctx, next) => {
	const { address_id, sale_id, customer_card_id, installments, totalPrice} = ctx.data
	
	const trx = await transaction.start(Sales.knex())
	try{

		if(!sale_id) throw new Error("Não foi passado o id da venda, tente novamente!")
		if(!customer_card_id) throw new Error("Não foi passado o id do cartão do usuário, tente novamente!")
		const validSale = await Sales.query(trx).findById(sale_id).withGraphFetched("customer")
		if(!validSale) throw new Error("Não foi possível localizar esta venda, tente novamente!")
		const sale = await SaleService.getSale(ctx.data)
		let updatedSaleWithShipping
		updatedSaleWithShipping = await Sales.query(trx).updateAndFetchById(sale.id,{price:totalPrice})
		console.log({updatedSaleWithShipping})
		const customer = validSale.customer
		const card = await cardsRepository.getCardInfo(customer_card_id)
		if(!card || !card.card) throw new Error("Não encontramos seu método de pagamento, por favor entre em contato com o suporte!")
		const address = await Addresses.query(trx).findById(address_id)
        const saleAddress = await SaleAddress.query(trx).insertAndFetch({
          sale_id:sale_id,
          cep:address.cep,
          country:address.country,
          uf:address.uf,
          city:address.city,
          neighborhood:address.neighborhood,
          address:address.address,
          complement:address.complement,
          number:address.number
        })

        const productIdsList = sale.products.reduce((o,n)=>{
          var ids = []
          for(var i=0;i<n.amount;i++){
              ids.push(n.product_id)
          }
          return [...o,...ids]
        },[])

		var frete
        //frete = await ShippingService.calculateShipping({cep:address.cep,products:productIdsList})
		//console.log({frete})

		//PARAMS PARA TRANSAÇÃO
		// {
		//   "description": "Descrição da compra",
		//   "value": value,
		//   "token": cardToken,
		//   "installments": Parcelas
		// }

		const paymentParams = {
		  description: "Moov",
		  value: updatedSaleWithShipping.price || 1,
		  token: card.card.key,
		  installments: installments || 1
		}

		const company = await Companies.query(trx).withGraphFetched("sell_email").findById(customer.company_id).select('coalah_pay_key')
		if(!company) throw new Error("Não encontramos esta compania, por favor entre em contato com o suporte!")
		const companyEmail = company.sell_email.find(item => item.active == true)
		// if(!companyEmail) throw new Error("Não encontramos um e-mail para esta compania, por favor entre em contato com o suporte!");
		
		let payment
		if(parseFloat(updatedSaleWithShipping.price) > parseFloat(0.9)){
			payment = await CoalahPayService.makeCreditTransaction(company.coalah_pay_key, paymentParams)
			if(payment){

			//Saving transaction
			const newTransaction = await Transactions.query(trx).insertAndFetch({
			  credit_card_id:card.card.id,
			  key:payment.key,
			  origin:payment.origin,
			  value:updatedSaleWithShipping.price,
			  payed_value:updatedSaleWithShipping.price,
			  payed_date:moment().format(),
			  due_date:moment().format()
			})

			//Updating sale
			const updatedSale = await Sales.query(trx).updateAndFetchById(sale_id,{
			  transaction_id: newTransaction.id,
			  payment_id:sale.payment_method_id
			})

			//Changing status to confirmed
			const newSaleHistory = await SaleHistory.query(trx).insertAndFetch({
			  sale_id:sale.id,
			  status:10
			})

		  }
		}
		await trx.commit();

		RenderEmail(
			customer.email, 
			companyEmail.email, 
			"Compra Moov",
			"changeStatus",
			{...sale,
			  ...sale.shipping_address,
			  day:moment().format('DD'),
			  month:getExtenseMonth(parseInt(moment().format("MM")) - 1),
			  year:moment().format('YYYY'),
			  name:customer.name,
			  sale_id:sale.id,
			  sale_date:moment(sale.sale_date).format('DD/MM/YYYY'),
			  products:sale.products.map(i=>{
				var image = null
				if(i.product_images.length){
				  const main = i.product_images.find(image=> image.main)
				  image = (main)?main.image_url:i.product_images[0].image_url
				}
				return{
					...i,
					unit_price:formatReais(i.unit_price),
					image
				}
			  }),
			  status:getStatus(sale.status),
			  displacement_rate:formatReais(frete?frete.displacement_rate:0),
			  final_price:formatReais(updatedSaleWithShipping.price),
			  contact_phone:'(61) 3029-9415',
			  total:formatReais(updatedSaleWithShipping.price+(frete?frete.displacement_rate:0))
			  }
		)
		console.log("AQUIIII")

		ctx.body = await SaleService.getSale({sale_id:updatedSaleWithShipping.id})
		ctx.status = 200
	}catch(err){
		console.log("AQUIIII",err)

		await trx.rollback();
		ctx.status = 400
		throw new Error(`Houve um problema ao finalizar a compra: ${err.message}`)
	}
	
  })

  router.patch("/void/:sale_id", async (ctx, next) => {
	const {sale_id} =  ctx.params
	const data =  {...ctx.data}
	const trx = await transaction.start(Sales.knex());
	try {
	  const params = {
		...data,
		sale_id
	  }
	  const saleInfo = await SaleService.getSale(params)

	  const sale = await Sales.query(trx).findById(sale_id).withGraphFetched('[transaction, payments]')
	  if(!sale) throw new Error("Não foi possível encontrar esta venda, por favor entre em contato com o Suporte!");
	  if(!sale.transaction)throw new Error("Esta venda não foi finalizada ainda!");

	  const company = await Companies.query(trx).findById(sale.company_id).select('coalah_pay_key')
	  if(!company) throw new Error("Não conseguimos completar o estorno desta transação, por favor entre em contato com o Suporte!");

	  //Reffunding
	  const voided = await CoalahPayService.voidPayment(company.coalah_pay_key, sale.transaction.key)

	  //Adding voided value to transactions
	  const updatedTransactions = await Transactions.query(trx).updateAndFetchById(sale.transaction.id,{
		updated_at: moment().format(),
		voided_at: moment().format(),
		voided_value:saleInfo.final_price
	  })

	  //Updating sale history
	  const voidedSaleHistory = await SaleHistory.query(trx).insertAndFetch({
		sale_id:sale.id,
		status:4 //reffunded
	  })
	  await trx.commit();
	  ctx.body = sale;
	  ctx.status = 200;
	} catch (err) {
	  await trx.rollback();
	  throw new Error(`Houve um problema ao estornar a compra: ${err.message}`)
	}
  });

  router.get("/actual/cart", async (ctx, next) => {
	const customer = ctx.customerInfo
	const companyId =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
	try {
	  const response = await SaleService.allOpenSales(companyId,customer.id)
	  
	  ctx.body = (response.length > 0 ? response[0] : {});
	  ctx.status = 200;
	} catch (err) {
	  throw new Error(`Houve um problema ao retornar o seu carrinho: ${err.message}`)
	}
  });
  router.patch("/change/product/customization", async (ctx, next) => {
    let params = { ...ctx.data, ...ctx.params };
    const trx = await transaction.start(SalesStock.knex());

    try{
		const response = await SaleService.changeSaleProductCustomization({...params, trx}); 
        await trx.commit();
		ctx.body = response;
		ctx.status = 200;
    }catch(err){
        await trx.rollback();
		ctx.status = 500;
		throw new Error ("Não foi possível alterar esta customização: ", err.message);
    }
  });
}