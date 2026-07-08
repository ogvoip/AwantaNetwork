'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const selfsigned = require('selfsigned');

const app = express();
const HTTP_PORT = Number(process.env.PORT) || 4000;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 4443;
const FRONTEND_DIR = path.join(__dirname, '..');
const CERT_PATH = path.join(__dirname, 'cert.pem');
const KEY_PATH = path.join(__dirname, 'key.pem');

function createCertificate() {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const options = { days: 365, algorithm: 'sha256', extensions: [{ name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] }] };
    return selfsigned.generate(attrs, options);
}

function ensureCertificate() {
    if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
        return {
            cert: fs.readFileSync(CERT_PATH),
            key: fs.readFileSync(KEY_PATH)
        };
    }

    const pems = createCertificate();
    fs.writeFileSync(CERT_PATH, pems.cert, { encoding: 'utf8' });
    fs.writeFileSync(KEY_PATH, pems.private, { encoding: 'utf8' });
    return { cert: pems.cert, key: pems.private };
}

const credentials = ensureCertificate();
app.disable('x-powered-by');
app.enable('trust proxy');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('tiny'));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    next();
});
app.use(express.static(FRONTEND_DIR, { maxAge: '1d', etag: false, index: false }));

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime(), node: process.version, timestamp: Date.now() }));
app.get('/api/status', (req, res) => res.json({ service: 'Awanta Network', status: 'online', nodes: 43865, latency: '21ms', supports: ['https', 'tcp', 'udp', 'tls'] }));
app.get('/api/info', (req, res) => res.json({ name: 'Awanta Network', tier: 'enterprise', region: 'global', capacity: 'ultra', updated: new Date().toISOString() }));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'logo.png')));
app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    console.log(`Awanta Network secure backend live at https://localhost:${HTTPS_PORT}`);
});

http.createServer((req, res) => {
    const host = req.headers.host ? req.headers.host.replace(/:\d+$/, `:${HTTPS_PORT}`) : `localhost:${HTTPS_PORT}`;
    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
}).listen(HTTP_PORT, () => {
    console.log(`Redirecting HTTP traffic from http://localhost:${HTTP_PORT} to https://localhost:${HTTPS_PORT}`);
});
