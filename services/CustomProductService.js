import { CustomProducts as CustomProductsModel } from '../lib/models/CustomProducts';
import { CustomCategories as CustomCategoriesModel } from '../lib/models/CustomCategories';
import { CustomAttributes as CustomAttributesModel } from '../lib/models/CustomAttributes';
import { transaction } from 'objection';
import { CustomAttributesProducts } from '../lib/models/CustomAttributesProducts';
import moment from 'moment';

export default class CustomProductService{
    /**
    *
    * @description Função que cria no banco um produto customizado com todos os seus atributos relacionados
    *
    * @param {Array} listCombinations
    * @param {Integer} product_id
    * @param {Integer} companyprofiles
    *
    * @returns {Array} [res]
    *
    */
    static createCustomProduct = async (listCombinations, product_id, companyprofiles) => {
        let customProducts = []

        await Promise.all(
            listCombinations.map(async(itemMap, index) => {
                const itemProduct = await CustomProductsModel.query().insertWithRelatedAndFetch({
                    company_id: companyprofiles,
                    product_id: product_id,

                    price: itemMap.price?itemMap.price:1,
                    image: itemMap.image?itemMap.image:'',
                    nVlPeso: itemMap.nVlPeso?`${itemMap.nVlPeso}kg`:'1kg',
                    custom_attributes_products: itemMap && itemMap.attributes.map(att => ({
                        custom_attribute_id: att,
                    }))
                })
                customProducts.push(itemProduct)
            })
        )

        return customProducts
    }

    /**
    *
    * @description Função que retornar os atributos ativos da companhia
    *
    * @param {Integer} companyprofiles Passar apenas o companyprofiles
    *
    * @returns {Array} [res]
    *
    */
    static attributesAndTheirCategories = async (companyprofiles) => {
        let company = parseInt(companyprofiles)

        const res = await CustomCategoriesModel.query().withGraphFetched("custom_attributes")
        .where("active", true)
        .where("company_id", company).orWhere("company_id", null)
        .modifyGraph("custom_attributes", (builder) => {
			builder.where({ active: true });
		})

        return res
    }

    /**
    *
    * @description Função que retornar apenas os atributos e seus titulos da customização
    *
    * @param {integer} product_id Passar apenas o product_id
    *
    * @returns {Array} [customAttributes]
    *
    */
    static infoProduct = async (product_id) => {
        const res = await CustomProductsModel.query()
        .withGraphFetched("custom_attributes_products.custom_attributes")
        .where("product_id", product_id)
        .where('active',true);

        let customAttributes = res.reduce((old, curr) => {
            let att = curr.custom_attributes_products.reduce((o, c) => {
                o.push(c.custom_attributes.id)

                return o
            }, [])

            let title = curr.custom_attributes_products.reduce((o, c) => {
                o.push(c.custom_attributes.title)

                return o
            }, [])

            delete curr.custom_attributes_products

            old.push({
                ...curr,
                nVlPeso: curr.nVlPeso.slice(0, curr.nVlPeso.length - 2),
                title: title,
                attributes: att,
                simpleTitle: title.map(i => i).join(" - "),
            })

            return old 
        }, [])

        return customAttributes
    }

    /**
    *
    * @description Função que edita no banco o produto customizado
    *
    * @param {Array} listCombinations {"id": 30, "attributes": [1], "price": 10, "image": "", "nVlPeso": "10kg"}
    * @param {Integer} product_id
    * @param {Integer} companyprofiles
    *
    * @returns {Array} [res]
    *
    */
     static editCustomProduct = async (listCombinations, product_id, companyprofiles) => {
        let customProducts = []

        await Promise.all(
            listCombinations.map(async(itemMap, index) => {
                var existItem = itemMap.id ? await CustomProductsModel.query().findById(itemMap.id) : null

                //caso exista, edite, caso não, crie
                if(existItem) {
                    const editedItem = await CustomProductsModel.query().updateAndFetchById(itemMap.id, {
                        company_id: companyprofiles,
                        product_id: product_id,
    
                        price: itemMap.price?itemMap.price:1,
                        image: itemMap.image?itemMap.image:'',
                        nVlPeso: itemMap.nVlPeso?`${itemMap.nVlPeso}kg`:'1kg',
                    })
                    customProducts.push(editedItem)
                } else {
                    const itemProduct = await CustomProductsModel.query().insertWithRelatedAndFetch({
                        company_id: companyprofiles,
                        product_id: product_id,
    
                        price: itemMap.price?itemMap.price:1,
                        image: itemMap.image?itemMap.image:'',
                        nVlPeso: itemMap.nVlPeso?`${itemMap.nVlPeso}kg`:'1kg',
                        custom_attributes_products: itemMap && itemMap.attributes.map(att => ({
                            custom_attribute_id: att,
                        }))
                    })
                    customProducts.push(itemProduct)
                }
            })
        )

        return customProducts
    }

    /**
    *
    * @description Função que cria uma categoria customizada
    *
    * @param {Integer} companyprofiles
    * @param {String} name
    *
    * @returns {Object} customCategory
    *
    */
     static createCustomCategory = async (companyprofiles, name) => {
        const existItem = await CustomCategoriesModel.query().findOne({
            company_id: companyprofiles,
            active: true,
            name: name
        })

        if(existItem) throw new Error("Erro essa categoria já existe");

        const customCategory = await CustomCategoriesModel.query().insertGraphAndFetch({
            company_id: companyprofiles,
            name: name
        })

        return customCategory
    }

    /**
    *
    * @description Função que cria um atributo customizada
    *
    * @param {Integer} custom_category_id
    * @param {String} title
    *
    * @returns {Object} customAttribute
    *
    */
     static createCustomAttribute = async (custom_category_id, title) => {
        const existItem = await CustomAttributesModel.query().findOne({
            custom_category_id: custom_category_id,
            active: true,
            title: title
        })

        if(existItem) throw new Error("Erro esse atributo já existe");

        const customAttribute = await CustomAttributesModel.query().insertGraphAndFetch({
            custom_category_id: custom_category_id,
            title: title
        })

        return customAttribute
    }
    /**
    *
    * @description Função que remove uma customização
    *
    * @param {Integer} custom_product_id
    *
    * @returns {Object} customAttribute
    *
    */
     static deleteCustomization = async (custom_product_id) => {
        const trx = await transaction.start(CustomProductsModel.knex())
        try{
            const removedCustomization = await CustomProductsModel.query(trx)
            .updateAndFetchById(custom_product_id,{active:false, updated_at:moment().format()})

            await trx.commit()
            return ({...removedCustomization})
        }catch(err){
            await trx.rollback()
            throw new Error(err)
        }
        
    }
}


