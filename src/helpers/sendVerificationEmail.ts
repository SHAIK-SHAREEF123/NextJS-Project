// /helpers/sendVerificationEmail.ts
import nodemailer from "nodemailer";

interface EmailResponse {
  success: boolean;
  message: string;
}

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<EmailResponse> => {
  try {
    // Configure your SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"True Feedback" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verification Code",
      html: `
        <h2>Hello ${username},</h2>
        <p>Thank you for registering. Please use the following verification code to verify your email:</p>
        <h3 style="color: blue;">${verifyCode}</h3>
        <p>This code will expire in 1 hour.</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // console.log("Verification email sent:", info.messageId);

    return { success: true, message: "Verification email sent" };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
};
