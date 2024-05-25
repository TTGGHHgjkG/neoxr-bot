let { proto } = require('@adiwajshing/baileys')

exports.run = {
    usage: ['flow-message'],
    async: async (m, {
        client,
        isPrefix,
        command,
        Func
    }) => {
        try {
            client.relayMessage(m.chat, {  
                viewOnceMessage: {
                   message: {
                       "messageContextInfo": {
                         "deviceListMetadata": {},
                         "deviceListMetadataVersion": 2
                       },                 
                interactiveMessage: proto.Message.InteractiveMessage.create({
                   body: proto.Message.InteractiveMessage.Body.create({
                     text: 'tes'
                   }),    
                  nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                         })
                      })
                   }
                }
             }, m)
        } catch (e) {
            client.reply(m.chat, Func.jsonFormat(e), m)
        }
    },
    error: false,
    cache: true,
    location: __filename
}
