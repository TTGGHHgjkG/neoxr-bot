const { Scraper, Cooldown, Spam, InvCloud } = new(require('@neoxr/wb'))
const Function = new (require('./lib/system/functions'))
const Func = Function
const env = require('./config.json')
const cron = require('node-cron')
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
const cooldown = new Cooldown(env.cooldown)
const spam = new Spam({
   RESET_TIMER: env.cooldown,
   HOLD_TIMER: env.timeout,
   PERMANENT_THRESHOLD: env.permanent_threshold,
   NOTIFY_THRESHOLD: env.notify_threshold,
   BANNED_THRESHOLD: env.banned_threshold
})

module.exports = async (client, ctx) => {
   const { store, m, body, prefix, plugins, commands, args, command, text, prefixes, core } = ctx
   // const context = m.message[m.mtype] || m.message.viewOnceMessageV2.message[m.mtype]
   // process.env['E_MSG'] = context.contextInfo ? Number(context.contextInfo.expiration) : 0
   try {
      // "InvCloud" reduces RAM usage and minimizes errors during rewrite (according to recommendations/suggestions from Baileys)
      require('./lib/system/schema')(m, env), InvCloud(store)
      const groupSet = global.db.groups.find(v => v.jid === m.chat)
      const chats = global.db.chats.find(v => v.jid === m.chat)
      const users = global.db.users.find(v => v.jid === m.sender)
      const setting = global.db.setting
      const isOwner = [client.decodeJid(client.user.id).replace(/@.+/, ''), env.owner, ...setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isPrem = users && users.premium || isOwner
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const isSpam = spam.detection(client, m, {
         prefix, command, commands, users, cooldown,
         show: 'command-only', // choose 'all' or 'command-only'
         banned_times: users.ban_times,
         simple: false
      })
      if (m.fromMe) global.db.setting.messageSent += 1
      if (!m.fromMe) global.db.setting.messageReceive += 1
      if (m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) global.db.setting.uploadSize += m.msg.fileLength.low
      if (!m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) global.db.setting.receiveSize += m.msg.fileLength.low
      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         client.readMessages([m.key])
      }
      if (m.isGroup && !isBotAdmin) {
         groupSet.localonly = false
      }
      if (!users || typeof users.limit === undefined) return global.db.users.push({
         jid: m.sender,
         banned: false,
         limit: env.limit,
         hit: 0,
         spam: 0
      })
      if (!setting.multiprefix) setting.noprefix = false
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup && !groupSet.stay && (new Date * 1) >= groupSet.expired && groupSet.expired != 0) {
         return client.reply(m.chat, Func.texted('italic', '🚩 Waktu bot disini sudah habis, terima kasih semua nya telah menggunakan jasa kami..', null, {
            mentions: participants.map(v => v.id)
         })).then(async () => {
            groupSet.expired = 0
            await Func.delay(2000).then(() => client.groupLeave(m.chat))
         })
      }
      if (users && (new Date * 1) >= users.expired && users.expired != 0) {
         return client.reply(users.jid, Func.texted('italic', '🚩 Paket premium kamu sudah habis, terima kasih telah menggunakan jasa kami.')).then(async () => {
            users.premium = false
            users.expired = 0
            users.limit = env.limit
         })
      }     
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) {
         users.name = m.pushName
         users.lastseen = new Date() * 1
      }
      if (chats) {
         chats.chat += 1
         chats.lastseen = new Date * 1
      }
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         client.reply(m.chat, `Kamu kembali online setelah : ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Alasan')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < env.limit && !v.premium).map(v => v.limit = env.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: process.env.TZ
      })
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      if (isSpam && /(BANNED|NOTIFY|TEMPORARY)/.test(isSpam.state)) return client.reply(m.chat, Func.texted('bold', `🚩 ${isSpam.msg}`), m)
      if (isSpam && /HOLD/.test(isSpam.state)) return
      if (body && !setting.self && !setting.noprefix && !core.corePrefix.includes(core.prefix) && commands.includes(core.command) && !env.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Prefix needed!*, this bot uses prefix : *[ ${setting.multiprefix ? setting.prefix.join(', ') : setting.onlyprefix} ]*\n\n➠ ${setting.multiprefix ? setting.prefix[0] : setting.onlyprefix}${core.command} ${text || ''}`, m)
      if (body && !setting.self && core.prefix != setting.onlyprefix && commands.includes(core.command) && !setting.multiprefix && !env.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Incorrect prefix!*, this bot uses prefix : *[ ${setting.onlyprefix} ]*\n\n➠ ${setting.onlyprefix + core.command} ${text || ''}`, m)
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Perintah yg kamu gunakan kurang tepat, coba rekomendasi kami :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)) {
         if (setting.pluginDisable.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Perintah _${(prefix ? prefix : '') + command}_ dinonaktifkan.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Func.hitstat(command, m.sender)
         }
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let name in is_commands) {
            const cmd = is_commands[name].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype)) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (!m.isGroup && !['owner'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < env.timeout) continue
            if (!m.isGroup && !['owner', 'menfess', 'scan', 'verify', 'payment', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) {
               client.sendMessageModify(m.chat, `⚠️ Menggunakan bot dalam obrolan pribadi hanya untuk pengguna premium, ingin meningkatkan ke paket premium? kirim *${prefixes[0]}premium* untuk melihat manfaat dan harga.`, m, {
                  largeThumb: true,
                  thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                  url: setting.link
               }).then(() => chats.lastchat = new Date() * 1)
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < env.timeout)) return
            if (!['verify', 'exec'].includes(name) && !m.isGroup && users && !users.banned && !users.verified && setting.verify) users.attempt += 1
            let teks = `🚩 *[ ${users.attempt} / 5 ]* Verifikasi nomor dengan menggunakan email, 1 email untuk memverifikasi 1 nomor WhatsApp. Silahkan ikuti step by step berikut :\n\n– *STEP 1*\nGunakan perintah *.reg <email>* untuk mendapatkan kode verifikasi melalui email.\nContoh: .reg akucintamonyet@gmail.com*\n\n– *STEP 2*\nBuka email dan cek pesan masuk atau di folder spam, setelah kamu mendapat kode verifikasi silahkan kirim kode tersebut kepada bot.\n\n*Note* :\nMengabaikan pesan ini sebanyak *5x* kamu akan di banned dan di blokir, untuk membuka banned dan blokir dikenai biaya sebesar Rp. 10,000`
            if (users && !users.banned && !users.verified && users.attempt >= 5 && setting.verify) return client.reply(m.isGroup ? m.sender : m.chat, Func.texted('bold', `🚩 [ ${users.attempt} / 5 ] : Kamu mengabaikan pesan verifikasi tapi tenang masih ada bot lain kok, banned thanks. (^_^)`), m).then(() => {
               users.banned = true
               users.attempt = 0
               users.code = ''
               users.codeExpire = 0
               users.email = ''
               client.updateBlockStatus(m.sender, 'block')
            })
            if (!['verify', 'exec'].includes(name) && !m.isGroup && users && !users.banned && !users.verified && setting.verify) return client.sendMessageModify(m.chat, teks, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/31601aee3fdf941bebbc4.jpg')
            })
            if (!['verify', 'exec'].includes(name) && m.isGroup && users && !users.banned && !users.verified && setting.verify) return client.reply(m.chat, `🚩 Nomor kamu belum terverifikasi, untuk verifikasi kirim *.reg <email>* di chat pribadi.`, m)
            if (m.isGroup && !['activation', 'oactivation', 'groupinfo', 'exec', 'makeAdmin'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.error) {
               client.reply(m.chat, global.status.errorF, m)
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < env.timeout)) continue
            if (m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               Func.updateFile(cmd.location)
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ Anda melanggar *Syarat & Ketentuan* penggunaan bot dengan menggunakan kata kunci yang masuk daftar hitam, sebagai hukuman atas pelanggaran Anda diblokir dan dilarang.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && users.limit < 1) {
               client.reply(m.chat, `⚠️ kamu mencapai batas yg di tentukan dan akan di reset pada pukul 00.00\n\nuntuk mendapatkan batas unlimited upgrade ke premium.`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `⚠️ Limit Anda tidak cukup untuk menggunakan fitur ini.`), m)
                  continue
               }
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, Func, Scraper })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if (m.fromMe || m.chat.endsWith('broadcast') || /pollUpdate/.test(m.mtype)) continue
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && ['ai', 'start-chat', 'stop'].includes(name) && !['menfess_ev', 'anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && users && (users.banned || new Date - users.ban_temporary < env.timeout)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && groupSet && groupSet.mute) continue
            if (!m.isGroup && !['menfess_ev', 'chatbot', 'auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < env.timeout) continue
            if (!m.isGroup && setting.groupmode && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download'].includes(name) && !isPrem) return client.sendMessageModify(m.chat, `⚠️ Using bot in private chat only for premium user, want to upgrade to premium plan ? send *${prefixes[0]}premium* to see benefit and prices.`, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg'),
               url: setting.link
            }).then(() => chats.lastchat = new Date() * 1)
            if (event.cache && event.location) {
               Func.updateFile(event.location)
            }
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.limit && !event.game && users.limit < 1 && body && Func.generateLink(body) && Func.generateLink(body).some(v => Func.socmed(v))) return client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plan.`, m).then(() => {
               users.premium = false
               users.expired = 0
            })
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && users && !users.verified && body && Func.socmed(body) && setting.verify) return client.reply(m.chat, `🚩 Your number has not been verified, verify by sending *${prefixes[0]}reg <email>* in private chat.`, m)
            if (event.download && (!setting.autodownload || (body && env.evaluate_chars.some(v => body.startsWith(v))))) continue
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, Func, Scraper })
         }
      }
   } catch (e) {
      if (/(undefined|overlimit|timed|timeout|users|item|time)/ig.test(e.message)) return
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}
