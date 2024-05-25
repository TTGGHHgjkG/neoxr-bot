exports.run = {
    usage: ['send-ads'],
    async: async (m, {
       client,
       isPrefix,
       command,
       text,
       Func
    }) => {
       try {
        if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Id/nomor | text iklan | url gambar iklan'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let lastSeparatorIndex = text.lastIndexOf("|");
            let chat = text.split("|")[0]; // Mengambil bagian pertama dari text: "Hello"
            let body = text.split("|")[1]; // Mengambil bagian kedua dari text: "World"
            let btnid = text.split("|")[2] 
            let img = text.split("|")[3]; // Mengambil bagian ketiga dari text: "https://example.com/image.jpg"
            client.sendButtonImage(`${chat ? chat : '6281391337455@s.whatsapp.net'}`, [{
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                   display_text: 'Lihat selengkapnya',
                   id: `${btnid ? btnid : 'plus'}`
                })
             }], null, {
               body: `${body ? body : 'ini hanya contoh'}`,
               image: `${img ? img : 'https://cdn.glitch.global/736587da-268f-4812-a21e-e1cb2ed22853/logo-ppwa.png?v=1707551595915'}`
                   })
       } catch (e) {
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    cache: true,
    owner: true,
    location: __filename
 }