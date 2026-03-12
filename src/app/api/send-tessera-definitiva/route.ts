import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(req: Request) {
    try {
        const { email, tessera_numero, nome } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email non fornita' }, { status: 400 });
        }

        // Generiamo il QR Code della tessera definitiva (es. solo ID tessera)
        const qrCodeDataUri = await QRCode.toDataURL(tessera_numero, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#0f172a', // Azzurro scuro
                light: '#ffffff'
            }
        });

        const base64Data = qrCodeDataUri.replace(/^data:image\/png;base64,/, "");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Scuola di Danza" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Pagamento Ricevuto - Ecco la tua Tessera Definitiva',
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 0;">
                
                <!-- HEADER -->
                <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Scuola di Danza</h1>
                    <p style="color: #22c55e; font-size: 16px; margin-top: 8px; font-weight: bold;">Ricevuta di Pagamento & Tessera d'Ingresso</p>
                </div>

                <!-- BODY -->
                <div style="padding: 40px 30px; background-color: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #1e293b; font-size: 22px; margin-top: 0;">Ciao ${nome}!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Questa email conferma che <b>il tuo pagamento è andato a buon fine</b>. Ti ringraziamo!
                        Di seguito trovi la tua Tessera per entrare ai corsi della nostra scuola, comodamente dal tuo smartphone.
                    </p>

                    <!-- QR CODE CARD -->
                    <div style="background-color: #f8fafc; border: 2px solid #22c55e; border-radius: 16px; padding: 30px; text-align: center; margin: 35px 0;">
                        <h3 style="color: #166534; font-size: 18px; margin-top: 0;">Tessera Definitiva - Mostrala per Entrare</h3>
                        <img src="cid:qrcode" alt="QR Code Tessera" style="width: 200px; height: 200px; display: block; margin: 15px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px;" />
                        <div style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 2px;">
                            ${tessera_numero}
                        </div>
                        
                        <!-- WALLET BUTTONS -->
                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">Aggiungi la tessera al tuo wallet digitale (Disponibile a breve):</p>
                            <div style="text-align: center;">
                                <a href="#" style="display: inline-block; margin: 0 5px; text-decoration: none;">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/archive/c/cb/20230222091218%21Google_Wallet_Add_to_button.svg" alt="Add to Google Wallet" style="height: 44px; width: auto; border-radius: 6px;" />
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 5px; text-decoration: none;">
                                    <img src="https://developer.apple.com/wallet/images/localized/en_US/Add_to_Apple_Wallet_Badge.svg" alt="Add to Apple Wallet" style="height: 44px; width: auto; border-radius: 6px;" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f1f5f9; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                        Questa è un'email automatica. Ti preghiamo di non rispondere a questo indirizzo.<br/>
                        &copy; ${new Date().getFullYear()} Scuola di Danza. Tutti i diritti riservati.
                    </p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: 'Tessera_Definitiva.png',
                    content: base64Data,
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        };

        const result = await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, messageId: result.messageId });

    } catch (error: any) {
        console.error('API Send-Tessera Error:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
