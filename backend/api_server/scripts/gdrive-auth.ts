import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import url from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('\n1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Authorize the app, then you will be redirected.\n');

const { port } = new URL(REDIRECT_URI);
const pathname = new URL(REDIRECT_URI).pathname;

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || '', true);
  if (parsed.pathname !== pathname) return;

  const code = parsed.query.code as string;
  if (!code) {
    res.end('No code received.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.end('Done! You can close this tab. Check your terminal for the refresh token.');
    console.log('\n--- Add this to your .env ---\n');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('');
  } catch (err) {
    res.end('Error exchanging code.');
    console.error(err);
  }

  server.close();
});

server.listen(Number(port), () => {
  console.log(`Waiting for redirect on port ${port}...`);
});
