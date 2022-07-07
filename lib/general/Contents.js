import AWS from "aws-sdk";
import moment from "moment";
import { transaction } from "objection";
import ContentsService from "../../services/ContentsService";
import { Attributes } from "../models/Attributes";
import { ContentAttributes } from "../models/ContentAttributes";
import { Contents as ContentsModel } from "../models/Contents";
import { ContentsTypes } from "../models/ContentsTypes";


export const Contents = (router) => {
	//cria o conteudo
	router.post('/content', async (ctx, next) => {
		const trx = await transaction.start(ContentsModel.knex())
		try{
			let {content_type_id, attributes = []} = {...ctx.data}
			if(!content_type_id) throw new Error("Para fazer um post precisa do content_type_id")

			await ContentsModel.query().insertWithRelatedAndFetch({
				contents_types_id: content_type_id,
				attributes: attributes.map(att => ({
					value_attribute: att.value,
					content_attributes_id: att.caId,
				}))
			})
			await trx.commit()
			ctx.status = 201
		}catch(err){
			await trx.rollback()
			throw err
		}
	})

	//pega informações do conteúdo
	router.get('/:contentId/info', async (ctx, next) => {
		const content = await ContentsModel.query().findById(ctx.params.contentId)
		.withGraphFetched("[attributes.contentAttribute, contents_relations.to.attributes.contentAttribute]")
		.where("active", true)

		if(!content) throw new Error("Não foi encontrado nenhum conteúdo com esse id")
		ctx.body = (content)
	})

	//edita o conteúdo 
	router.patch("/edit-post/:postId", async (ctx, next) => {
		let params = {...ctx.data}
		let contents = await ContentsModel.query().findById(ctx.params.postId).withGraphFetched("attributes")
		let contentAttribute = await ContentsModel.query().withGraphFetched("content_type.content_attribute")
		.findById(ctx.params.postId)

		let contentsAttributes = contentAttribute.content_type.content_attribute
		let contentInfo = contents.attributes 
		let editForm = params.attributes

		var contentEdited 
		 let temp = []

		for (let e in editForm) {
			let itemContent = contentInfo.find(item => item.content_attributes_id === editForm[e].caId)

			if(itemContent) {
				let itemEdited = await Attributes.query().patchAndFetchById(itemContent.id ,{
					value_attribute: editForm[e].value
				})
				temp.push(itemEdited)
			} else {
				let newItem = contentsAttributes.find(item => item.id === editForm[e].caId)
				
				let itemInserted = await Attributes.query().insertAndFetch({
					value_attribute: editForm[e].value,
					contents_id: ctx.params.postId,    
					content_attributes_id: editForm[e].caId
				})
				temp.push(itemInserted)
			}
			contentEdited = temp
		}

		ctx.body = contentEdited
	});

	//muda status para inativo
	router.patch("/inactivate-post/:postId", async (ctx, next) => {
		let params = {...ctx.data}
		console.log("entrou na funcao")
		await ContentsService.inactiveContents(ctx.params.postId)    
		ctx.status = 200;
	});

	//retorna todos os ContentsTypes da empresa
	router.get('/all-types', async (ctx, next) => {
		let params = {...ctx.data}
		let content = await ContentsTypes.query()
		.where("contents_types.company_id", ctx.companyProfile.company_id)
		.withGraphFetched("content_types_relations.to")
		.where("visible", true)
		.where("menu", true)
		
		ctx.body = content
	})

	//pega a informação do ContentsTypes pelo uuid
	router.get("/contents-types/:uuid", async (ctx, next) => {
	  let params = { ...ctx.data };
  
	  ctx.body = await ContentsTypes.query().findOne(
		"contents_types.uuid",
		ctx.params.uuid
	  );
	});

	router.get('/contents-types/:uuid/contents', async (ctx, next) => {
		let {uuid} = {...ctx.params}
		const contentType = await ContentsTypes.query()
			.withGraphFetched("contents.attributes.contentAttribute")
			.modifyGraph("contents", build => build.where("contents.active", true))
			.findOne("contents_types.uuid", uuid)
		if(!contentType) throw new Error("Conteúdo não encontrado");
		if(contentType.company_id !== (ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)) throw new Error("Conteúdo não encontrado");

		ctx.body = (contentType.contents || []).map(c => {
			let params = {}
			c.attributes.forEach(att => {
				params[att.contentAttribute.uuid] = att.value_attribute
			})
			return {
				...params,
				...c
			}
		}).sort(function(a, b) {return b.created_at - a.created_at})
	})

	/**
    * @description pega a informação do ContentAttributes pelo uuid 
    * 
    **/
	router.get('/contents-attributes-by/:uuid', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};

		try {
			if(!params.uuid) throw new Error("É preciso do uuid para a resposta do contentsAttributes")
			const res = await ContentsService.getContentsAttributes(ctx.params.uuid)
	
			ctx.body = res
		} catch(err) {
			throw err
		}
	})

	router.post('/file/:directory?', async (ctx, next) => {
		try {
            var s3 = new AWS.S3()
            s3.config.update({
                accessKeyId: process.env.AWS_S3_KEY_ID,
                secretAccessKey: process.env.AWS_S3_SECRET_KEY,
				region:"sa-east-1",
				
            })
			var bucket = process.env.AWS_S3_BUCKET
			console.log(ctx.request.files)
			const {directory = "admin-default"} = ctx.params;
			const file = ctx.request.files[0];
			var filename = file.originalname;
			var extension = file.mimetype.split("/")[1];
			var prepareFilename = Buffer.from(filename + moment().format("YYYY-MM-DD HH:mm:ss"));
			var newFilename = `${directory}/${prepareFilename.toString("base64") + "." + extension}`;
			await new Promise((resolve, reject) => {
				var s3Key = newFilename;
				var params = {
					Bucket: bucket,
					Key: s3Key,
					Body: file.buffer,
					ContentType: file.mimetype,
					ACL: "public-read"
				};
		
				s3.putObject(params,  function(err, data) {
					if (err) reject(err);
					else resolve(true);
				});
			});
			ctx.status = 201
			ctx.body = { file: `https://s3-sa-east-1.amazonaws.com/${bucket}/${newFilename}`}
		} catch (error) {
			console.log({error});
			ctx.body = { error: error.message }
        }
    })

	// busca por conteudo
	router.get("/find", async (ctx, next) => {
	  const params = { ...ctx.data, ...ctx.params };
	  const companyId = ctx.headers.companyprofileid || ctx.companyInfo.id;

	  var uuids = (params.uuid && params.uuid!=='')?params.uuid.replace(/[\[\]]/g,'').split(','):[]

	  try {
		var res = ContentsTypes.query()
		  .withGraphFetched("contents.attributes.contentAttribute")
		  .where({ visible: true, company_id: companyId })
		  .modifyGraph("contents", (builder) => {
			builder.where({ active: true });
		  })
		  .modifyGraph("contents.attributes", (builder) => {
			builder
			  .where("value_attribute", "like", `%${params.find || ''}%`)
			  .where({ visible: true });
		  });

		if (uuids.length > 0) {
		  res = res.whereIn("uuid", uuids);
		}
		const temp = await res;
		const a = temp.reduce((old, contentType) => {
		  var contents = (contentType.contents || []).map((c) => {
			let params = {};
			c.attributes.forEach((att) => {
			  params[att.contentAttribute.uuid] = att.value_attribute;
			});
			return {
			  ...params,
			  ...c,
			};
		  });
		  return [...old, ...contents];
		}, []);
		ctx.body = a;
		
	  } catch (error) {
		console.log(error.message);
		ctx.body = "fail";
	  }
	});

	/**
    * @description manda o email do formulário 
    * 
    **/
	router.post('/submit-form', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
		const trx = await transaction.start(ContentsModel.knex());

		try{
			if(!params.content_type_id) throw new Error("É preciso do content_type_id para mandar o email")
			if(!params.form) throw new Error("É preciso do form para mandar o email")
			if(params.form.length == 0) throw new Error("É preciso preencher os dados para mandar o email")

			const res = await ContentsService.submitEmail(
                params.content_type_id,    
                params.form, 
            )

			await trx.commit();
			ctx.status = 201
			ctx.body = res
		}catch(err){
			await trx.rollback();
			throw err
		}
	})
};
