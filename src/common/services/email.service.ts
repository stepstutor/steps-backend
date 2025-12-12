import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';

interface Attachment {
  /** Content of an attached file. */
  content?: string | Buffer;
  /** Name of attached file. */
  filename?: string | false | undefined;
  /** Path where the attachment file is hosted */
  path?: string;
  /** Optional content type for the attachment, if not set will be derived from the filename property */
  contentType?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  private async sendEmail(
    email: string,
    subject: string,
    content: string,
    attachments: Attachment[] = [],
  ): Promise<void> {
    await this.resendService.emails.send({
      from: 'Clinical Mind AI <no-reply@system.clinicalmindai.com>',
      to: email,
      subject: subject,
      html: content,
      attachments: attachments.length ? attachments : undefined,
    });
  }

  private async sendBulkEmail(
    emails: string[],
    subject: string,
    content: string,
  ): Promise<void> {
    while (emails.length > 0) {
      const batch = emails.splice(0, 90);
      await this.resendService.sendBatch(
        batch.map((email) => ({
          from: 'Clinical Mind AI <no-reply@system.clinicalmindai.com>',
          to: email,
          subject: subject,
          html: content,
        })),
      );
    }
  }

  async sendCourseAssignNotificationEmailToStudent(
    email: string,
    courseName: string,
    inviterName: string,
    courseLink: string,
    lang: string = 'en',
  ): Promise<void> {
    const content = `
      <html>
        <head>
          <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                text-align: left;
            }
            .logo {
                margin-bottom: 20px;
            }
            .logo img {
                width: 150px;
            }
            .content h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                color: #555555;
                margin: 10px 0;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff !important;
                text-decoration: none;
                padding: 8px 20px;
                font-size: 14px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }
            .footer a {
                color: #0073e6;
                text-decoration: none;
            }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo">
            <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo">
          </div>
          <div class="content">
            <h1>${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToStudent.subject', { args: { courseName }, lang })}</h1>
            <p>${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToStudent.body', { args: { inviterName }, lang })}</p>
            <a href="${courseLink}" class="button">${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToStudent.buttonText', { lang })}</a>
          </div>
        </div>
      </body>
    </html>`;
    await this.sendEmail(
      email,
      this.i18n.translate(
        'emailTemplates.sendCourseAssignNotificationEmailToStudent.subject',
        { args: { courseName }, lang },
      ),
      content,
    );
  }

  async sendCourseAssignNotificationEmailToInstructor(
    email: string,
    courseName: string,
    inviterName: string,
    courseLink: string,
    lang: string = 'en',
  ): Promise<void> {
    const content = `
      <html>
        <head>
          <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                text-align: left;
            }
            .logo {
                margin-bottom: 20px;
            }
            .logo img {
                width: 150px;
            }
            .content h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                color: #555555;
                margin: 10px 0;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff !important;
                text-decoration: none;
                padding: 8px 20px;
                font-size: 14px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }
            .footer a {
                color: #0073e6;
                text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo">
            </div>
            <div class="content">
              <h1>${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToInstructor.heading', { args: { courseName }, lang })}</h1>
              <p>${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToInstructor.body', { args: { inviterName }, lang })}</p>
              <a href="${courseLink}" class="button">${this.i18n.translate('emailTemplates.sendCourseAssignNotificationEmailToInstructor.buttonText', { lang })}</a>
            </div>
          </div>
        </body>
      </html>`;
    await this.sendEmail(
      email,
      this.i18n.translate(
        'emailTemplates.sendCourseAssignNotificationEmailToInstructor.subject',
        { args: { courseName }, lang },
      ),
      content,
    );
  }

  async sendInvitationEmail(
    name: string,
    email: string,
    invitationLink: string,
    lang: string = 'en',
  ): Promise<void> {
    const content = `
      <html>
        <head>
          <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                text-align: left;
            }
            .logo {
                margin-bottom: 20px;
            }
            .logo img {
                width: 150px;
            }
            .content h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                color: #555555;
                margin: 10px 0;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff !important;
                text-decoration: none;
                padding: 8px 20px;
                font-size: 14px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }
            .footer a {
                color: #0073e6;
                text-decoration: none;
            }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo">
            <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo"/>
          </div>
          <div class="content">
            <h1>${this.i18n.translate('emailTemplates.sendInvitationEmail.heading', { lang })}</h1>
            <p>${this.i18n.translate('emailTemplates.sendInvitationEmail.body', { lang })}</p>
            <a href="${invitationLink}" class="button">${this.i18n.translate('emailTemplates.sendInvitationEmail.buttonText', { lang })}</a>
          </div>
        </div>
      </body>
    </html>`;
    await this.sendEmail(
      email,
      this.i18n.translate('emailTemplates.sendInvitationEmail.subject', {
        lang,
      }),
      content,
    );
  }

  async sendWelcomeEmail(
    name: string,
    email: string,
    lang: string = 'en',
  ): Promise<void> {
    const content = `
      <html>
      <head>
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
          }
          .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              text-align: left;
          }
          .logo {
              margin-bottom: 20px;
          }
          .logo img {
              width: 150px;
          }
          .content h1 {
              font-size: 24px;
              color: #333333;
          }
          .content p {
              font-size: 16px;
              color: #555555;
              line-height: 1.5;
              margin: 10px 0;
          }
          .content a {
              color: #0073e6;
              text-decoration: none;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888888;
          }
          .footer a {
              color: #0073e6;
              text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo">
            <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo"/>
          </div>
          <div class="content">
            <h1>${this.i18n.translate('emailTemplates.sendWelcomeEmail.heading', { lang })}</h1>
            <p>${this.i18n.translate('emailTemplates.sendWelcomeEmail.body', { lang })}</p>
            <p>${this.i18n.translate('emailTemplates.sendWelcomeEmail.attachmentInfo', { lang })}</p>
          </div>
        </div>
      </body>
    </html>`;
    await this.sendEmail(
      email,
      this.i18n.translate('emailTemplates.sendWelcomeEmail.subject', { lang }),
      content,
      [
        {
          path: 'https://cmi-profile-pics.s3.amazonaws.com/32110782-2bd9-42ef-8ac7-6380cd420b11-Terms of Service Clinical Mind AI 2.25.25.pdf',
          filename: 'Terms of Service.pdf',
        },
      ],
    );
  }

  async sendAnnouncementEmail(
    emails: string[],
    announcementTitle: string,
    announcementBody: string,
    announcementLink: string,
    announcementLinkText: string,
  ): Promise<void> {
    const content = `
      <html>
        <head>
          <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                text-align: left;
            }
            .logo {
                margin-bottom: 20px;
            }
            .logo img {
                width: 150px;
            }
            .content h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                color: #555555;
                margin: 10px 0;
            }
            .link {
                font-size: 16px;
                color: #007bff;
                text-decoration: none;
                display: inline-block;
                margin-top: 10px;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">
              <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo">
            </div>
            <div class="content">
              <h1>${announcementTitle}</h1>
              <p>${announcementBody}</p>
              ${announcementLink ? `<a href="${announcementLink}" class="link">${announcementLinkText}</a>` : ''}
            </div>
            <div class="footer">
              <p>Best,</p>
              <p>Clinical Mind AI team.</p>
            </div>
          </div>
        </body>
      </html>`;

    await this.sendBulkEmail(emails, announcementTitle, content);
  }

  async sendQueryEmail(
    sentBy: string,
    message: string,
    attachments: Attachment[] = [],
  ): Promise<void> {
    const content = `
      <div>
        <h2>Received the following query from ${sentBy}</h2>
        <p>${message}</p>
      </div>`;
    await this.sendEmail(
      this.configService.getOrThrow('QUERY_EMAIL'),
      `Received a query from ${sentBy}`,
      content,
      attachments,
    );
  }

  async sendDataEmail(
    email: string,
    dataName: string,
    filtersDisplay: string,
    filePath: string,
    hasData: boolean,
    date: Date = new Date(),
    filename: string = 'data.csv',
    lang: string = 'en',
  ): Promise<void> {
    const fileContent = await fs.readFile(filePath);
    const attachment: Attachment = {
      filename,
      content: fileContent.toString('base64'),
      contentType: mime.lookup(filePath) || 'application/octet-stream',
    };
    const content = `
      <html>
      <head>
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
          }
          .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              text-align: left;
          }
          .logo {
              margin-bottom: 20px;
          }
          .logo img {
              width: 150px;
          }
          .content h1 {
              font-size: 24px;
              color: #333333;
          }
          .content p {
              font-size: 16px;
              color: #555555;
	            white-space: pre-line;
              line-height: 1.5;
              margin: 10px 0;
          }
          .content a {
              color: #0073e6;
              text-decoration: none;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888888;
          }
          .footer a {
              color: #0073e6;
              text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo">
            <img src="https://cmi-profile-pics.s3.amazonaws.com/07d95595-1bd1-4436-b942-09487ec2da3a-Property 1=horizontal.jpg" alt="Clinical Mind AI Logo"/>
          </div>
          <div class="content">
            <h1>${this.i18n.translate('emailTemplates.sendDataEmail.heading', {
              lang,
              args: {
                dataName,
                date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
              },
            })}</h1>
            <p>${this.i18n.translate('emailTemplates.sendDataEmail.body', {
              lang,
              args: {
                dataName,
                date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
              },
            })}</p>
            <p>
              ${filtersDisplay}
            </p>
            ${
              !hasData
                ? `<p>${this.i18n.translate('emailTemplates.sendDataEmail.noData', { lang })}</p>`
                : `<p style="margin-left: 12px; display: inline-block;">For more information visit <a href="https://clinicalmindai.stanford.edu/platform/institutional-data-exports" target="_blank" style="color: #0073e6; text-decoration: underline;">here</a>.</p>`
            }
          </div>
        </div>
      </body>
    </html>`;
    await this.sendEmail(
      email,
      this.i18n.translate('emailTemplates.sendDataEmail.subject', {
        lang,
        args: {
          dataName,
          date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
        },
      }),
      content,
      hasData ? [attachment] : [],
    );
  }
}
