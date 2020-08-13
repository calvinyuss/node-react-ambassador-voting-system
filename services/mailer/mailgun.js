var API_KEY = process.env.MAILGUN_API;
var DOMAIN = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
const {TokenTemplate} = require('./templates/Token')

const emailInfo = {
    subject : 'Ambassador Voting',
    sender : 'EticUPHM <no.reply@mg.eticuphm.com>'
}

function option(emailOption,template) {
    return data = {
        from: emailInfo.sender,
        to: emailOption.email,
        subject: emailOption.subject,
        html : template
    };
}

/**
 * @description Send Email
 * @param {String} reciever the target email
 * @param {JSON} candidate 
 * candidate : {
 * fullname, 
 * image
 * }
 * @param {String} Token Token
 */
exports.sendMail = (reciever,candidate,voteTokenId) => {
    try {
        let emailOption = {
            email : reciever,
            subject : emailInfo.subject
        }
        let template = TokenTemplate(voteTokenId,candidate.fullname,candidate.img)
        mailgun.messages().send(option(emailOption,template),(error,body)=>{
            if(error){
                throw error
            }
            console.log(body)
        })
    } catch (err) {
        console.log(err)
        throw err
    }
}