import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(req: Request) {
    try {
        const { email, tessera_numero, nome, scanUrl, anagrafica, residenza, contatti, totale_prezzo } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email non fornita' }, { status: 400 });
        }

        // Generiamo il QR Code che punta ora all'URL dello Scanner Admin con l'ID integrato
        const qrCodeDataUri = await QRCode.toDataURL(scanUrl || tessera_numero, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        // Split data URI to get base64 actual file buffer for attachment
        const base64Data = qrCodeDataUri.replace(/^data:image\/png;base64,/, "");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Scuola di Danza" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Iscrizione Completata con Successo - La tua Tessera Digitale',
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 0;">
                
                <!-- HEADER -->
                <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Scuola di Danza</h1>
                    <p style="color: #94a3b8; font-size: 16px; margin-top: 8px;">Codice QR di Riconoscimento</p>
                </div>

                <!-- BODY -->
                <div style="padding: 40px 30px; background-color: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #1e293b; font-size: 22px; margin-top: 0;">Benvenuto/a ${nome}!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Siamo felicissimi di confermare la tua avvenuta registrazione dal totem. Di seguito trovi il riepilogo dei tuoi dati e il <b>QR Code provvisorio</b>. Ti servirà esibirlo in reception per poter <b>procedere al pagamento</b> e convalidare l'iscrizione.
                    </p>

                    <!-- QR CODE CARD -->
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 30px; text-align: center; margin: 35px 0;">
                        <img src="cid:qrcode" alt="QR Code Tessera" style="width: 200px; height: 200px; display: block; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px;" />
                        <div style="margin-top: 20px; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 2px;">
                            ${tessera_numero}
                        </div>
                        <p style="color: #64748b; font-size: 14px; margin-top: 8px; margin-bottom: 0;">
                            Conserva e mostra questo QR Code in reception per il pagamento.
                        </p>
                    </div>

                    <!-- DATI RIEPILOGATIVI -->
                    <h3 style="color: #334155; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Riepilogo Dati</h3>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; width: 40%;"><strong>Codice Fiscale:</strong></td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 500;">${anagrafica?.codiceFiscale || residenza?.codiceFiscale || 'N/A'}</td>
                        </tr>
                        <tr style="border-top: 1px solid #f1f5f9;">
                            <td style="padding: 10px 0; color: #64748b;"><strong>Indirizzo:</strong></td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 500;">${residenza?.indirizzo || 'N/A'}, ${residenza?.provincia || 'N/A'}</td>
                        </tr>
                        <tr style="border-top: 1px solid #f1f5f9;">
                            <td style="padding: 10px 0; color: #64748b;"><strong>Telefono:</strong></td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: 500;">${contatti?.telefono || 'N/A'}</td>
                        </tr>
                        <tr style="border-top: 1px solid #f1f5f9; background-color: #f0fdf4;">
                            <td style="padding: 12px 10px; color: #166534; border-radius: 8px 0 0 8px;"><strong>Importo Mensile Corsi:</strong></td>
                            <td style="padding: 12px 10px; color: #15803d; font-weight: 700; font-size: 18px; border-radius: 0 8px 8px 0;">€ ${totale_prezzo ? totale_prezzo.toFixed(2) : '0.00'}</td>
                        </tr>
                    </table>
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
                    filename: 'Tessera_QRCode.png',
                    content: base64Data,
                    encoding: 'base64',
                    cid: 'qrcode' // inline content id for img src
                }
            ]
        };

        const result = await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, messageId: result.messageId });

    } catch (error: any) {
        console.error('API Send-Email Error:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
