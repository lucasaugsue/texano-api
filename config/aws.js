module.exports = { 
    s3: {
        accessKeyId: process.env.AWS_S3_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        region: "sa-east-1"
    },
    ses: {
        credentials: {
            accessKeyId: process.env.AWS_SES_KEY_ID,
            secretAccessKey: process.env.AWS_SES_SECRET_KEY
        },
        region: "us-east-1",
        apiVersion: '2010-12-01',
        sender: 'naoresponda@coalah.com.br'
    }
}