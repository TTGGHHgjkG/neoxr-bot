const { Function: Func } = new(require('@neoxr/wb'))
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys')
const { proto } = require('@adiwajshing/baileys')
const fs = require('fs')
const { tmpdir } = require('os')
const http = require('https')
const mime = require('mime-types')

async function download(url, filename, callback) {
   let file = fs.createWriteStream(filename)
   http.get(url, function(response) {
      response.pipe(file)
      file.on('finish', function() {
         file.close(callback)
      })
   })
}

module.exports = client => {
   client.sendDocument = async (jid, source, name, quoted, opts = {}) => {
      let getExt = name.split('.')
      let ext = getExt[getExt.length - 1]
      let isFile = tmpdir() + '/' + name.replace(/(\/)/g, '-')
      if (Buffer.isBuffer(source)) {
         fs.writeFileSync(isFile, source)
         await client.sendPresenceUpdate('composing', jid)
         return client.sendMessage(jid, {
            document: {
               url: isFile
            },
            fileName: name,
            mimetype: typeof mime.lookup(ext) != 'undefined' ? mime.lookup(ext) : mime.lookup('txt')
         }, {
            quoted
         }).then(() => fs.unlinkSync(isFile))
      } else {
         await download(source, isFile, async () => {
            await client.sendPresenceUpdate('composing', jid)
            return client.sendMessage(jid, {
               document: {
                  url: isFile
               },
               fileName: name,
               jpegThumbnail: (opts && opts.thumbnail) ? await Func.createThumb(opts.thumbnail) : await Func.createThumb('https://cdn.glitch.global/736587da-268f-4812-a21e-e1cb2ed22853/logo-ppwa.png?v=1707551595915'),
               mimetype: typeof mime.lookup(ext) ? mime.lookup(ext) : mime.lookup('txt')
            }, {
               quoted
            }).then(() => fs.unlinkSync(isFile))
         })
      }
   }

   client.sendFDoc = async (jid, text, quoted, opts = {}) => {
  	await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, {
         document: {
            url: 'https://iili.io/His5lBp.jpg'
         },
         url: 'https://mmg.whatsapp.net/v/t62.7119-24/31158881_1025772512163769_7208897168054919032_n.enc?ccb=11-4&oh=01_AdSBWokZF7M6H3NCfmTx08kHU3Dqw8rhlYlgUfXP6sACIg&oe=64CC069E&mms3=true',
         mimetype: (opts && opts.mime) ? mime(opts.mime) : mime('ppt'),
         fileSha256: 'dxsumNsT8faD6vN91lNkqSl60yZ5MBlH9L6mjD5iUkQ=',
         pageCount: (opts && opts.pages) ? Number(opts.pages) : 25,
         fileEncSha256: 'QGPsr3DQgnOdGpfcxDLFkzV2kXAaQmgTV8mYDzwrev4=',
         jpegThumbnail: (opts && opts.thumbnail) ? await Func.createThumb(opts.thumbnail) : await Func.createThumb('https://iili.io/HisdzgI.jpg'),
         fileName: (opts && opts.fname) ? opts.fname : 'ɴᴇᴏxʀ ʙᴏᴛ',
         fileLength: (opts && opts.fsize) ? Number(opts.fsize) : 1000000000000,
         caption: text,
         mediaKey: 'u4PCBMBCnVT0s1M8yl8/AZYmeK8oOBAh/fnnVPujcgw=',
      }, {
         quoted
      })
   }
   
   client.getName = jid => {
      const isFound = global.db.users.find(v => v.jid === client.decodeJid(jid))
      if (!isFound) return null
      return isFound.name
   }

   client.sendButtonImage = async (jid, button, quoted, opts = {}) => {
      var image = await prepareWAMessageMedia({
         image: {
            url: opts && opts.image ? opts.image : ''
         }
      }, {
         upload: client.waUploadToServer
      })
      let message = generateWAMessageFromContent(jid, {
         viewOnceMessage: {
            message: {
               interactiveMessage: {
                  header: {
                     title: opts && opts.header ? opts.header : '',
                     hasMediaAttachment: true,
                     imageMessage: image.imageMessage
                  },
                  body: {
                     text: opts && opts.body ? opts.body : ''
                  },
                  footer: {
                     text: opts && opts.footer ? opts.footer : ''
                   },
                  nativeFlowMessage: {
                     buttons: button,
                     messageParamsJson: ''
                  }
               }
            }
         }
      }, {
         quoted
      });
      await client.sendPresenceUpdate('composing', jid)
      client.relayMessage(jid, message["message"], {
         messageId: message.key.id
      })
   }

 client.sendListImage = async (jid, sections, quoted, opts = {}) => {
      var image = await prepareWAMessageMedia({
         image: {
            url: opts && opts.image ? opts.image : ''
         }
      }, {
         upload: client.waUploadToServer
      })
      let message = generateWAMessageFromContent(jid, {
         viewOnceMessage: {
            message: {
               interactiveMessage: {
                  header: {
                     title: opts && opts.header ? opts.header : '',
                     hasMediaAttachment: true,
                     imageMessage: image.imageMessage
                  },
                  body: {
                     text: opts && opts.body ? opts.body : ''
                  },
                  footer: {
                     text: opts && opts.footer ? opts.footer : 'Dikelola oleh xinzuo chatbot'
                   },
                  nativeFlowMessage: {
                     buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                           title: opts && opts.title ? opts.title : 'Pilih Disini!',
                           sections: sections
                        })
                     }],
                     messageParamsJson: ''
                  }
               }
            }
         }
      }, {
         quoted
      });
      await client.sendPresenceUpdate('composing', jid)
      client.relayMessage(jid, message["message"], {
         messageId: message.key.id
      })
   }
}