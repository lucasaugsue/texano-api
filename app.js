import koa from 'koa';
import moment from 'moment';
import Router from 'koa-router';
import body from '@koa/multer'
import koaBody from 'koa-body'
import http from 'http';
import Knex from 'knex';
import AuthenticationMiddleware from './middlewares/Authentication';
import AuthenticationPrivateMiddleware from './middlewares/AuthenticationPrivate';
import ActionLogMiddleware from './middlewares/ActionLog';
import { DefaultJobs } from './jobs/DefaultJobs';
import { DefaultEvents } from './events/DefaultEvents';
import { Strings } from './utils/Strings';
import { Model } from "objection";

const koaServer = new koa();

require('dotenv').config()

const server = http.createServer(koaServer.callback())
server.setTimeout(0);

const io = require('socket.io')(server, { serveClient: false })

const knex = Knex(require('./knexfile'))
Model.knex(knex)

server.listen(process.env.PORT || 8111)
console.log('Server running in http://localhost:' + (process.env.PORT || 8111))

koaServer.use(koaBody())
koaServer.use(body().any())
koaServer.use(async (ctx, next) => {
	const lang = ctx.request.header['language'] || ""
	ctx.strings = Strings[lang.split("_")[0]] || Strings['en']
	ctx.started_at = moment()

	ctx.logs = {
		send_mail_error: false,
		save_db: true,
	}
    if(ctx.method === "GET") ctx.data = {...require('url').parse(ctx.request.url, true).query, ...ctx.params};
    else ctx.data = {...ctx.request.body};

    console.log(ctx.method, ctx.url)

	ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin || '*')
	ctx.set('Access-Control-Allow-Headers', ctx.request.header['access-control-request-headers'] || '*')
	ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE')
	ctx.set('Access-Control-Allow-Credentials', 'true')
	ctx.set('Allow', 'POST, GET, OPTIONS, PUT, PATCH, DELETE')
	ctx.set('Server', 'ApiServer')
	if (ctx.method === 'OPTIONS') {
		ctx.body = ''
		return
	}
	await next();
})

io.on('connection', (socket) => {
	DefaultEvents(socket)
	PixEvents(socket)
})

DefaultJobs({io})

koaServer.use(ActionLogMiddleware)
koaServer.use(AuthenticationMiddleware)

const publicRouter = new Router({ prefix: '/public' })
import { Public } from './lib/general/Public'
Public(publicRouter)
koaServer.use(publicRouter.routes())

const searchesRouter = new Router({ prefix: '/searches' })
import { Searches } from './lib/general/Searches'
Searches(searchesRouter)
koaServer.use(searchesRouter.routes())

const hooksRouter = new Router({ prefix: '/hooks' })
import { Hooks } from './lib/general/Hooks'
Hooks(hooksRouter)
koaServer.use(hooksRouter.routes())

const checkRouter = new Router({ prefix: '/check' })
import { Check } from './lib/general/Check'
Check(checkRouter)
koaServer.use(checkRouter.routes())

const authRouter = new Router({ prefix: '/auth' })
import { Auth } from './lib/general/Auth'
Auth(authRouter)
koaServer.use(authRouter.routes())

const webhooksRouter = new Router({ prefix: '/hooks' })
import { Webhooks } from './lib/general/Webhooks'
Webhooks(webhooksRouter)
koaServer.use(webhooksRouter.routes())

const availabilityRouter = new Router({ prefix: '/availability' })
import { Availability } from './lib/general/Availability'
Availability(availabilityRouter)
koaServer.use(availabilityRouter.routes())

const schedules_datesRouter = new Router({ prefix: '/schedules_dates' })
import { Schedules_dates } from './lib/general/Schedules_dates'
Schedules_dates(schedules_datesRouter)
koaServer.use(schedules_datesRouter.routes())

const popupRouter = new Router({ prefix: '/popups' })
import { PopUps } from './lib/general/PopUps'
PopUps(popupRouter)
koaServer.use(popupRouter.routes())

// private routes
koaServer.use(AuthenticationPrivateMiddleware)

const usersRouter = new Router({ prefix: '/users' })
import { Users } from './lib/general/Users'
Users(usersRouter)
koaServer.use(usersRouter.routes())

const productsRouter = new Router({ prefix: '/itens' })
import { Products } from './lib/general/Products'
Products(productsRouter)
koaServer.use(productsRouter.routes())

const categoriesRouter = new Router({ prefix: '/categories' })
import { Categories } from './lib/general/Categories'
Categories(categoriesRouter)
koaServer.use(categoriesRouter.routes())

const stockRouter = new Router({ prefix: '/stock' })
import { Stock } from './lib/general/Stock'
Stock(stockRouter)
koaServer.use(stockRouter.routes())

const paymentsRouter = new Router({ prefix: '/payments' })
import { Payments } from './lib/general/Payments'
Payments(paymentsRouter)
koaServer.use(paymentsRouter.routes())

const roomRouter = new Router({ prefix: '/rooms' })
import { Rooms } from './lib/general/Rooms'
Rooms(roomRouter)
koaServer.use(roomRouter.routes())

const serviceRouter = new Router({ prefix: '/services' })
import { Services } from './lib/general/Services'
Services(serviceRouter)
koaServer.use(serviceRouter.routes())

const serviceRoomRouter = new Router({ prefix: '/servicesrooms' })
import { ServicesRooms } from './lib/general/ServicesRooms'
ServicesRooms(serviceRoomRouter)
koaServer.use(serviceRoomRouter.routes())

const contentOptionsRouter = new Router({ prefix: '/contentoptions' })
import { ContentOptions } from './lib/general/ContentOptions'
ContentOptions(contentOptionsRouter)
koaServer.use(contentOptionsRouter.routes())

const contentTypesRelationsRouter = new Router({ prefix: '/contenttypesrelations' })
import { ContentTypesRelations } from './lib/general/ContentTypesRelations'
ContentTypesRelations(contentTypesRelationsRouter)
koaServer.use(contentTypesRelationsRouter.routes())

const contentsRelationsRouter = new Router({ prefix: '/contentsrelations' })
import { ContentsRelations } from './lib/general/ContentsRelations'
ContentsRelations(contentsRelationsRouter)
koaServer.use(contentsRelationsRouter.routes())

const productRelationsRouter = new Router({ prefix: '/productrelations' })
import { ProductRelations } from './lib/general/ProductRelations'
ProductRelations(productRelationsRouter)
koaServer.use(productRelationsRouter.routes())

const productImagesRouter = new Router({ prefix: '/productimages' })
import { ProductImages } from './lib/general/ProductImages'
ProductImages(productImagesRouter)
koaServer.use(productImagesRouter.routes())

const productViewsRouter = new Router({ prefix: '/productviews' })
import { ProductViews } from './lib/general/ProductViews'
ProductViews(productViewsRouter)
koaServer.use(productViewsRouter.routes())

const customerRouter = new Router({ prefix: '/customer' })
import { Customer } from './lib/general/customer'
Customer(customerRouter)
koaServer.use(customerRouter.routes())

const schedulesRouter = new Router({ prefix: '/schedules' })
import { Schedules } from './lib/general/Schedules'
Schedules(schedulesRouter)
koaServer.use(schedulesRouter.routes())

const contentsRouter = new Router({ prefix: '/contents' })
import { Contents } from './lib/general/Contents'
Contents(contentsRouter)
koaServer.use(contentsRouter.routes())

const promotionRouter = new Router({ prefix: '/promotion' })
import { Promotion } from './lib/general/Promotion'
Promotion(promotionRouter)
koaServer.use(promotionRouter.routes())

const salesRouter = new Router({ prefix: '/sales' })
import { Sales } from './lib/general/Sales'
Sales(salesRouter)
koaServer.use(salesRouter.routes())

const discountRouter = new Router({ prefix: '/discount' })
import { Discount } from './lib/general/Discount'
Discount(discountRouter)
koaServer.use(discountRouter.routes())

const shippingRouter = new Router({ prefix: '/shipping' })
import { Shipping } from './lib/general/Shipping'
Shipping(shippingRouter)
koaServer.use(shippingRouter.routes())

const addressRouter = new Router({ prefix: '/address' })
import { Address } from './lib/general/Address'
Address(addressRouter)
koaServer.use(addressRouter.routes())

const cardsRouter = new Router({ prefix: '/cards' })
import { Cards } from './lib/general/Cards'
Cards(cardsRouter)
koaServer.use(cardsRouter.routes())

const installmentsRouter = new Router({ prefix: '/installments' })
import { CompanyInstallments } from './lib/general/CompanyInstallments'
CompanyInstallments(installmentsRouter)
koaServer.use(installmentsRouter.routes())

const customProductsRouter = new Router({ prefix: '/customproducts' })
import { CustomProducts } from './lib/general/CustomProducts'
CustomProducts(customProductsRouter)
koaServer.use(customProductsRouter.routes())

const couponsRouter = new Router({ prefix: '/coupons' })
import { Coupons } from './lib/general/Coupons'
Coupons(couponsRouter)
koaServer.use(couponsRouter.routes())

const transactionsRouter = new Router({ prefix: '/transactions' })
import { Transactions } from './lib/general/Transactions'
import PixEvents from './lib/events/PixEvents';
Transactions(transactionsRouter)
koaServer.use(transactionsRouter.routes())

