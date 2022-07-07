import * as nodemailer from "nodemailer"
import * as pug from "pug"
import AWS from 'aws-sdk'
const path = require("path")

export const RenderEmail = (to,bcc="moovsn1@gmail.com", subject, htmlName, template, from) => {
    // if(process.env.ENV === 'production'){
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

        const file = path.resolve(process.cwd(), `views/mails/${htmlName}.pug`);
        const html = pug.renderFile(file, template);
        let attachments = []
        if(template.file) {
            let attachment = {
                filename: template.file.name,
                path: template.file.path,
                contentType: 'application/pdf'
            }
            attachments.push(attachment)
        }
        return transporter.sendMail({
            from: from || '"Coalah" <naoresponda@coalah.com.br>',
            to,bcc, subject, html, attachments
        });
    // }
}