import { createClient } from '@/src/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';

/**
 * Phase 4: Certificate PDF Route
 * Generates a certificate of completion for a mastered skill.
 * Verification Rule: SHA-256(user_id + skill_key + issued_at)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Authentication Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Load Certificate from Database
        const { data: certificate, error: certError } = await supabase
            .from('student_certificates')
            .select('*')
            .eq('id', id)
            .single();

        if (certError || !certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        // 3. Authorization: Only allow owner access or public certificates
        if (certificate.user_id !== user.id && !certificate.is_public) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 4. Fetch Student Profile for the certificate name
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', certificate.user_id)
            .single();

        // 5. Verification Hash Rule: SHA-256(user_id + skill_key + issued_at)
        // We use the ISO string of the timestamp for deterministic hashing
        const issuedAtISO = new Date(certificate.issued_at).toISOString();
        const hashSource = `${certificate.user_id}${certificate.skill_key}${issuedAtISO}`;
        const verificationHash = crypto.createHash('sha256').update(hashSource).digest('hex');

        // 6. Generate PDF via PDFKit
        // Note: Ensure pdfkit is installed: npm install pdfkit
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 0
        });

        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Styling: Yantra Branding
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0a');
            doc.fillColor('#ffffff').fontSize(60).text('YANTRA', 0, 100, { align: 'center' });
            doc.fontSize(20).text('CERTIFICATE OF MASTERY', 0, 180, { align: 'center' });

            doc.fontSize(16).text('This is awarded to', 0, 250, { align: 'center' });
            doc.fontSize(40).fillColor('#6366f1').text(profile?.full_name || 'Learner', 0, 280, { align: 'center' });

            doc.fontSize(16).fillColor('#ffffff').text(`for demonstrating excellence in`, 0, 350, { align: 'center' });
            doc.fontSize(24).text(certificate.skill_key.toUpperCase(), 0, 380, { align: 'center' });

            doc.fontSize(10).fillColor('#4b5563').text(`Issued: ${new Date(certificate.issued_at).toDateString()}`, 50, 500);
            doc.text(`Verify Authenticity: ${request.nextUrl.origin}/verify/${verificationHash}`, 50, 520);

            doc.end();
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="yantra-mastery-${certificate.skill_key}.pdf"`,
            },
        });
    } catch (error) {
        console.error('[CERTIFICATE_PDF_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}