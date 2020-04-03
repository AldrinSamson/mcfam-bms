const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const admin = require('firebase-admin')
const cors = require('cors')({origin: true});
admin.initializeApp(functions.config().firebase)

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mcfamrealty.is@gmail.com',
        pass: 'McfamRealty2020'
    }
});

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        if (!req.body.subject || !req.body.message) {
            return res.status(422).send({
              error: {
                code: 422,
                message: "Missing arguments"
              }
            });
        }

        const mailOptions = {
            from: 'MCFAM Realty  <mcfamrealty.is@gmail.com>',
            to: req.body.email,
            subject: req.body.subject,
            html: req.body.message
        };
  
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
                return res.send(String('Succesfully Sent to '+req.body.email));
        });
    });    
});

exports.terminateUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const uid = req.query.uid;

        return admin.auth().deleteUser(uid)
        .then(() => {
          return res.send('Successfully deleted user');
        })
        .catch((error) => {
          return res.send('Error deleting user:', error);
        });
    });    
});