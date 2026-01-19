import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { formMappings, type MatterWithRelations } from './mappings';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
Handlebars.registerHelper('gt', (a: any, b: any) => a > b);
Handlebars.registerHelper('lt', (a: any, b: any) => a < b);
Handlebars.registerHelper('formatCurrency', (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
});

export async function generateForm(formType: string, matterData: MatterWithRelations): Promise<Buffer> {
  try {
    // 1. Load template
    const templatePath = path.join(process.cwd(), 'templates', `${formType}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // 2. Map data
    const mapper = formMappings[formType as keyof typeof formMappings];
    if (!mapper) {
      throw new Error(`No mapping found for form ${formType}`);
    }
    const formData = mapper(matterData);

    // 3. Render HTML
    const html = template(formData);

    // 4. Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.75in',
        bottom: '0.5in',
        left: '0.75in',
      },
    });

    await browser.close();

    return Buffer.from(pdf);
  } catch (error) {
    console.error(`Error generating ${formType}:`, error);
    throw error;
  }
}

export async function generateAllForms(matterData: MatterWithRelations, requiredForms: string[]): Promise<Record<string, Buffer>> {
  const results: Record<string, Buffer> = {};

  for (const formType of requiredForms) {
    console.log(`Generating ${formType}...`);
    const pdf = await generateForm(formType, matterData);
    results[formType] = pdf;
  }

  return results;
}
