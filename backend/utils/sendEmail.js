import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // TLS
  auth: {
    user: process.env.SMTP_USER,        // Brevo SMTP login
    pass: process.env.SMTP_PASS,        // Brevo SMTP key
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,       // StyleX <aimotionbox@gmail.com>
    to,
    subject,
    html,
  });
};

export default sendEmail;
