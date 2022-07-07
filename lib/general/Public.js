import { Companies } from "../models/Companies";
import Router from "koa-router";

import { Users } from "./Users";
import { Products } from "./Products";
import { Categories } from "./Categories";
import { Stock } from "./Stock";
import { Payments } from "./Payments";
import { Rooms } from "./Rooms";
import { Services } from "./Services";
import { ServicesRooms } from "./ServicesRooms";
import { Availability } from "./Availability";
import { Customer } from "./customer";
import { Schedules } from "./Schedules";
import { Schedules_dates } from "./Schedules_dates";
import { Contents } from "./Contents";
import { Promotion } from "./Promotion";
import { Donations } from "./Donations";
import { Sales } from './Sales'
import { ContentOptions } from './ContentOptions'
import { ContentTypesRelations } from './ContentTypesRelations'
import { ContentsRelations } from './ContentsRelations'
import { ProductRelations } from './ProductRelations'
import { ProductImages } from './ProductImages'
import { ProductViews } from './ProductViews'
import { Shipping } from './Shipping'
import { Client } from './Client'
import { CompanyInstallments } from './CompanyInstallments'
import { CustomProducts } from './CustomProducts'
import { RenderEmail } from '../../utils/RenderEmail'
import { PopUps } from "./PopUps";
import { Coupons } from "./Coupons";
import { Transactions } from "./Transactions";
import { Hooks } from "./Hooks";
import { Searches } from "./Searches";

export const Public = (router) => {

  router.post("/test-email", async (ctx, next) => {
    try {
      const data = ctx.data
      RenderEmail(
        data.email, 
        data.subject,
        "changeStatus",
        {...data}
      )

      ctx.body = "email enviado"
      ctx.status = 200;
    } catch (err) {
      throw new Error(`Houve um problema ao enviar o seu email: ${err.message}`)
    }
  });

  router.use(async (ctx, next) => {
    if (
      ctx.request.header.authorization &&
      ctx.request.header.authorization.startsWith("Bearer")
    ) {
      let token = ctx.request.header.authorization.split("Bearer ").slice(-1)[0];
      if (!token) throw new Error("Informe o token para continuar");
      let companyInfo = await Companies.query().findOne("uuid", token);
      if (!companyInfo) throw new Error("Informe o token para continuar");

      ctx.companyInfo = companyInfo;
      await next();
    }else{
      throw new Error("Informe o token para continuar");
    }
  });

  const usersRouter = new Router({ prefix: "/users" });
  Users(usersRouter);
  router.use(usersRouter.routes());

  const productsRouter = new Router({ prefix: "/itens" });
  Products(productsRouter);
  router.use(productsRouter.routes());

  const categoriesRouter = new Router({ prefix: "/categories" });
  Categories(categoriesRouter);
  router.use(categoriesRouter.routes());

  const stockRouter = new Router({ prefix: "/stock" });
  Stock(stockRouter);
  router.use(stockRouter.routes());

  const paymentsRouter = new Router({ prefix: "/payments" });
  Payments(paymentsRouter);
  router.use(paymentsRouter.routes());

  const roomRouter = new Router({ prefix: "/rooms" });
  Rooms(roomRouter);
  router.use(roomRouter.routes());

  const serviceRouter = new Router({ prefix: "/services" });
  Services(serviceRouter);
  router.use(serviceRouter.routes());

  const contentOptionsRouter = new Router({ prefix: '/contentoptions' })
  ContentOptions(contentOptionsRouter)
  router.use(contentOptionsRouter.routes());

  const contentTypesRelationsRouter = new Router({ prefix: '/contenttypesrelations' })
  ContentTypesRelations(contentTypesRelationsRouter)
  router.use(contentTypesRelationsRouter.routes());

  const contentsRelationsRouter = new Router({ prefix: '/contentsrelations' })
  ContentsRelations(contentsRelationsRouter)
  router.use(contentsRelationsRouter.routes());
  
  const productRelationsRouter = new Router({ prefix: '/productrelations' })
  ProductRelations(productRelationsRouter)
  router.use(productRelationsRouter.routes());
  
  const productImagesRouter = new Router({ prefix: '/productimages' })
  ProductImages(productImagesRouter)
  router.use(productImagesRouter.routes());
  
  const productViewsRouter = new Router({ prefix: '/productviews' })
  ProductViews(productViewsRouter)
  router.use(productViewsRouter.routes());

  const serviceRoomRouter = new Router({ prefix: "/servicesrooms" });
  ServicesRooms(serviceRoomRouter);
  router.use(serviceRoomRouter.routes());

  const availabilityRouter = new Router({ prefix: "/availability" });
  Availability(availabilityRouter);
  router.use(availabilityRouter.routes());

  const customerRouter = new Router({ prefix: "/customer" });
  Customer(customerRouter);
  router.use(customerRouter.routes());

  const schedulesRouter = new Router({ prefix: "/schedules" });
  Schedules(schedulesRouter);
  router.use(schedulesRouter.routes());

  const schedules_datesRouter = new Router({ prefix: "/schedules_dates" });
  Schedules_dates(schedules_datesRouter);
  router.use(schedules_datesRouter.routes());

  const contentsRouter = new Router({ prefix: "/contents" });
  Contents(contentsRouter);
  router.use(contentsRouter.routes());
  
  const promotionRouter = new Router({ prefix: "/promotion" });
  Promotion(promotionRouter);
  router.use(promotionRouter.routes());

  const donationsRouter = new Router({ prefix: "/donations" });
  Donations(donationsRouter);
  router.use(donationsRouter.routes());

  const saleRouter = new Router({ prefix: '/sale' })
  Sales(saleRouter)
  router.use(saleRouter.routes())

  const shippingRouter = new Router({ prefix: '/shipping' })
  Shipping(shippingRouter)
  router.use(shippingRouter.routes())

  const clientRouter = new Router({ prefix: "/client" });
  Client(clientRouter);
  router.use(clientRouter.routes());
  
  const installmentsRouter = new Router({ prefix: "/installments" });
  CompanyInstallments(installmentsRouter);
  router.use(installmentsRouter.routes());

  const customProductsRouter = new Router({ prefix: "/customproducts" });
  CustomProducts(customProductsRouter);
  router.use(customProductsRouter.routes());

  const popupRouter = new Router({ prefix: '/popups' })
  PopUps(popupRouter)
  router.use(popupRouter.routes())

  const couponsRouter = new Router({ prefix: '/coupons' })
  Coupons(couponsRouter)
  router.use(couponsRouter.routes())
  
  const transactionsRouter = new Router({ prefix: '/transactions' })
  Transactions(transactionsRouter)
  router.use(transactionsRouter.routes())
  
  const hooksRouter = new Router({ prefix: '/hooks' })
  Hooks(hooksRouter)
  router.use(hooksRouter.routes())
  
  const searchesRouter = new Router({ prefix: '/searches' })
  Searches(searchesRouter)
  router.use(searchesRouter.routes())
};
