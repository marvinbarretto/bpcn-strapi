// File: scripts/seed-pages.ts
import fetch from 'node-fetch';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { API_URL, ADMIN_TOKEN, HEADERS, ErrorResponse } from './lib/config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface BlockNode {
  type: string;
  level?: number;
  children?: { type: 'text'; text: string }[];
}

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  sharedImage: null;
  keywords: string;
  preventIndexing: boolean;
}

interface PageCreatePayload {
  title: string;
  slug: string;
  content: BlockNode[];
  description?: string;
  parentPage?: number | null;
  primaryNavigation?: boolean;
  seo: SeoData[];
  hero?: number | null;
}

function generateDummyBlockContent(): BlockNode[] {
  return [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: faker.lorem.sentence() }],
    },
    {
      type: 'paragraph',
      children: [{ type: 'text', text: faker.lorem.paragraphs(2) }],
    },
  ];
}

function generateFakeSeo(): SeoData[] {
  return [
    {
      metaTitle: faker.company.catchPhrase(),
      metaDescription: faker.lorem.sentence(),
      sharedImage: null,
      keywords: faker.lorem.words(5),
      preventIndexing: faker.datatype.boolean(),
    },
  ];
}

async function createPage(): Promise<void> {
  const title = faker.company.catchPhrase();
  const slug = faker.helpers.slugify(title).toLowerCase();

  const page: PageCreatePayload = {
    title,
    slug,
    content: generateDummyBlockContent(),
    description: faker.lorem.sentence(),
    parentPage: null,
    primaryNavigation: faker.datatype.boolean(),
    seo: generateFakeSeo(),
    hero: null,
  };

  const res = await fetch(`${API_URL}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ data: page }),
  });

  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(`❌ Failed: ${JSON.stringify(json, null, 2)}`);
  }

  console.log(`✅ Created page: ${page.title}`);
}

async function seedPages(): Promise<void> {
  console.log('🌱 Seeding pages...');
  const count = faker.number.int({ min: 5, max: 10 });

  for (let i = 0; i < count; i++) {
    await createPage().catch((error) => {
      console.error(`❌ Failed to create page #${i + 1}`, error);
    });
  }

  console.log('🎉 Done seeding pages.');
}

seedPages();