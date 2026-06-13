import nodemailer from 'nodemailer';
import * as crypto from "crypto";

export const transMail = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const emailCodes: Map<string, string> = new Map<string, string>();
export const emailCodeTimers: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();

export async function sendCodeMail(email: string, code: string) {
    try {
        await transMail.sendMail({
                from: "psych-online@qq.com",
                to: email,
                subject: code + ' 是您的验证码',
                html: '<h3>您的验证码是:<h3><h1>' + code + '</h1>',
            }
            // ,    (error, info) => {
            //         if (res)
            //             if (error)
            //                 res.sendStatus(500);
            //             else
            //                 res.sendStatus(200);
            //     }
        );
    }
    catch (exc) {
        console.error(exc);
    }
}

export async function sendBundleCodeMail(email: string, code: string) {
    try {
        await transMail.sendMail({
                from: "psych-online@qq.com",
                to: email,
                subject: code + ' 是您的验证码',
                html: '<h3>您的绑定验证码是:<h3><h1>' + code + '</h1>' + '<h3>请在联机群中使用 /bdc ' + code + ' 命令完成绑定</h3>',
            }
            // ,    (error, info) => {
            //         if (res)
            //             if (error)
            //                 res.sendStatus(500);
            //             else
            //                 res.sendStatus(200);
            //     }
        );
    }
    catch (exc) {
        console.error(exc);
    }
}

export function tempSetCode(email: string, code: string) {
    if (emailCodeTimers.has(email)) {
        clearInterval(emailCodeTimers.get(email));
    }

    emailCodes.set(email, code);

    emailCodeTimers.set(email, setInterval(() => {
        emailCodes.delete(email);
    }, 1000 * 60 * 10));
}

export function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}