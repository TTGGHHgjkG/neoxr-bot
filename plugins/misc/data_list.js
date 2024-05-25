exports.run = {
  usage: ['listban', 'listprem', 'listblock', 'listcr'],
  category: 'miscs',
  async: async (m, {
    client,
    command,
    isOwner,
    env,
    blockList,
    Func
  }) => {
    if (command === 'listban') {
      const data = global.db.users.filter(v => v.banned)
      if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T B A N*\n\n`
      text += data.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    } else if (command == 'listcr') {
      const data = global.db.chatroom
      if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `Saat ini Chatroom sedang kosong.`), m)
      let text = `乂 *C H AT R O O M*\n\n`
      text += data.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    } else if (command == 'listerror') {
      const data = global.db.setting.error
      if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
      let teks = `乂  *E R R L I S T*\n\n`
      teks += data.map(cmd => '	◦ ' + isPrefix + cmd).join('\n') + '\n\n'
      teks += global.footer
      client.sendMessageModify(m.chat, teks, m, {
         ads: false,
         largeThumb: true
      })
    } else if (command === 'listprem') {
      if (!isOwner) return m.reply(global.status.owner)
      const data = global.db.users.filter(v => v.premium)
      if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T P R E M*\n\n`
      text += data.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    } else if (command === 'listblock') {
      if (blockList.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T B L O C K*\n\n`
      text += blockList.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    }
  },
  error: false,
  cache: true,
  location: __filename
}