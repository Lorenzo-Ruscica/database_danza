import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { emails, subject, message } = await req.json();

        if (!emails || emails.length === 0) {
            return NextResponse.json({ error: 'Nessuna email fornita' }, { status: 400 });
        }
        if (!subject || !message) {
            return NextResponse.json({ error: 'Oggetto o messaggio mancanti' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Converte i ritorni a capo in <br> per l'HTML
        const formattedMessage = message.replace(/\n/g, '<br/>');

        const mailOptions = {
            from: `"BIGDANCESCHOOL" <${process.env.SMTP_USER}>`,
            bcc: emails, // Use BCC to hide recipients from each other
            subject: subject,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 0;">
                
                <!-- HEADER -->
                <div style="background-color: #1e64c8; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; border-bottom: 4px solid #93c5fd;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">BIGDANCESCHOOL</h1>
                    <p style="color: #bfdbfe; font-size: 14px; margin-top: 8px;">Comunicazione Ufficiale</p>
                </div>

                <!-- BODY -->
                <div style="padding: 40px 30px; background-color: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; color: #334155; font-size: 16px; line-height: 1.6;">
                    ${formattedMessage}
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f1f5f9; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                        Hai ricevuto questa email perché sei iscritto alla BIGDANCESCHOOL.<br/>
                        &copy; ${new Date().getFullYear()} BIGDANCESCHOOL. Tutti i diritti riservati.
                    </p>
                </div>
            </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, messageId: result.messageId });

    } catch (error: any) {
        console.error('API Send-Comunicazione Error:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
