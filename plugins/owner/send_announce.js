exports.run = {
    usage: ['owngc'],
    use: 'text or reply media',
    category: 'owner',
    async: async (m, {
       client,
       text,
       command,
       isPrefix,
       Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Badan Teks | Teks Tombol | Id Tombol | Id/nomor Chat'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let [chatid, badan] = text.split`|`
            let jiid = '6281391337455@s.whatsapp.net'
            await Func.delay(3500)
            client.sendMessageModify(chatid, badan, null, {
               title: 'Xinzuo Chatbot',
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg'),
               largeThumb: true,
               url: global.db.setting.link,
               mentions: await (await client.groupMetadata(chatid)).participants.map(v => v.id)
        })
    } catch (e) {
        client.reply(m.chat, Func.jsonFormat(e), m)
        }
    },
    owner: true
}