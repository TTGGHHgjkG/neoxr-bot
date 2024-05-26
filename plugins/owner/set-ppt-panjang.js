const Jimp = require("jimp");
exports.run = {
   usage: ['pppanjang'],
   async: async (m, {
      client,
      Func
   }) => {
    try {
      let q = m.quoted ? m.quoted : m
        let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
        if (/image\/(jpe?g|png)/.test(mime)) {
           client.sendReact(m.chat, '🕒', m.key)
           const buffer = await q.download()

           async function updateProfilePicture(jid, content) {
            const { img } = await generateProfilePicture(content);
            //const { img } = await (0, Utils_1.generateProfilePicture)(content);
            await client.query({
                tag: 'iq',
                attrs: {
                    to: jid,
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [
                    {
                        tag: 'picture',
                        attrs: { type: 'image' },
                        content: img
                    }
                ]
            });
        }
          
          async function generateProfilePicture(buffer) {
            const jimp = await Jimp.read(buffer);
            const min = jimp.getWidth();
            const max = jimp.getHeight();
            const cropped = jimp.crop(0, 0, min, max);
            return {
              img: await cropped.scaleToFit(324, 720).getBufferAsync(Jimp.MIME_JPEG),
              preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
            };
          }

           await updateProfilePicture('6282221251804@s.whatsapp.net', buffer)
           await Func.delay(3000).then(() => client.reply(m.chat, Func.texted('bold', `🚩 Profile photo has been successfully changed.`), m))
        } else return client.reply(m.chat, Func.texted('bold', `🚩 Reply to the photo that will be made into the bot's profile photo.`), m)
         } catch (e) {
            client.reply(m.chat, Func.jsonFormat(e), m)
         }
   },
   owner: true,
   error: false,
   cache: true,
   location: __filename
}