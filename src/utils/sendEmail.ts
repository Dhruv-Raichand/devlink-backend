import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({
  to,
  subject,
  html,
}: EmailOptions): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'noreply@linkdev.online',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }
};

export default sendEmail;
