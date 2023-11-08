import nodemailer from 'nodemailer';
import messageEmail from './messageEmail';

export default class NodemailerProvider {
  async sendEmail(
    token: string,
    userEmail: string,
    userName: string
  ): Promise<void> {
    const outlookTransporter = nodemailer.createTransport({
      host: process.env.HOST_SMTP,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MARTE_EMAIL,
        pass: process.env.MARTE_PASS
      }
    });
    await outlookTransporter.sendMail({
      from: `Marte 101 <${process.env.MARTE_EMAIL}>`,
      to: userEmail,
      subject: 'Redefinição de Senha',
      html: new messageEmail().htmlText(token, userName)
    });
  }
}
