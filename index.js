require('dotenv').config();
const express = require("express");
const cors = require('cors');
const nodemailer = require("nodemailer");
const {google} = require("googleapis");


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const PORT = process.env.PORT;

const OAUTH_SENDER_EMAIL = process.env.OAUTH_CLIENT_EMAIL;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

const app = express();

//Enable CORS
var corsOptions = {
    origin: process.env.CORS_ORIGIN
}
app.use(cors(corsOptions));

app.use(express.json());

const OAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
OAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});


app.get("/sendmail", (req, res) => {
    res.send("hello");
})

//Main Server Endpoint
app.post("/sendmail", async (req, res) => {
    if(!req.body.email || !req.body.message){
        res.status(400).json({success: false, msg: "Email or message is not present"});
    }else if(!validateEmailID(req.body.email)){
        res.status(400).json({success: false, msg: "Please Check your Email again."});
    }else{
        const result = await sendTheMail(req.body.email, req.body.message);
        if((result.accepted && result.accepted.length<1) || !result.accepted){
            res.status(200).json({success: false, msg: "Sorry, Something Wrong Happned"});
        }else{
            res.status(200).json({success: true, msg: "Thaanks for messaging, I will get back to you very soon."});
        }
    }
})


async function sendTheMail(email, message){
    try{
        const accessToken = await OAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: OAUTH_SENDER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: `${email} <rahulnaskar19985@gmail.com>`,
            to: RECEIVER_EMAIL,
            subject: "MESSAGE FROM PORTFOLIO WEBSITE",
            html: makeTempla(email, message)
        }

        const result = await transport.sendMail(mailOptions);
        return result;


    }catch(error){
        return error;
    }
}


app.listen(PORT, () => {
    console.log("Server is Up and running at port: " + PORT);
})

function validateEmailID(email){
    const REG_EXP = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(REG_EXP.test(email)){
        return true;
    }
    return false;
}

function makeTempla(email, message){
    const template = `
        <h2>${email}</h2>

        <h3>${message}</h3>
    `;
    return template;
}