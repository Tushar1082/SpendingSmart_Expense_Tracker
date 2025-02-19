const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const { userColl } = require("../Database/mongodb_db");

function otpGenerate() {
    let number = Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number
    return number;
}
const sendMailGet= async (req,res)=>{
    try {
        const emailId = req.query.emailId;
        const result = await userColl.findOne({email:emailId},{projection:{email:1, name:1, profile_image:1}});

        if(result){
            return res.json(result);
        }else{
            return res.json({notFound:true});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
};
const sendMailPost = async(req,res)=>{
    const {name,email} = req.body; 
    const otp = otpGenerate();
    
    const htmlMail = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Add your CSS styles here */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            .otp {
                margin: 0px;
                padding-right: 10px;
                font-weight: bold;
                color: #333;
            }
            a {
                text-decoration: none;
                color: #007bff;
            }
            .otpDiv{
                text-align:center
            }
            .otpCode{
                letter-spacing: 10px;
            }
        </style>
    </head>
    <body>
        <div id="main">
    
        <div class="container">
            <h1>Password Reset</h1>
            <p>Dear ${name},</p>
            <p>We have received a request to reset your password for your account. To complete the password reset process, please use the following One-Time Password (OTP):</p>
            <div class="otpDiv">
                <h1 class="otp">OTP:</h1>
                <h1 class="otpCode">
                    ${otp}
                </h1>
            </div>
            <p>Please note that this OTP is valid for a limited time, so make sure to use it promptly.</p>
            <p>To reset your password, follow these steps:</p>
            <ol>
                <li>Visit the Spending Smart login page by clicking on the following link: <a href="${process.env.CLIENT_URL}/login">click to login page</a></li>
                <li>Click on the "Forgot Password" or "Reset Password" link.</li>
                <li>You will be prompted to enter your email address associated with your Spending Smart account.</li>
                <li>After entering your email address, click the "Submit" button.</li>
                <li>Check your email inbox for a password reset email from us. If you don't see it in your inbox, please check your spam or junk folder.</li>
                <li>Open the email and enter the OTP code you received in this email.</li>
                <li>Follow the on-screen instructions to create a new password. Please ensure your new password is strong and unique.</li>
            </ol>
            <p>If you did not request to reset your password or believe this email was sent in error, please ignore it. Your current password will remain unchanged.</p>
            <p>For security reasons, this OTP will expire in [Insert Time Limit, e.g., 10 minutes]. If you don't use the OTP within this time, you'll need to request another OTP.</p>
            <p>Thank you for visiting Spending Smart.</p>
            <p>Sincerely,<br>The Spending Smart Team</p>
            <p><a href=${process.env.CLIENT_URL}>${process.env.CLIENT_URL}</a><br>spendingSmart@gmail.com</p>
        </div>
    </div>
    
    </body>
    </html>
    `
    try{
        const transporter = nodemailer.createTransport({
            //here smtp servive is gmailS
            service:"gmail",
            auth:{
                user:"tusharsharma1082@gmail.com",
                pass:"xnyc lmhn drpz losa"
            }
        }) 

        const info = {
            from:"tusharsharma1082@gmail.com",
            to:email,
            subject:"Your One-Time Password (OTP) to Reset Your Password",
            html:htmlMail
        }
         transporter.sendMail(info,(err,result)=>{
            if(result){
                res.json({otp})
            }else{
                res.json({message:"email is not send"})
            }
        })
    }catch(e){
        res.json({message:"Error"});
    }
}

const sendMailPut= async(req,res)=>{
    const {pass,email} = req.body;
    try {
        const salt = await bcryptjs.genSalt(5);
        const hashPass = await bcryptjs.hash(pass,salt);

        const result = await userColl.updateOne({email:email},{
            $set:{
                password:hashPass
            }
        });

        if(result.modifiedCount>0){
            return res.json({updated:true});
        }else{
            return res.json({updated:true});
        }
        // res.json({user:user});
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
        // res.json({error:error})
    }
}
module.exports = {sendMailGet,sendMailPost,sendMailPut};