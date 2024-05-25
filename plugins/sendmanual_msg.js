exports.run = {
    usage: ['button-manual'],
    async: async (m, {
       client,
       isPrefix,
       command,
       text,
       Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Badan Teks | Teks Tombol | Id Tombol | Id/nomor Chat'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let [id, top, vers, bottom] = text.split`|`
          const buttons = [{
             name: 'quick_reply',
             buttonParamsJson: JSON.stringify({
                display_text: `${vers ? vers : ' '}`,
                id: `${isPrefix}${bottom ? bottom : ''}`
             })
          }]
          client.sendIAMessage(id, buttons, null, {
             header: '',
             content: `${top ? top : ' '}`,
             footer: global.footer,
          })
       } catch (e) {
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    cache: true,
    location: __filename
 }