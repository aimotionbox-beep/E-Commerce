import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM, // StyleX <onboarding@resend.dev>
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT VIA RESEND");
  } catch (error) {
    console.error(
      "RESEND EMAIL ERROR:",
      error?.message || error
    );
  }
};

export default sendEmail;
