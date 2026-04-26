import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateTesseraPDF(nome: string, tessera_numero: string, qrCodeBase64: string, codice_fiscale: string) {
    const pdfDoc = await PDFDocument.create();
    // Orizzontale CR80 approssimato (540x340)
    const page = pdfDoc.addPage([540, 340]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Sfondo Blu Oceano (Theme Primary)
    page.drawRectangle({
        x: 0,
        y: 0,
        width: 540,
        height: 340,
        color: rgb(30/255, 100/255, 200/255), // Ocean Blue
    });

    // Banda Celeste in basso per dare stile
    page.drawRectangle({
        x: 0,
        y: 0,
        width: 540,
        height: 12,
        color: rgb(147/255, 197/255, 253/255), // Light Blue
    });

    // LOGO Testuale in alto a sinistra
    page.drawText('BIGDANCESCHOOL', {
        x: 30,
        y: 290,
        size: 24,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText('TESSERA D\'INGRESSO UFFICIALE', {
        x: 30,
        y: 270,
        size: 10,
        font: fontRegular,
        color: rgb(147/255, 197/255, 253/255), // Light Blue
    });

    // Dati Allievo (A Sinistra)
    page.drawText('ALLIEVO', {
        x: 30,
        y: 190,
        size: 10,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1), // Lightest Blue
    });

    let nomeStr = nome.toUpperCase();
    if (fontBold.widthOfTextAtSize(nomeStr, 22) > 260) {
        nomeStr = nomeStr.substring(0, 18) + '...';
    }
    page.drawText(nomeStr, {
        x: 30,
        y: 165,
        size: 22,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText('CODICE FISCALE', {
        x: 30,
        y: 120,
        size: 10,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1),
    });

    page.drawText(codice_fiscale.toUpperCase() || 'N/A', {
        x: 30,
        y: 100,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText('TESSERA N°', {
        x: 30,
        y: 60,
        size: 10,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1),
    });

    page.drawText(tessera_numero, {
        x: 30,
        y: 40,
        size: 16,
        font: fontBold,
        color: rgb(147/255, 197/255, 253/255), // Light Blue
    });

    // QR CODE (A Destra)
    const qrSize = 180;
    const rightMargin = 40;
    const qrX = 540 - qrSize - rightMargin;
    const qrY = (340 - qrSize) / 2; // Centrato verticalmente

    // Sfondo Bianco per QR Code
    page.drawRectangle({
        x: qrX - 10,
        y: qrY - 10,
        width: qrSize + 20,
        height: qrSize + 20,
        color: rgb(1, 1, 1),
    });

    const qrImage = await pdfDoc.embedPng(Buffer.from(qrCodeBase64, 'base64'));
    page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}

export async function POST(req: Request) {
    try {
        const { email, tessera_numero, nome, codice_fiscale } = await req.json();

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
        
        // Genera il PDF
        const pdfBase64 = await generateTesseraPDF(nome, tessera_numero, base64Data, codice_fiscale || 'N/A');

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
            from: `"BIGDANCESCHOOL" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Pagamento Ricevuto - Ecco la tua Tessera Definitiva',
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 0;">
                
                <!-- HEADER -->
                <div style="background-color: #1e64c8; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; border-bottom: 4px solid #93c5fd;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">BIGDANCESCHOOL</h1>
                    <p style="color: #bfdbfe; font-size: 16px; margin-top: 8px; font-weight: bold;">Ricevuta di Pagamento & Tessera d'Ingresso</p>
                </div>

                <!-- BODY -->
                <div style="padding: 40px 30px; background-color: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #1e293b; font-size: 22px; margin-top: 0;">Ciao ${nome}!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Questa email conferma che <b>il tuo pagamento è andato a buon fine</b>. Ti ringraziamo!
                        Di seguito trovi la tua Tessera per entrare ai corsi della nostra scuola, comodamente dal tuo smartphone.
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        In allegato a questa email troverai anche la tua <b>tessera in formato PDF</b>. Puoi salvarla o stamparla!
                    </p>

                    <!-- QR CODE CARD -->
                    <div style="background-color: #f8fafc; border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; text-align: center; margin: 35px 0;">
                        <h3 style="color: #1d4ed8; font-size: 18px; margin-top: 0;">Tessera Definitiva - Mostrala per Entrare</h3>
                        <img src="cid:qrcode" alt="QR Code Tessera" style="width: 200px; height: 200px; display: block; margin: 15px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px;" />
                        <div style="font-size: 24px; font-weight: 800; color: #1e3a8a; letter-spacing: 2px;">
                            ${tessera_numero}
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f1f5f9; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                        Questa è un'email automatica. Ti preghiamo di non rispondere a questo indirizzo.<br/>
                        &copy; ${new Date().getFullYear()} BIGDANCESCHOOL. Tutti i diritti riservati.
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
                },
                {
                    filename: `Tessera_${nome.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBase64,
                    encoding: 'base64',
                    contentType: 'application/pdf'
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
