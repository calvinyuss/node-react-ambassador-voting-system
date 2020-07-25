var API_KEY = process.env.MAILGUN_API;
var DOMAIN = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
const TokenTemplate = require('./templates/Token')
function option(emailOption,template) {
    return data = {
        from: 'EticUPHM <no.reply@mg.eticuphm.com>',
        to: emailOption.email,
        subject: emailOption.subject,
        html : template
    };
}

/**
 * @description Send Email
 * @param {JSON} data contain token and participant data
 * {
 * subject, 
 * participant : {email,name},
 * token
 * }
 * @param {Object} template email template
 */
exports.sendMail = (data,template) => {
    try {
        let emailOption = {
            email : data.participant.email,
            subject : data.subject
        }
        let template = TokenTemplate(data.token,data.participant.name)
        mailgun.messages().send(option(emailOption,template),(error,body)=>{
            if(error){
                throw error
            }
            console.log(body)
        })
    } catch (err) {
        throw err
    }
}