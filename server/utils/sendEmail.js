import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"John Deere Expense Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", to);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return {
      success: false,
      message: "Email sending failed",
      error: error.message,
    };
  }
};
