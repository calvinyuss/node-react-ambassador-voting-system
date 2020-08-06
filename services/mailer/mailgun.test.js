const {sendMail} = require('./mailgun')
sendMail('ca80007@student.uph.edu',{
    fullname : 'SAVANNAH EFENLIE',
    img : 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg'
},"https://google.com")