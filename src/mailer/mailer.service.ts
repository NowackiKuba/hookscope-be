import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import type { Config } from '../config/config.schema';

function resolveTemplatesDir(dirname: string): string {
  const candidates = [
    path.join(dirname, 'templates'),
    path.join(process.cwd(), 'dist', 'src', 'mailer', 'templates'),
    path.join(process.cwd(), 'dist', 'mailer', 'templates'),
  ];
  for (const dir of candidates) {
    const probe = path.join(dir, 'welcome.ejs');
    if (fs.existsSync(probe)) return dir;
  }
  return path.join(dirname, 'templates');
}

export interface MailTemplateContext {
  [key: string]: unknown;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context?: MailTemplateContext;
  /** Optional HTML body (used instead of template when set) */
  html?: string;
  /** Optional text body */
  text?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend | null = null;
  private readonly templatesDir: string;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<Config, true>) {
    this.templatesDir = resolveTemplatesDir(__dirname);
    this.from =
      this.configService.get('MAIL_FROM', { infer: true }) ??
      'noreply@hookscope.com';
    const apiKey = this.configService.get('RESEND_API_KEY', { infer: true });
    if (apiKey?.trim()) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'Mailer: RESEND_API_KEY not set – emails will not be sent',
      );
    }
  }

  /** Returns true if Resend is configured and mail can be sent */
  isConfigured(): boolean {
    return this.resend !== null;
  }

  /**
   * Render an EJS template with the given context.
   * Template path: mailer/templates/<name>.ejs
   */
  async renderTemplate(
    templateName: string,
    context: MailTemplateContext = {},
  ): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
    return ejs.renderFile(templatePath, context);
  }

  /**
   * Send an email using an EJS template or raw HTML via Resend.
   * @throws when Resend is not configured (so outbox marks as failed and can retry later)
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.resend) {
      const msg =
        'Mailer not configured (set RESEND_API_KEY) – email not sent';
      this.logger.warn(`${msg}: to=${options.to}, subject=${options.subject}`);
      throw new Error(msg);
    }

    let html = options.html;
    if (!html && options.template) {
      html = await this.renderTemplate(
        options.template,
        options.context ?? {},
      );
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: html ?? undefined,
      text: options.text,
    });

    if (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
      throw new Error(error.message);
    }
    this.logger.debug(`Email sent to ${options.to}: ${options.subject}`);
  }
}
