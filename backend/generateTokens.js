const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const credentials = require('./credentials.json'); // Path to your credentials.json
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});
console.log('Authorize this app by visiting:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Save these tokens:', token);
    fs.writeFileSync('token.json', JSON.stringify(token));
    console.log('Tokens saved to token.json');
  });
});