const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id');

exports.run = {
    usage: ['changelog', 'log'],
    hidden: ['+log', '-log'],
    use: 'text',
    category: 'owner',
    async: async (m, {
        client,
        args,
        text,
        isOwner,
        isPrefix,
        command,
        Func
    }) => {
        try {
            let logs = typeof global.db.changelog == 'undefined' ? global.db.changelog = {} : global.db.changelog;
            let id = Func.makeId(4);

            if (command == '+log') {
                if (!isOwner) return client.reply(m.chat, global.status.owner, m);
                if (!text) return client.reply(m.chat, Func.example(isPrefix, command, '1 perbaikan'), m);

                let [type, logText] = text.split('|');
                if (!type || !logText) return client.reply(m.chat, Func.example(isPrefix, command, '1 perbaikan'), m);
                
                let typeLabel = '';
                switch (type) {
                    case '1':
                        typeLabel = '[fix]';
                        break;
                    case '2':
                        typeLabel = '[add]';
                        break;
                    case '3':
                        typeLabel = '[info]';
                        break;
                    default:
                        return client.reply(m.chat, Func.texted('bold', 'Opsi jenis log tidak valid. Gunakan 1 untuk fix, 2 untuk add, dan 3 untuk info.'), m);
                }

                logs[id] = {
                    log: Func.texted('bold', `${typeLabel}`) + `${logText}`,
                    at: new Date() * 1
                };

                client.reply(m.chat, Func.texted('bold', `Log berhasil ditambahkan dengan kode : "${id}".`), m);
            } else if (command == '-log') {
                if (!isOwner) return client.reply(m.chat, global.status.owner, m);
                if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'Z0JH'), m);
                if (!logs[args[0].toUpperCase()]) return client.reply(m.chat, Func.texted('bold', `Kode log tidak ada didalam database.`), m);

                delete logs[args[0].toUpperCase()];
                client.reply(m.chat, Func.texted('bold', `Log dengan kode "${args[0].toUpperCase()}" berhasil dihapus.`), m);
            } else if (/changelog|log/.test(command)) {
                let changelog = Object.entries(logs).sort((a, b) => b[1].at - a[1].at);
                if (changelog.length == 0) return client.reply(m.chat, Func.texted('bold', `Tidak ada riwayat perubahan (Changelog).`), m);
                let show = Math.min(20, changelog.length);
                let teks = `❏  *C H A N G E L O G*\n\n`;
                teks += `Informasi riwayat update, total terdapat ${Func.formatNumber(changelog.length)} log, maximal 20 log.` + '\n\n';
                teks += changelog.slice(0, show).map(([code, data], i) => ` *-*  [ ${Func.texted('monospace', `${moment(data.at).format('DD/MM/YY - HH:mm:ss')}`)} ]\n *➠*  ${data.log}`).join('\n\n');
                teks += `\n\n${global.footer}`;
                client.reply(m.chat, teks, null);
            }
        } catch (e) {
            console.log(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    cache: true,
    location: __filename
}
