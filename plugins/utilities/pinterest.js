const baileys = require('@adiwajshing/baileys')
const { proto } = baileys
exports.run = {
   usage: ['pinterest'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, `panda`), m);
         client.sendReact(m.chat, '🕒', m.key);
         let old = new Date();
         const json = await Api.neoxr('/pinterest', {
            q: text
         });
         async function createImage(url) {
          const { imageMessage } = await baileys.generateWAMessageContent({
            image: {
              url
            }
          }, {
            upload: client
            .waUploadToServer
          })
          return imageMessage
        }
         if (!json.status) return client.reply(m.chat, global.status.fail, m);
         client.relayMessage(m.chat, { 
            viewOnceMessage: {
               message: {
                   "messageContextInfo": {
                     "deviceListMetadata": {},
                     "deviceListMetadataVersion": 2
                   },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: 'silahkan pilih gambar yg kamu inginkan.'
                   }),
                   footer: proto.Message.InteractiveMessage.Footer.fromObject({
                     text: "© xinzuo chatbot from invoralink"
                   }),
                   header: proto.Message.InteractiveMessage.Header.fromObject({
                     title: "Pinterest Search",
                     subtitle: "Pinterest Search"
                   }),
                     carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: [
                           {
                             header: {
                               imageMessage: await createImage(json.data[0]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: [],
                             },
                           },
                           {
                             header: {
                               imageMessage: await createImage(json.data[1]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: [],
                             },
                           },
                           {
                             header: {
                               imageMessage: await createImage(json.data[2]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: [],
                             },
                           },
                           {
                             header: {
                               imageMessage: await createImage(json.data[3]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: [],
                             },
                           },
                           {
                             header: {
                               imageMessage: await createImage(json.data[4]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: [],
                             },
                           },
                           {
                             header: {
                               imageMessage: await createImage(json.data[5]),
                               hasMediaAttachment: true,
                             },
                             body: { text: "" },
                             nativeFlowMessage: {
                               buttons: []
                             }
                           }
                         ]
                     })                     
                  })
               }
            }
         }, m);           
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
};