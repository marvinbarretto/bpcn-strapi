// File: scripts/seed-events.ts
import fetch from 'node-fetch';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { API_URL, ADMIN_TOKEN, HEADERS, ErrorResponse } from './lib/config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

type EventStatus = 'Pending' | 'Approved' | 'Rejected' | 'Archived';

interface BlockNode {
  type: string;
  level?: number;
  children?: { type: 'text'; text: string }[];
}

interface EventCreatePayload {
  title: string;
  slug: string;
  date: string;
  location: string;
  eventStatus: EventStatus;
  content: BlockNode[];
  seo: Record<string, unknown>;
  featured: boolean;
}

const EVENT_STATUSES: EventStatus[] = ['Pending', 'Approved', 'Rejected', 'Archived'];

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
    {
      type: 'quote',
      children: [{ type: 'text', text: faker.lorem.sentence() }],
    },
    {
      type: 'paragraph',
      children: [{ type: 'text', text: faker.lorem.paragraph() }],
    },
  ];
}

function generateFakeSeo(): Record<string, unknown> {
  return {
    metaTitle: faker.company.catchPhrase(),
    metaDescription: faker.lorem.sentence(),
    sharedImage: null,
    keywords: faker.lorem.words(5),
    preventIndexing: faker.datatype.boolean(),
  };
}

async function createEvent(): Promise<void> {
  const title = faker.company.catchPhrase();
  const slug = faker.helpers.slugify(title).toLowerCase();
  const date = faker.date.soon({ days: 60 }).toISOString();

  const event: EventCreatePayload = {
    title,
    slug,
    date,
    location: `${faker.location.city()}, ${faker.location.country()}`,
    eventStatus: faker.helpers.arrayElement(EVENT_STATUSES),
    content: generateDummyBlockContent(),
    seo: generateFakeSeo(),
    featured: faker.datatype.boolean(),
  };

  const res = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ data: event }),
  });

  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(`❌ Failed: ${JSON.stringify(json, null, 2)}`);
  }

  console.log(`✅ Created event: ${event.title}`);
}

async function seedEvents(): Promise<void> {
  console.log('🌱 Seeding events...');
  const count = faker.number.int({ min: 10, max: 20 });

  for (let i = 0; i < count; i++) {
    await createEvent().catch((error) => {
      console.error(`❌ Failed to create event #${i + 1}`, error);
    });
  }

  console.log('🎉 Done seeding events.');
}

seedEvents();
