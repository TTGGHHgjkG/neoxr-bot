exports.run = {
    async: async (m, {
       client,
       users,
       body,
       setting
    }) => {
       try {
          let levelAwal = Func.level(users.point, global.multiplier)[0]
          if (users && body) users.point += Func.randomInt(1, 100)
          let levelAkhir = Func.level(users.point, global.multiplier)[0]
          if (levelAwal != levelAkhir && setting.levelup) client.reply(m.chat, `乂  *L E V E L - U P*\n\nFrom : [ *${levelAwal}* ] ➠ [ *${levelAkhir}* ]\n*Congratulations!*, you have leveled up 🎉🎉🎉`, m)
       } catch (e) {
          console.log(e)
          return client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    cache: true,
    location: __filename
 }