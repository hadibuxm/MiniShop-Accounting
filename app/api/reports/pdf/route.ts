import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getSessionUser } from '@/lib/session';
import { pdfExportSchema } from '@/lib/validation';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const PRINT_PATHS: Record<string, string> = {
  daily: '/reports/print/daily',
  monthly: '/reports/print/monthly',
  custom: '/reports/print/custom',
};

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pdfExportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { report_type, params } = parsed.data;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const query = new URLSearchParams(params).toString();
  const printUrl = `${request.nextUrl.origin}${PRINT_PATHS[report_type]}?${query}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setCookie({
      name: AUTH_COOKIE_NAME,
      value: token,
      url: request.nextUrl.origin,
    });
    await page.goto(printUrl, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${report_type}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
