exports.run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      env,
      Func
   }) => {
      client.sendContact(m.chat, [{
         name: env.owner_name,
         number: env.owner,
         about: 'Layanan Bantuan'
      }], m, {
         org: 'Invoralink',
         website: 'https://www.xinzuo.xyz',
         email: 'contact.xinzuo@gmail.com'
      })
   },
   error: false,
   cache: true,
   location: __filename
}