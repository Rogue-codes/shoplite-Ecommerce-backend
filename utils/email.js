import nodemailer from 'nodemailer'

export const sendEmail = async options => {
    // create transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    })

    // define email options
    const mailOptions = {
        from:"Nnamdi Osuji <nnamdidanielosuji@gmail.com>",
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    // send the email
    await transporter.sendMail(mailOptions)
}