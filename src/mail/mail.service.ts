import { Injectable } from '@nestjs/common';
// import { MailerService } from './mailer';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFile } from 'fs/promises';
import HandleBars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST') as string,
      port: this.config.get('MAIL_PORT') as number,
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER') as string,
        pass: this.config.get('MAIL_PASS') as string,
      },
    });
  }

  async sendVerificationEmail(data: {
    emailAddress: string;
    name: string;
    verificationOtp: string;
  }) {
    // todo: add frontend url

    const name = data.name;
    const verificationOtp = data.verificationOtp;

    await this.sendMail({
      sender: this.config.get('MAIL_FROM') as string,
      recipients: [data.emailAddress],
      templateFile: 'verification.hbs',
      subject: 'Verify your email address',
      data: { verificationOtp, name },
    });
  }

  async sendResetPasswordEmail(data: {
    emailAddress: string;
    name: string;
    resetOtp: string;
  }) {
    const name = data.name;
    const resetOtp = data.resetOtp;

    await this.sendMail({
      sender: this.config.get('MAIL_FROM') as string,
      recipients: [data.emailAddress],
      templateFile: 'forgot-password.hbs',
      subject: 'Reset your password',
      data: { resetOtp, name },
    });
  }

  async sendMail<T = any>(info: {
    sender: string;
    recipients: string[];
    subject: string;
    templateFile: string;
    data?: T;
  }) {
    try {
      const templatePath = join(__dirname, 'templates', info.templateFile);
      const astr = await readFile(templatePath, 'utf8');

      const msg = HandleBars.compile(astr)(info.data);

      //read file

      //   const emailContent = await ejs.renderFile(templatePath, info.data);

      const message = {
        from: info.sender,
        to: info.recipients,
        subject: info.subject,
        html: msg,
      };

      const shouldSend = this.config.get('SEND_EMAIL') === 'true';

      if (shouldSend) {
        await this.transporter.sendMail(message);
      }
    } catch (e) {
      console.log(e);
      throw new Error('Error sending email');
    }
  }
}
