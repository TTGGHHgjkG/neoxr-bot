exports.run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   hidden: ['tt'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      Scraper,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
         if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         //const json = await Api.neoxr('/tiktok', {
         //   url: Func.ttFixed(args[0])
         //})
         const json = await Scraper.tiktok(Func.ttFixed(args[0]))
         if (!json) return m.reply('Terjadi kesalahan')
         if (command == 'tiktok' || command == 'tt') {
            if (!json.image) return client.sendFile(m.chat, json.hdplay, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            if (json.image) {
               for (let p of json.image) {
                  client.sendFile(m.chat, p, 'image.jpg', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  await Func.delay(1500)
               }
            }
         }
         if (command == 'tikwm') return !json.music ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.wmplay, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
         if (command == 'tikmp3') return !json.music ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.music, 'audio.mp3', '', m)
         } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}