"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getSmtpConfig = () => {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM?.trim() || user;
    const port = Number(process.env.SMTP_PORT ?? 587);
    if (!host || !user || !pass || !from) {
        return undefined;
    }
    return {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        from,
    };
};
exports.mailService = {
    async sendPasswordResetCode(email, code) {
        const config = getSmtpConfig();
        if (!config) {
            throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
        }
        const transporter = nodemailer_1.default.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
        });
        await transporter.sendMail({
            from: config.from,
            to: email,
            subject: 'CarHub password reset code',
            text: `Your CarHub password reset code is ${code}. This code expires in 10 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>CarHub password reset</h2>
          <p>Your password reset code is:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px">${code}</p>
          <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
        });
    },
};
//# sourceMappingURL=mail.service.js.map