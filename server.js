/**
 * MULTI-DEVICE REAL-TIME QUEUE SERVER
 * Zero-dependency Node.js HTTP Server dengan Server-Sent Events (SSE)
 * Memungkinkan sinkronisasi instan antar-PC, Tablet Kios, dan Layar TV
 * di jaringan lokal (Wi-Fi / LAN).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads');
const STATE_FILE = path.join(DATA_DIR, 'queue-state.json');

// Pastikan direktori data dan uploads ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Konfigurasi Default State: Creative and Marketing PU
const DEFAULT_STATE = {
  theme: 'creative',
  brandName: 'Creative and Marketing PU',
  brandTagline: 'Creative Hub & Production Service Center',
  runningText: 'Selamat datang di Creative and Marketing PU. Silakan ambil tiket nomor antrian untuk layanan Desain, Printing, Proposal, dan Edit Geotag. Tim kami siap memberikan hasil terbaik untuk Anda!',
  categories: [
    { id: 'cat-desain', prefix: 'A', name: 'Desain', desc: 'Desain grafis, visual branding, materi promosi, & konten media sosial', avgTime: 15, icon: 'palette' },
    { id: 'cat-printing', prefix: 'B', name: 'Printing', desc: 'Cetak digital, merchandise, banner, poster, & material promosi fisik', avgTime: 10, icon: 'printer' },
    { id: 'cat-proposal', prefix: 'C', name: 'Proposal', desc: 'Penyusunan & asistensi proposal program, sponsorship, & kerjasama', avgTime: 20, icon: 'file-text' },
    { id: 'cat-geotag', prefix: 'D', name: 'Edit Geotag', desc: 'Edit koordinat & geotagging foto dokumentasi (Rp 5.000/pcs - Bayar Cash)', avgTime: 10, icon: 'map-pin', price: 5000, paymentMethod: 'Cash' }
  ],
  counters: [
    { id: 'cnt-1', name: 'Meja 1', categoryIds: ['cat-desain', 'cat-geotag'], status: 'idle', activeTicket: null, operatorName: 'Fadel' },
    { id: 'cnt-2', name: 'Meja 2', categoryIds: ['cat-proposal', 'cat-geotag'], status: 'idle', activeTicket: null, operatorName: 'Aji' },
    { id: 'cnt-3', name: 'Meja 3', categoryIds: ['cat-desain', 'cat-printing', 'cat-geotag'], status: 'idle', activeTicket: null, operatorName: 'Diky' },
    { id: 'cnt-4', name: 'Meja 4', categoryIds: ['cat-desain', 'cat-geotag'], status: 'idle', activeTicket: null, operatorName: 'Youri' },
    { id: 'cnt-5', name: 'Meja 5', categoryIds: ['cat-proposal'], status: 'idle', activeTicket: null, operatorName: 'Adit' },
    { id: 'cnt-6', name: 'Meja 6', categoryIds: ['cat-desain'], status: 'idle', activeTicket: null, operatorName: 'Dian' }
  ],
  queue: [],
  history: [],
  currentCall: null,
  messages: [],
  lastUpdated: Date.now()
};

// In-Memory Master State
let masterState = loadState();

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.categories && parsed.counters) {
        parsed.messages = parsed.messages || [];
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal memuat queue-state.json, menggunakan state default:', e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  masterState.lastUpdated = Date.now();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(masterState, null, 2), 'utf8');
  } catch (e) {
    console.error('Gagal menulis queue-state.json:', e);
  }
}

// SSE (Server-Sent Events) Clients Pool
const sseClients = new Set();

function broadcastSSE(eventData) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  });
}

// Deteksi IP Address LAN/Wi-Fi dengan Caching Ringan
let cachedIps = null;
let lastIpCheck = 0;
const IP_CACHE_TTL = 15000; // Cache selama 15 detik

function getLocalIpAddresses(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedIps && (now - lastIpCheck < IP_CACHE_TTL)) {
    return cachedIps;
  }

  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push({ interface: k, ip: address.address });
      }
    }
  }

  // Prioritaskan adapter fisik LAN / Wi-Fi dibanding adapter virtual VPN (WARP/WSL)
  addresses.sort((a, b) => {
    const isVirtualA = /warp|wsl|vEthernet|virtual|tunnel/i.test(a.interface);
    const isVirtualB = /warp|wsl|vEthernet|virtual|tunnel/i.test(b.interface);
    if (isVirtualA && !isVirtualB) return 1;
    if (!isVirtualA && isVirtualB) return -1;
    return 0;
  });

  cachedIps = addresses;
  lastIpCheck = now;
  return addresses;
}

// Keamanan & Akses Terbatas Operator (Hanya 1 PC Induk yang memiliki Akses Penuh secara otomatis)
const OPERATOR_PIN = '1234';

function isLocalRequest(req) {
  const remoteIp = req.socket.remoteAddress || '';
  if (remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1') {
    return true;
  }
  const localIps = getLocalIpAddresses().map(item => item.ip);
  const cleanIp = remoteIp.replace(/^.*:/, '');
  return localIps.includes(cleanIp) || localIps.includes(remoteIp);
}

// MIME Types untuk Static Files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Operator-Pin, X-Filename');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- API: UPLOAD FILE CETAK DOKUMEN KE PC UTAMA ---
  if (pathname === '/api/upload' && req.method === 'POST') {
    const rawFilename = req.headers['x-filename'] || 'document';
    let originalName = 'document';
    try {
      originalName = decodeURIComponent(rawFilename);
    } catch (e) {
      originalName = rawFilename;
    }

    // Amankan nama file untuk penyimpanan lokal di PC utama
    const ext = path.extname(originalName).toLowerCase();
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 50) || 'dokumen';
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const savedName = `${timestamp}_${randomSuffix}_${safeBase}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, savedName);

    const fileStream = fs.createWriteStream(targetPath);
    let fileSize = 0;

    req.on('data', chunk => {
      fileSize += chunk.length;
    });

    req.pipe(fileStream);

    fileStream.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        file: {
          originalName,
          savedName,
          size: fileSize,
          url: `/uploads/${savedName}`,
          uploadedAt: timestamp
        }
      }));
    });

    fileStream.on('error', (err) => {
      console.error('Gagal menulis file upload ke disk:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Gagal menyimpan file ke PC Utama: ' + err.message }));
    });

    return;
  }

  // --- API: INFO IP JARINGAN & LINK KHUSUS ---
  if (pathname === '/api/info') {
    const ips = getLocalIpAddresses();
    const primaryIp = ips[0] ? ips[0].ip : 'localhost';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      port: PORT,
      ipAddresses: ips,
      primaryIp,
      operatorPin: OPERATOR_PIN,
      links: {
        tv: `http://${primaryIp}:${PORT}/?mode=tv`,
        kiosk: `http://${primaryIp}:${PORT}/?mode=kiosk`,
        host: `http://localhost:${PORT}`
      }
    }));
  }

  // --- API: ROLE & PERMISSION CLIENT (HOST vs REMOTE CLIENT) ---
  if (pathname === '/api/client-role' && req.method === 'GET') {
    const isHost = isLocalRequest(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      isHost,
      clientIp: req.socket.remoteAddress,
      operatorPinRequired: !isHost,
      allowedViews: isHost ? ['view-display', 'view-kiosk', 'view-operator'] : ['view-display', 'view-kiosk']
    }));
  }

  // --- API: VERIFIKASI PIN OPERATOR ---
  if (pathname === '/api/verify-pin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { pin } = JSON.parse(body);
        if (pin === OPERATOR_PIN) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: true, message: 'PIN terverifikasi' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: false, error: 'PIN Operator salah' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Format JSON salah' }));
      }
    });
    return;
  }

  // --- API: AMBIL STATE TERBARU ---
  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(masterState));
  }

  // --- API: SERVER-SENT EVENTS (SSE) STREAM ---
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', state: masterState })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // --- API: EKSEKUSI AKSI ANTRIAN DARI CLIENT ---
  if (pathname === '/api/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { action, payload } = JSON.parse(body);

        // Keamanan: Aksi operator dibatasi untuk non-host tanpa PIN
        const OPERATOR_ACTIONS = ['CALL_NEXT', 'RECALL', 'COMPLETE_TICKET', 'SKIP_TICKET', 'RESET_ALL'];
        if (OPERATOR_ACTIONS.includes(action) && !isLocalRequest(req)) {
          const clientPin = req.headers['x-operator-pin'];
          if (clientPin !== OPERATOR_PIN) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              error: 'Akses ditolak: Aksi operator memerlukan otentikasi PIN dari PC remote'
            }));
          }
        }

        let result = handleQueueAction(action, payload);
        saveState();

        // Siarkan update state ke seluruh PC / browser lain
        broadcastSSE({
          type: 'STATE_UPDATE',
          state: masterState,
          action,
          payload
        });

        if (action === 'CALL_NEXT' || action === 'RECALL') {
          broadcastSSE({
            type: 'TRIGGER_AUDIO_CALL',
            payload: masterState.currentCall
          });
        }

        if (action === 'SEND_CHAT_MESSAGE') {
          broadcastSSE({
            type: 'NEW_CHAT_MESSAGE',
            message: result,
            messages: masterState.messages
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, result, state: masterState }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let reqPath = '/index.html';
  try {
    reqPath = decodeURI(pathname);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('400 Bad Request');
  }

  const filePath = path.join(BASE_DIR, reqPath);
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    };

    if (reqPath.startsWith('/uploads/')) {
      responseHeaders['Content-Disposition'] = 'inline';
    }

    res.writeHead(200, responseHeaders);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// LOGIKA AKSI ANTRIAN PUSAT DI SERVER
function handleQueueAction(action, payload) {
  switch (action) {
    case 'CREATE_TICKET': {
      const category = masterState.categories.find(c => c.id === payload.categoryId);
      if (!category) throw new Error('Kategori tidak ditemukan');

      const existingSameCat = [
        ...masterState.queue.filter(t => t.categoryId === payload.categoryId),
        ...masterState.history.filter(t => t.categoryId === payload.categoryId)
      ];

      let maxNum = 0;
      existingSameCat.forEach(t => {
        if (t.num && t.num > maxNum) maxNum = t.num;
      });

      const nextNum = maxNum + 1;
      const formattedNumber = `${category.prefix}-${String(nextNum).padStart(3, '0')}`;

      const waitingInFront = masterState.queue.filter(
        t => t.categoryId === payload.categoryId && t.status === 'waiting'
      ).length;

      let customerName = (payload.customerName && payload.customerName.trim()) || 'Pengunjung';
      let preferredOperatorId = (payload.preferredOperatorId && payload.preferredOperatorId !== 'any') ? payload.preferredOperatorId : null;
      let preferredOperatorName = 'Bebas (Siapa Saja)';

      // Khusus layanan Printing: Hanya bisa dilakukan oleh operator Diky (Meja 3)
      if (payload.categoryId === 'cat-printing') {
        const dikyCounter = masterState.counters.find(c => c.operatorName === 'Diky') || masterState.counters.find(c => c.id === 'cnt-3');
        if (dikyCounter) {
          preferredOperatorId = dikyCounter.id;
          preferredOperatorName = `${dikyCounter.operatorName} (${dikyCounter.name})`;
        }
        if (!payload.customerName || !payload.customerName.trim()) {
          customerName = 'Pengunjung Printing';
        }
      } else if (preferredOperatorId) {
        const foundCounter = masterState.counters.find(c => c.id === preferredOperatorId);
        if (foundCounter && foundCounter.categoryIds.includes(payload.categoryId)) {
          preferredOperatorName = foundCounter.operatorName;
        } else {
          preferredOperatorId = null;
          preferredOperatorName = 'Bebas (Siapa Saja)';
        }
      }

      // Khusus layanan Edit Geotag: Berbayar Rp 5.000 / pcs, Cash
      let pcsCount = null;
      let totalPrice = null;
      let paymentMethod = null;
      if (payload.categoryId === 'cat-geotag') {
        pcsCount = Math.max(1, parseInt(payload.pcsCount, 10) || 1);
        totalPrice = pcsCount * 5000;
        paymentMethod = 'Cash';
      }

      const ticket = {
        id: 'tkt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        prefix: category.prefix,
        num: nextNum,
        formattedNumber,
        categoryId: category.id,
        categoryName: category.name,
        customerName,
        preferredOperatorId,
        preferredOperatorName,
        pcsCount,
        totalPrice,
        paymentMethod,
        fileAttachment: payload.fileAttachment || null,
        createdAt: Date.now(),
        status: 'waiting',
        calledAt: null,
        completedAt: null,
        counterId: null,
        counterName: null,
        waitingInFront
      };

      masterState.queue.push(ticket);
      return ticket;
    }

    case 'SEND_CHAT_MESSAGE': {
      const text = (payload.text || '').trim();
      if (!text) throw new Error('Pesan tidak boleh kosong');

      if (!masterState.messages) masterState.messages = [];
      const message = {
        id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        senderName: (payload.senderName || 'Pengunjung').trim(),
        senderRole: payload.senderRole || 'visitor', // 'visitor' | 'operator'
        targetDesk: payload.targetDesk || 'all', // 'all' | 'cnt-1' | etc.
        targetDeskName: payload.targetDeskName || 'Semua Meja',
        text,
        timestamp: Date.now(),
        read: false
      };

      masterState.messages.push(message);
      // Batasi maksimum 150 pesan terakhir
      if (masterState.messages.length > 150) {
        masterState.messages = masterState.messages.slice(-150);
      }
      return message;
    }

    case 'MARK_CHAT_READ': {
      if (!masterState.messages) masterState.messages = [];
      const deskId = payload.deskId;
      masterState.messages.forEach(m => {
        if (!deskId || m.targetDesk === 'all' || m.targetDesk === deskId) {
          m.read = true;
        }
      });
      return true;
    }

    case 'CALL_NEXT': {
      const counter = masterState.counters.find(c => c.id === payload.counterId);
      if (!counter) throw new Error('Meja/Loket tidak ditemukan');

      // Selesaikan tiket aktif sebelumnya jika ada
      if (counter.activeTicket) {
        const prev = counter.activeTicket;
        prev.status = 'completed';
        prev.completedAt = Date.now();
        masterState.queue = masterState.queue.filter(t => t.id !== prev.id);
        masterState.history.unshift(prev);
        counter.activeTicket = null;
      }

      // Prioritas 1: Antrian yang secara spesifik meminta operator meja ini
      let eligibleTicket = masterState.queue.find(
        t => t.status === 'waiting' &&
             counter.categoryIds.includes(t.categoryId) &&
             t.preferredOperatorId === counter.id
      );

      // Prioritas 2: Antrian umum (Bebas / siapa saja)
      if (!eligibleTicket) {
        eligibleTicket = masterState.queue.find(
          t => t.status === 'waiting' &&
               counter.categoryIds.includes(t.categoryId) &&
               (!t.preferredOperatorId || t.preferredOperatorId === 'any')
        );
      }

      // Prioritas 3: Antrian apa saja yang menunggu di kategori ini jika tidak ada yang lain
      if (!eligibleTicket) {
        eligibleTicket = masterState.queue.find(
          t => t.status === 'waiting' && counter.categoryIds.includes(t.categoryId)
        );
      }

      if (!eligibleTicket) {
        counter.status = 'idle';
        counter.activeTicket = null;
        return null;
      }

      eligibleTicket.status = 'called';
      eligibleTicket.calledAt = Date.now();
      eligibleTicket.counterId = counter.id;
      eligibleTicket.counterName = counter.name;

      counter.status = 'calling';
      counter.activeTicket = eligibleTicket;

      masterState.currentCall = {
        ticket: { ...eligibleTicket },
        counter: { ...counter },
        calledAt: Date.now(),
        callType: 'FIRST_CALL'
      };

      return eligibleTicket;
    }

    case 'RECALL': {
      const counter = masterState.counters.find(c => c.id === payload.counterId);
      if (!counter || !counter.activeTicket) return null;

      counter.status = 'calling';
      masterState.currentCall = {
        ticket: { ...counter.activeTicket },
        counter: { ...counter },
        calledAt: Date.now(),
        callType: 'RECALL'
      };
      return counter.activeTicket;
    }

    case 'COMPLETE_TICKET': {
      const counter = masterState.counters.find(c => c.id === payload.counterId);
      if (!counter || !counter.activeTicket) return;

      const ticket = counter.activeTicket;
      ticket.status = 'completed';
      ticket.completedAt = Date.now();

      masterState.queue = masterState.queue.filter(t => t.id !== ticket.id);
      masterState.history.unshift(ticket);
      counter.activeTicket = null;
      counter.status = 'idle';
      return ticket;
    }

    case 'SKIP_TICKET': {
      const counter = masterState.counters.find(c => c.id === payload.counterId);
      if (!counter || !counter.activeTicket) return;

      const ticket = counter.activeTicket;
      ticket.status = 'skipped';
      ticket.skippedAt = Date.now();

      masterState.queue = masterState.queue.filter(t => t.id !== ticket.id);
      masterState.history.unshift(ticket);
      counter.activeTicket = null;
      counter.status = 'idle';
      return ticket;
    }

    case 'RESET_ALL': {
      masterState.queue = [];
      masterState.history = [];
      masterState.currentCall = null;
      masterState.counters.forEach(c => {
        c.activeTicket = null;
        c.status = 'idle';
      });
      return true;
    }

    default:
      throw new Error(`Aksi tidak dikenali: ${action}`);
  }
}

// BIND KE 0.0.0.0 (Agar bisa diakses oleh seluruh PC / HP di jaringan Wi-Fi/LAN)
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`\n===============================================================`);
  console.log(`🚀 Sistem Nomor Antrian: Creative and Marketing PU`);
  console.log(`===============================================================`);
  console.log(`💻 Buka di PC ini:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`\n📱 Buka di PC LAIN / TABLET / HP (dalam Wi-Fi/LAN yang sama):`);
  if (ips.length > 0) {
    ips.forEach(item => {
      console.log(`   👉 http://${item.ip}:${PORT}  (${item.interface})`);
    });
  } else {
    console.log(`   👉 Hubungkan PC ke Wi-Fi / LAN untuk melihat IP address.`);
  }
  console.log(`===============================================================\n`);
});
