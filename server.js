/**
 * T.E.C.S Pvt Ltd — Backend Server
 * Stack: Node.js + Express + @seald-io/nedb + Razorpay
 * Run: node server.js
 */

console.log('Starting T.E.C.S server...');

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const crypto     = require('crypto');
const Datastore  = require('@seald-io/nedb');

console.log('All modules loaded OK');

const app  = express();
const PORT = process.env.PORT || 3000;

const RAZORPAY_KEY_ID     = 'rzp_test_YourKeyIDHere';
const RAZORPAY_KEY_SECRET = 'YourKeySecretHere';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
console.log('Middleware set up OK');

const orders    = new Datastore({ filename: path.join(__dirname, 'db_orders.json'),    autoload: true });
const bookings  = new Datastore({ filename: path.join(__dirname, 'db_bookings.json'),  autoload: true });
const enquiries = new Datastore({ filename: path.join(__dirname, 'db_enquiries.json'), autoload: true });
const products  = new Datastore({ filename: path.join(__dirname, 'db_products.json'),  autoload: true });
console.log('Databases loaded OK');

products.count({}, function(err, count) {
  if(err){ console.error('DB count error:', err); return; }
  if(count === 0){
    var seed = [
      {name:'Vortex Flow Meter',                      brand:'Forbes Marshall', category:'flowmeter', type:'Flow Meter',        price:80000,  badge:'',    stock:30,  img:'https://www.forbesmarshall.com/wp-content/uploads/2023/11/SteaMon-600x600.png',     desc:'Original Forbes Marshall. Line size 15mm. Fluid type: Steam, Saturated Steam, Gas. Output signal 4-20mA. Accuracy ±0.75%.'},
      {name:'Vibration Transducers',                  brand:'Shinkawa',        category:'vibration', type:'Vibration Sensor',  price:70000,  badge:'',    stock:50,  img:'https://5.imimg.com/data5/SELLER/Default/2022/4/PY/EO/MJ/150706905/shinkawa-vibration-transducer-500x500.jpg', desc:'Built-in amp, 2-wire transducer. Original Shinkawa. Sensitivity: 3.94 mV/mm/s, freq range: 2.5Hz-3.5kHz.'},
      {name:'Vibration Transducers (API 670)',         brand:'Shinkawa',        category:'vibration', type:'Vibration Sensor',  price:60000,  badge:'',    stock:40,  img:'https://5.imimg.com/data5/SELLER/Default/2022/4/RM/CX/JD/150706905/shinkawa-api670-transducer-500x500.jpg', desc:'API 670 compliant. Original Shinkawa. Sensitivity: 50 mV/g, freq range: DC to 200Hz.'},
      {name:'Shinkawa Vibration Monitoring System',   brand:'Shinkawa',        category:'vibration', type:'Vibration Monitor', price:450000, badge:'New', stock:10,  img:'https://5.imimg.com/data5/SELLER/Default/2023/6/316143834/SU/ZB/GX/150706905/shinkawa-vm5w2-500x500.jpg', desc:'Redundant power supply VM-5w2. Modbus RTU. API 670. 2 channel. Power: 24V DC.'},
      {name:'Digital Compact Monitors',               brand:'Shinkawa',        category:'vibration', type:'Vibration Monitor', price:175000, badge:'',    stock:15,  img:'https://5.imimg.com/data5/SELLER/Default/2023/6/316143834/SU/ZB/GX/150706905/shinkawa-digital-compact-monitor-500x500.jpg', desc:'Modbus/TCP. 8 channel. Output: 4-20mA Modbus RS485. Power: 24V DC.'},
      {name:'Steam Operated Condensate Pump',         brand:'Forbes Marshall', category:'pump',      type:'Condensate Pump',   price:60000,  badge:'',    stock:25,  img:'https://www.forbesmarshall.com/wp-content/uploads/2022/03/PPP-600x600.png', desc:'Operates on steam or compressed air. Automatic operation. Original Forbes Marshall.'},
      {name:'Pressure Powered Pumping Packaged Unit', brand:'Forbes Marshall', category:'pump',      type:'Pumping Unit',      price:120000, badge:'',    stock:10,  img:'https://www.forbesmarshall.com/wp-content/uploads/2022/03/PPPPU-600x600.png', desc:'No electric motor. Flow rate: 100-10,000 kg/hr. Skid mounted. Original Forbes Marshall.'},
      {name:'Forbes Marshall Control Valves',         brand:'Forbes Marshall', category:'valve',     type:'Control Valve',     price:50000,  badge:'',    stock:35,  img:'https://www.forbesmarshall.com/wp-content/uploads/2022/06/Control-Valve-600x600.png', desc:'Globe valve DN15-DN300. Pneumatic actuation. Carbon steel body. Original Forbes Marshall.'},
      {name:'DG Control Panel Repairing Services',    brand:'TECS',            category:'control',   type:'Panel Repair',      price:8500,   badge:'OEM', stock:999, img:'https://5.imimg.com/data5/SELLER/Default/2022/11/UU/HW/EQ/150706905/dg-control-panel-500x500.jpg', desc:'Industrial control repair. AMF panel. Synchronizing panel services. On site & AMC.'},
    ];
    products.insert(seed, function(err2){
      if(err2) console.error('Seed error:', err2);
      else console.log('[DB] 9 products seeded successfully.');
    });
  } else {
    console.log('[DB] Products already exist:', count);
  }
});

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

app.post('/api/razorpay/create-order', async function(req, res){
  try {
    const { amount, currency, receipt } = req.body;
    if(!amount) return res.status(400).json({error:'amount required'});
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: currency||'INR', receipt: receipt||uid(), notes:{source:'TECS Website'} })
    });
    if(!response.ok){ const err = await response.text(); return res.status(500).json({error:'Razorpay order creation failed'}); }
    const order = await response.json();
    console.log('[Razorpay] Order created:', order.id, '| Rs.' + (amount/100));
    res.json(order);
  } catch(err){ res.status(500).json({error: err.message}); }
});

app.post('/api/razorpay/verify', function(req, res){
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({error:'Missing payment details'});
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if(expected !== razorpay_signature) return res.status(400).json({error:'Invalid signature', valid:false});
    console.log('[Razorpay] Payment verified:', razorpay_payment_id);
    res.json({ valid:true, payment_id: razorpay_payment_id });
  } catch(err){ res.status(500).json({error: err.message}); }
});

app.get('/api/health', function(req, res){
  res.json({ status:'ok', time: new Date().toISOString(), message:'T.E.C.S Server is running!' });
});

app.get('/api/products', function(req, res){
  var query = {};
  if(req.query.category && req.query.category !== 'all') query.category = req.query.category;
  if(req.query.type     && req.query.type     !== 'all') query.type     = req.query.type;
  products.find(query, function(err, docs){
    if(err) return res.status(500).json({error: err.message});
    var result = docs;
    if(req.query.search){
      var s = req.query.search.toLowerCase();
      result = docs.filter(function(d){ return d.name.toLowerCase().includes(s)||d.brand.toLowerCase().includes(s); });
    }
    res.json(result);
  });
});

app.post('/api/orders', function(req, res){
  if(!req.body.items || !req.body.total) return res.status(400).json({error:'items and total required'});
  var record = {
    id:uid(), items:req.body.items, total:req.body.total,
    status: req.body.status || 'Pending',
    razorpay_payment_id: req.body.razorpay_payment_id || '',
    razorpay_order_id:   req.body.razorpay_order_id   || '',
    customer:            req.body.customer             || {},
    createdAt: new Date().toISOString()
  };
  orders.insert(record, function(err, doc){
    if(err) return res.status(500).json({error: err.message});
    console.log('[DB] Order saved | Status:', doc.status, '| Rs.' + req.body.total);
    res.status(201).json(doc);
  });
});

app.get('/api/orders', function(req, res){
  orders.find({}).sort({createdAt:-1}).exec(function(err, docs){ res.json(docs); });
});

app.post('/api/bookings', function(req, res){
  if(!req.body.name || !req.body.phone) return res.status(400).json({error:'name and phone required'});
  var record = {
    id:uid(), name:req.body.name, phone:req.body.phone,
    company:req.body.company||'', specialist:req.body.specialist||'',
    date:req.body.date||'', job:req.body.job||'',
    status:'Confirmed', createdAt:new Date().toISOString()
  };
  bookings.insert(record, function(err, doc){
    if(err) return res.status(500).json({error: err.message});
    console.log('[DB] Booking saved | Name:', req.body.name);
    res.status(201).json(doc);
  });
});

app.get('/api/bookings', function(req, res){
  bookings.find({}).sort({createdAt:-1}).exec(function(err, docs){ res.json(docs); });
});

app.post('/api/enquiries', function(req, res){
  if(!req.body.name) return res.status(400).json({error:'name required'});
  var record = {
    id:uid(), name:req.body.name, company:req.body.company||'',
    contact:req.body.contact||'', service:req.body.service||'',
    message:req.body.message||'', status:'New', createdAt:new Date().toISOString()
  };
  enquiries.insert(record, function(err, doc){
    if(err) return res.status(500).json({error: err.message});
    console.log('[DB] Enquiry saved | Name:', req.body.name);
    res.status(201).json(doc);
  });
});

app.get('/api/enquiries', function(req, res){
  enquiries.find({}).sort({createdAt:-1}).exec(function(err, docs){ res.json(docs); });
});


// ════════════════════════════════════════
// DELETE ROUTES — Direct file approach
// ════════════════════════════════════════

function deleteFromDB(datastore, dbFile, id, res) {
  // Method 1: NeDB remove by _id
  datastore.remove({_id: id}, {multi:false}, function(err1, n1) {
    if (!err1 && n1 > 0) {
      datastore.persistence.compactDatafile();
      console.log('[DB] Deleted by _id:', id);
      return res.json({deleted: n1, method: '_id'});
    }
    // Method 2: NeDB remove by custom id field
    datastore.remove({id: id}, {multi:false}, function(err2, n2) {
      if (!err2 && n2 > 0) {
        datastore.persistence.compactDatafile();
        console.log('[DB] Deleted by id:', id);
        return res.json({deleted: n2, method: 'id'});
      }
      // Method 3: Direct file edit as last resort
      try {
        var fs = require('fs');
        var lines = fs.readFileSync(dbFile, 'utf8').split('\n');
        var before = lines.length;
        var filtered = lines.filter(function(line) {
          if (!line.trim()) return true; // keep empty lines
          try {
            var rec = JSON.parse(line);
            return rec._id !== id && rec.id !== id;
          } catch(e) { return true; }
        });
        if (filtered.length < before) {
          fs.writeFileSync(dbFile, filtered.join('\n'));
          // Reload datastore
          datastore.loadDatabase(function(){});
          console.log('[DB] Deleted by file edit:', id, 'removed:', before - filtered.length, 'lines');
          return res.json({deleted: before - filtered.length, method: 'file'});
        }
        console.log('[DB] ID not found anywhere:', id);
        return res.json({deleted: 0, method: 'none', searched_id: id});
      } catch(e3) {
        console.error('[DB] All delete methods failed:', e3.message);
        return res.status(500).json({error: e3.message});
      }
    });
  });
}

function deleteAllFromDB(datastore, dbFile, filterFn, res) {
  try {
    var fs = require('fs');
    var lines = fs.readFileSync(dbFile, 'utf8').split('\n');
    var count = 0;
    var filtered = lines.filter(function(line) {
      if (!line.trim()) return true;
      try {
        var rec = JSON.parse(line);
        if (filterFn(rec)) { count++; return false; }
        return true;
      } catch(e) { return true; }
    });
    fs.writeFileSync(dbFile, filtered.join('\n'));
    datastore.loadDatabase(function(){});
    console.log('[DB] Bulk deleted:', count, 'records');
    res.json({deleted: count});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}

var DB_BOOKINGS  = path.join(__dirname, 'db_bookings.json');
var DB_ENQUIRIES = path.join(__dirname, 'db_enquiries.json');

// Single delete
app.delete('/api/enquiries/:id', function(req, res){
  deleteFromDB(enquiries, DB_ENQUIRIES, req.params.id, res);
});

app.delete('/api/bookings/:id', function(req, res){
  deleteFromDB(bookings, DB_BOOKINGS, req.params.id, res);
});

// Bulk delete all
app.delete('/api/bookings', function(req, res){
  deleteAllFromDB(bookings, DB_BOOKINGS, function(){ return true; }, res);
});

app.delete('/api/enquiries', function(req, res){
  var filter = req.query.filter;
  var fn;
  if (filter === 'rfq')     fn = function(r){ return r.status==='RFQ' || r.service==='Spare Parts RFQ'; };
  else if (filter === 'general') fn = function(r){ return r.status!=='RFQ' && r.service!=='Spare Parts RFQ'; };
  else                      fn = function(){ return true; };
  deleteAllFromDB(enquiries, DB_ENQUIRIES, fn, res);
});

process.on('uncaughtException', function(err){ console.error('UNCAUGHT ERROR:', err.message); });

app.listen(PORT, function(){
  console.log('');
  console.log('========================================');
  console.log('  T.E.C.S Server running!');
  console.log('  Open: http://localhost:' + PORT);
  console.log('========================================');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});