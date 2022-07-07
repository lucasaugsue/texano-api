import AWS from "aws-sdk";
import moment from "moment";
import { transaction } from "objection";
import { ContentsTypes } from "../lib/models/ContentsTypes";
import { Attributes } from "../lib/models/Attributes";
import { Contents } from "../lib/models/Contents";
import { ContentAttributes } from "../lib/models/ContentAttributes";
import * as nodemailer from "nodemailer"
const path = require("path")


export default class ContentsService {
	/**
	*
	* @description Inativar conteúdo
	*
	* @param {Integer} id
	*
	*/
	static async inactiveContents(id) {
		await Contents.query().patchAndFetchById(id, {
		  active: false
		})
	}

	/**
	*
	* @description Função que envia o email do formulário preenchido
	*
	* @param {Array} form
	* @param {Integer} content_type_id
	*
	* @returns {Array} [res]
	*
	*/
	static async submitEmail(content_type_id, form) {
		AWS.config.update({ 
			// accessKeyId: process.env.SES_ACCESS_KEY,
			// secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
			accessKeyId: process.env.AWS_SES_KEY_ID,
			secretAccessKey: process.env.AWS_SES_SECRET_KEY,

			region: 'us-east-1' 
		})
		
		var transporter = nodemailer.createTransport({
			SES: new AWS.SES({ apiVersion: '2010-12-01' })
		})
		
		const contentType = await ContentsTypes.query().findById(content_type_id)
		.withGraphFetched("content_attribute")
		
		let newParams = form.reduce((old, curr) => {
			let findItem = contentType.content_attribute.find(i => i.uuid === curr.uuid)
			old.push({...curr, caId: findItem.id})
			return old
		}, [])

		const content = await Contents.query().insertWithRelatedAndFetch({
			contents_types_id: content_type_id,
			attributes: newParams.map(att => ({
				value_attribute: att.value,
				content_attributes_id: att.caId,
			}))
		})

		let data = newParams.reduce((old, curr) => {
			old.push(`${curr.uuid}:${curr.value}`)
			return old
		}, []).toString()

		transporter.sendMail({
			from: '"Fridom" <naoresponda@fridom.com.br>',
			to: contentType.email || "lucasaugsue7@gmail.com", 
			subject: contentType.title || "Sem título", 
			text: data
		});

		return content
	}

	/**
	*
	* @description Função que retorna os contents types
	*
	* @param {String} uuid
	*
	* @returns {Array} organizeList
	*
	*/
	static async getContentsAttributes(uuid) {
		const priority = [
			{type: "string", lvl: 1},
			{type: "date", lvl: 2},
			{type: "textfield", lvl: 3},
			{type: "select", lvl: 4},
			{type: "text", lvl: 5},
			{type: "image", lvl: 6},
			{type: "pdf", lvl: 7},
			{type: "html", lvl: 8},
		];

		const contentsAttributes = await ContentAttributes.query()
			.withGraphFetched('contentType')
			.join("contents_types", "content_attributes.contents_types_id", "contents_types.id")
			.where("contents_types.uuid", uuid)

		var organizeList = contentsAttributes.reduce((old, curr) => {
			let itemPriority = priority.find(i => i.type === curr.type)
			old.push({
				...curr,
				lvl: itemPriority.lvl,
			})
			return old
		}, []).sort(function(a, b) {return a.lvl - b.lvl})

		return organizeList
	}

}