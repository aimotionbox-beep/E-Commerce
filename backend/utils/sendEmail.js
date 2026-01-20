import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async (to, subject, html) => {
  try {
    await apiInstance.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: {
        name: "StyleX",
        email: "aimotionbox@gmail.com", // must be verified in Brevo
      },
      to: [{ email: to }],
    });

    console.log("EMAIL SENT VIA BREVO API");
  } catch (error) {
    console.error("BREVO API ERROR:", error.message);
  }
};

export default sendEmail;
