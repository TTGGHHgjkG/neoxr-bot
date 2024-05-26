"use strict";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
process.on('uncaughtException', console.error)
require('events').EventEmitter.defaultMaxListeners = 500
const { Baileys } = new(require('@neoxr/wb'))
const Function = new (require('./lib/system/functions'))
const Func = Function
const spinnies = new(require('spinnies'))(),
   fs = require('fs'),
   path = require('path'),
   colors = require('@colors/colors'),
   stable = require('json-stable-stringify'),
   env = require('./config.json'),
   axios = require('axios'),
   chalk = require('chalk'),
   express = require('express'),
   { exec } = require('child_process'),
   app = express(),
   http = require('http'),
   sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
let i = 0
const PORT = process.env.PORT || 8080
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
const MongoDB = /mongo/.test(process.env.DATABASE_URL) && process.env.DATABASE_URL ? new (require('./system/mongo')) : false
const PostgreSQL = /postgres/.test(process.env.DATABASE_URL) && process.env.DATABASE_URL ? new (require('./system/pg')) : false
if (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) MongoDB.db = env.database
const machine = (process.env.DATABASE_URL && /mongo/.test(process.env.DATABASE_URL)) ? MongoDB : (process.env.DATABASE_URL && /postgres/.test(process.env.DATABASE_URL)) ? PostgreSQL : new(require('./lib/system/localdb'))(env.database)
const client = new Baileys({
   type: '--neoxr-v1',
   plugsdir: 'plugins',
   sf: 'session-bot',
   online: true,
   version: [2, 2413, 51]
})

/* starting to connect */
client.on('connect', async res => {
   /* load database */
   global.db = {users:[], chats:[], groups:[], statistic:{}, sticker:{}, setting:{}, ...(await machine.fetch() ||{})}
   
   /* save database */
   await machine.save(global.db)

   /* write connection log */
   if (res && typeof res === 'object' && res.message) Func.logFile(res.message)
})

/* print error */
client.on('error', async error => {
   console.log(colors.red(error.message))
   if (error && typeof error === 'object' && error.message) Func.logFile(error.message)
})

/* bot is connected */
client.on('ready', async () => {

   const runServer = async () => {
      app.set('json spaces', 2)
      app.get("/get-api", async (req, res) => {
         const serverInfoo = {
           bot: {
            users: global.db.users.length,
            hit: Func.formatNumber(Func.jumlahkanHitStat(global.db.statistic)),
            msgr: Func.formatNumber(global.db.setting.messageReceive),
            msgs: Func.formatNumber(global.db.setting.messageSent)
           },
         }
           res.json(serverInfoo);
         })
   
      app.get('/', (req, res) => res.send('Server Active!'))
      const server = http.createServer(app)
      server.listen(PORT, () => console.log(chalk.yellowBright.bold('Connected to server --', PORT)))
      while (true) {
         i++
         try {
            // add your server link on config,json for run 24×7hours. If you are deploying on replit
            let response = await axios(env.replit_url || 'https://google.com')
            if (env.replit_url) console.log(chalk.yellowBright.bold('Server wake-up! --', response.status))
            await sleep(30_000)
         } catch {}
      }
   }

   runServer().then(() => runServer())

   // Fungsi untuk merestart proses
const restartProcess = () => {
   process.send('reset', (error, stdout, stderr) => {
      if (error) {
         console.error(`Error restarting process: ${error.message}`);
         return;
      }
      if (stderr) {
         console.error(`stderr: ${stderr}`);
         return;
      }
      console.log(`stdout: ${stdout}`);
   });
};

/* auto restart if ram usage is over */
const ramCheck = setInterval(() => {
   var ramUsage = process.memoryUsage().rss
   if (ramUsage >= require('bytes')(env.ram_limit)) {
      clearInterval(ramCheck)
      process.send('reset')
   }
}, 60 * 1000)

// Interval untuk restart setiap 1 jam
const hourlyRestart = setInterval(() => {
   console.log('Restarting process every 1 hour...');
   restartProcess(hourlyRestart);
}, 60 * 60 * 1000); // 3,600,000 milliseconds = 1 hour


   /* create temp directory if doesn't exists */
   if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

   /* require all additional functions */
   require('./lib/system/config'), require('./lib/system/baileys')(client.sock), require('./lib/system/functions'), require('./lib/system/scraper')

   /* clear temp folder every 10 minutes */
   setInterval(() => {
      try {
         const tmpFiles = fs.readdirSync('./temp')
         if (tmpFiles.length > 0) {
            tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
         }
      } catch {}
   }, 60 * 1000 * 10)

   /* save database send http-request every 30 seconds */
   setInterval(async () => {
      if (global.db) await machine.save(global.db)
      if (process.env.CLOVYR_APPNAME && process.env.CLOVYR_URL && process.env.CLOVYR_COOKIE) {
         const response = await axios.get(process.env.CLOVYR_URL, {
            headers: {
               referer: 'https://clovyr.app/view/' + process.env.CLOVYR_APPNAME,
               cookie: process.env.CLOVYR_COOKIE
            }
         })
         Func.logFile(`${await response.status} - Application wake-up!`)
      }
   }, 30_000)
})

/* print all message object */
client.on('message', ctx => require('./handler')(client.sock, ctx))

/* print deleted message object */
client.on('message.delete', ctx => {
   const sock = client.sock  
   if (!ctx || ctx.origin.fromMe || ctx.origin.isBot || !ctx.origin.sender) return
   if (cache.has(ctx.origin.sender) && cache.get(ctx.origin.sender) === 1) return
   cache.set(ctx.origin.sender, 1)
   if (ctx.origin.isGroup && global.db.groups.some(v => v.jid == ctx.origin.chat) && global.db.groups.find(v => v.jid == ctx.origin.chat).antidelete) return sock.copyNForward(ctx.origin.chat, ctx.delete)
})

/* AFK detector */
client.on('presence.update', update => {
   if (!update) return
   const sock = client.sock
   const { id, presences } = update
   if (id.endsWith('g.us')) {
      for (let jid in presences) {
         if (!presences[jid] || jid == sock.decodeJid(sock.user.id)) continue
         if ((presences[jid].lastKnownPresence === 'composing' || presences[jid].lastKnownPresence === 'recording') && global.db && global.db.users && global.db.users.find(v => v.jid == jid) && global.db.users.find(v => v.jid == jid).afk > -1) {
            sock.reply(id, `System detects activity from @${jid.replace(/@.+/, '')} after being offline for : ${Func.texted('bold', Func.toTime(new Date - global.db.users.find(v => v.jid == jid).afk))}\n\n➠ ${Func.texted('bold', 'Reason')} : ${global.db.users.find(v => v.jid == jid).afkReason ? global.db.users.find(v => v.jid == jid).afkReason : '-'}`, global.db.users.find(v => v.jid == jid).afkObj)
            global.db.users.find(v => v.jid == jid).afk = -1
            global.db.users.find(v => v.jid == jid).afkReason = ''
            global.db.users.find(v => v.jid == jid).afkObj = {}
         }
      }
   } else {}
})

client.on('group.add', async ctx => {
   const sock = client.sock
   const text = `Selamat bergabung +tag di grup +grup.`
   const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
   try {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'))
   } catch {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.jid, 'image'))
   }

   /* localonly to remove new member when the number not from indonesia */
   if (groupSet && groupSet.localonly) {
      if (global.db.users.some(v => v.jid == ctx.member) && !global.db.users.find(v => v.jid == ctx.member).whitelist && !ctx.member.startsWith('62') || !ctx.member.startsWith('62')) {
         sock.reply(ctx.jid, Func.texted('bold', `Sorry @${ctx.member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
         sock.updateBlockStatus(member, 'block')
         return await Func.delay(2000).then(() => sock.groupParticipantsUpdate(ctx.jid, [ctx.member], 'remove'))
      }
   }

   const txt = (groupSet && groupSet.text_welcome ? groupSet.text_welcome : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
   if (groupSet && groupSet.welcome) sock.sendMessageModify(ctx.jid, txt, null, {
      largeThumb: true,
      thumbnail: pic,
      url: global.db.setting.link
   })
})

client.on('group.remove', async ctx => {
   const sock = client.sock
   const text = `+tag Keluar.`
   const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
   try {
      var pic = await Func.fetchBuffer(await sock.profilePictureUrl(ctx.member, 'image'))
  } catch (error) {
      // Tangani kesalahan di sini
      console.error("Error while fetching profile picture:", error);
      // Lakukan sesuatu jika foto profil tidak ditemukan atau ada kesalahan lainnya
      // Misalnya, gunakan foto profil default
      var defaultPic = 'https://cdn.glitch.global/736587da-268f-4812-a21e-e1cb2ed22853/logo-ppwa.png?v=1707551595915'; // Tentukan foto profil default
      pic = await Func.fetchBuffer(defaultPic);
  }  
   const txt = (groupSet && groupSet.text_left ? groupSet.text_left : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
   if (groupSet && groupSet.left) sock.sendMessageModify(ctx.jid, txt, null, {
      largeThumb: true,
      thumbnail: pic,
      url: global.db.setting.link
   })
})

client.on('caller', ctx => {
	if (typeof ctx === 'boolean') return
	client.sock.updateBlockStatus(ctx.jid, 'block')
})

// client.on('group.promote', ctx => console.log(ctx))
// client.on('group.demote', ctx => console.log(ctx))