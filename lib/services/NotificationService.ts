import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface TemplateData {
  username: string;
  verificationUrl: string;
  currentYear: string;
  supportUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export class NotificationService {
  private resendClient: Resend | null;
  private defaultFromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        'RESEND_API_KEY is not set. Email notifications will not be sent.',
      );
      this.resendClient = null;
    } else {
      this.resendClient = new Resend(apiKey);
    }
    this.defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'Roster Copilot <noreply@yourdomain.com>';
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.resendClient) {
      console.error(
        'Resend client is not initialized. Cannot send email. RESEND_API_KEY might be missing during service instantiation.',
      );
      return false;
    }

    const { to, subject, html, from = this.defaultFromEmail } = options;

    try {
      const { data, error } = await this.resendClient.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('[Resend API Error]', error);
        return false;
      }

      console.log('[Resend API Success] Email sent:', data);
      return true;
    } catch (e) {
      console.error('[NotificationService SendEmail Error]', e);
      return false;
    }
  }

  /**
   * Reads an email template from the file system
   * @param templatePath Path to the template file
   * @returns Promise<string> The template content
   */
  private async readTemplate(templatePath: string): Promise<string> {
    return fs.readFile(templatePath, 'utf-8');
  }

  /**
   * Processes template by replacing placeholders with actual data
   * @param template The template string with placeholders
   * @param data The data to replace placeholders with
   * @returns The processed template string
   */
  private processTemplate(template: string, data: TemplateData): string {
    let processedTemplate = template;

    processedTemplate = processedTemplate.replace(/{{username}}/g, data.username);
    processedTemplate = processedTemplate.replace(/{{verificationUrl}}/g, data.verificationUrl);
    processedTemplate = processedTemplate.replace(/{{currentYear}}/g, data.currentYear);
    processedTemplate = processedTemplate.replace(/{{supportUrl}}/g, data.supportUrl);
    processedTemplate = processedTemplate.replace(/{{privacyPolicyUrl}}/g, data.privacyPolicyUrl);
    processedTemplate = processedTemplate.replace(/{{termsOfServiceUrl}}/g, data.termsOfServiceUrl);

    return processedTemplate;
  }

  /**
   * Creates template data object for verification emails
   * @param username User's name
   * @param verificationToken Verification token
   * @returns TemplateData object
   */
  private createVerificationTemplateData(username: string, verificationToken: string): TemplateData {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const verificationUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;

    return {
      username,
      verificationUrl,
      currentYear: new Date().getFullYear().toString(),
      supportUrl: `${baseUrl}/support`,
      privacyPolicyUrl: `${baseUrl}/privacy`,
      termsOfServiceUrl: `${baseUrl}/terms`,
    };
  }

  public async sendVerificationEmail(
    userEmail: string,
    username: string,
    verificationToken: string,
  ): Promise<boolean> {
    const templatePath = path.resolve(process.cwd(), 'lib', 'email-templates', 'verification-email.html');
    const templateData = this.createVerificationTemplateData(username, verificationToken);

    try {
      const template = await this.readTemplate(templatePath);
      const emailHtml = this.processTemplate(template, templateData);

      return this.sendEmail({
        to: userEmail,
        subject: 'Verify Your Roster Copilot Account',
        html: emailHtml,
      });
    } catch (error) {
      console.error('[NotificationService] Error reading or processing email template:', error);
      const fallbackText = `Welcome to Roster Copilot! Please verify your email by clicking this link: ${templateData.verificationUrl} This link will expire in 24 hours.`;
      return this.sendEmail({
        to: userEmail,
        subject: 'Verify Your Roster Copilot Account',
        html: `<p>${fallbackText}</p>`,
      });
    }
  }
}

export const notificationService = new NotificationService();