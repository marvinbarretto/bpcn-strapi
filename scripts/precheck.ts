import fetch from 'node-fetch';
import { API_URL, ADMIN_TOKEN, HEADERS, REQUIRED_ROLES } from './lib/config';
import { Role } from './lib/types';

async function checkConnection() {
  console.log(`🔌 Checking Strapi connection at ${API_URL}`);
  try {
    const res = await fetch(`${API_URL}/_health`);
    if (!res.ok) throw new Error(`Unexpected status: ${res.status}`);
    console.log('✅ Strapi is reachable');
  } catch (err) {
    console.error('❌ Could not reach Strapi. Is it running?');
    process.exit(1);
  }
}

async function checkToken() {
  console.log('🔐 Verifying Admin token...');
  const res = await fetch(`${API_URL}/api/users-permissions/roles`, {
    headers: HEADERS,
  });

  if (res.status === 403) {
    console.error('❌ Token is invalid or lacks permission to access /roles.');
    console.warn('🔎 Please ensure your API token has correct permissions.');
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`❌ Failed to verify token. Status: ${res.status}`);
    process.exit(1);
  }

  const data = (await res.json()) as { roles?: Role[] };
  const roles = data.roles || [];

  const missing = REQUIRED_ROLES.filter((r) => !roles.some((role: Role) => role.name === r));

  if (missing.length > 0) {
    console.warn(`⚠️  Missing roles: ${missing.join(', ')}`);
  } else {
    console.log('✅ Required roles are present');
  }
}

(async function runPrecheck() {
  await checkConnection();
  await checkToken();
  console.log('\n🧪 Precheck complete\n');
})();