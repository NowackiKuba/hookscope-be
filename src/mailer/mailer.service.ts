import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';
import type { Config } from '../config/config.schema';
import type { Transporter } from 'nodemailer';

function resolveTemplatesDir(dirname: string): string {
  // Nest copies assets to dist/src/mailer/templates (outDir: dist/src)
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
  private transporter: Transporter | null = null;
  private readonly templatesDir: string;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<Config, true>) {
    this.templatesDir = resolveTemplatesDir(__dirname);
    this.from =
      this.configService.get('MAIL_FROM', { infer: true }) ??
      'noreply@lawpilot.com';
    this.initTransport();
  }

  private initTransport(): void {
    const host = this.configService.get('MAIL_HOST', { infer: true });
    const user = this.configService.get('MAIL_USER', { infer: true });
    const pass = this.configService.get('MAIL_PASSWORD', { infer: true });

    if (!host?.trim() || !user?.trim() || !pass?.trim()) {
      this.logger.warn(
        'Mailer: MAIL_HOST, MAIL_USER, or MAIL_PASSWORD not set – emails will not be sent',
      );
      return;
    }

    const port = this.configService.get('MAIL_PORT', { infer: true }) ?? 587;
    const secure = this.configService.get('MAIL_SECURE', { infer: true });

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure ?? false,
      auth: { user, pass },
    });
  }

  /** Returns true if SMTP is configured and mail can be sent */
  isConfigured(): boolean {
    return this.transporter !== null;
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
   * Send an email using an EJS template or raw HTML.
   * @throws when SMTP is not configured (so outbox marks as failed and can retry later)
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      const msg =
        'Mailer not configured (set MAIL_HOST, MAIL_USER, MAIL_PASSWORD) – email not sent';
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

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(err as Error).message}`,
      );
      throw err;
    }
  }
}
