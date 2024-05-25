> let { proto, generateWAMessageFromContent } = require('@adiwajshing/baileys')

let msgs = generateWAMessageFromContent(m.chat, {
  viewOnceMessage: {
    message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: "test"
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "test"
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: "test",
            subtitle: "test",
            hasMediaAttachment: false
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                "name": "single_select",
                "buttonParamsJson": "{\"title\":\"MENU ALL \",{\"rows\":[{\"header\":\"header\",\"title\":\"title\",\"description\":\"Membuka seluruh fitur bot\",\"id\":\".menu\"},{\"header\":\"header\",\"title\":\"menu all deh \",\"description\":\"halo\",\"id\":\".menu\"}]}"
              }
           ],
          })
        })
    }
  }
}, {})

return await conn.relayMessage(m.key.remoteJid, msgs.message, {
  messageId: m.key.id
})