const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config-bot.json");
const axios = require("axios");
const fs = require("fs");

let apikey = config.apikey;
const langData = JSON.parse(fs.readFileSync("./api-translate/langs.json", "utf-8"));
const lang = config.service.langue_shop;
const translations = langData[lang];
let name = config.service.name_shop;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription(translations["command"]["37"]),

    async execute(interaction) {
        await interaction.deferReply();
        const responseuser = await axios.post(
            `https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=yes`,
            {},
            { timeout: 1000000 }
        );
        let guildid_nol = interaction.guild.id;

        if (responseuser.data.user !== interaction.user.username) {
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel(translations["command"]["36"])
                    .setURL(`https://panel.infinityboost.monster/`)
                    .setStyle("LINK")
            );

            const embed = new MessageEmbed()
                .setColor("#071b47")
                .setTitle(translations["command"]["27"])
                .setDescription(translations["command"]["12"])
                .setImage("https://panel.infinityboost.monster/standard%20(3).gif")
                .setTimestamp()
                .setFooter(name + " - " + translations["command"]["7"] + " JulesZ");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }

        const embed = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(translations["command"]["44"] + ` 0/None`)
            .setDescription(translations["command"]["45"])
            .setImage("https://panel.infinityboost.monster/standard%20(3).gif")
            .setTimestamp()
            .setFooter(name + " - " + translations["command"]["7"] + " JulesZ");

        await interaction.editReply({ embeds: [embed] });

        const { Client, Intents } = require("discord.js");
        const client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS
            ],
        });

        const maxLogs = 6;
        let savedLogs = [];
        let totalLeft = 0;

        client.on("ready", async () => {
            const guildsToLeave = client.guilds.cache.filter(guild => guild.id !== guildid_nol);
            const guildArray = Array.from(guildsToLeave.values());
            const totalGuilds = guildArray.length;

            for (let i = 0; i < guildArray.length; i += 5) {
                const batch = guildArray.slice(i, i + 5);

                for (const guild of batch) {
                    try {
                        await guild.leave();
                        totalLeft++;

                        let newLog =
                            `[+] ` +
                            translations["command"]["47"] +
                            ` ${client.user.tag} ` +
                            translations["command"]["48"] +
                            ` ${guild.name}`;

                        if (savedLogs.length >= maxLogs) {
                            savedLogs.pop(); // Supprimer le log le plus ancien
                        }

                        savedLogs.unshift(newLog); // Ajouter le nouveau log au début

                           const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle(
                                translations["command"]["44"] + ` ${totalLeft}/${totalGuilds}`
                            )
                            .setDescription(translations["command"]["46"])
                            .setImage("https://panel.infinityboost.monster/standard%20(3).gif")
                            .setTimestamp()
                            .setFooter(name + " - " + translations["command"]["7"] + " JulesZ");

                        if (savedLogs.length > 0) {
                            const logsText = savedLogs.join("\n");
                            embed.addField("Logs", "```\n" + logsText + "\n```", true);
                        }

                        await interaction.editReply({ embeds: [embed] });
                    } catch (error) {
                        console.error(`Erreur en quittant le serveur ${guild.name}: ${error}`);
                    }
                }

                if (i + 5 < guildArray.length) {
                    console.log("Pause de 30s avant de quitter le prochain lot de serveurs...");
                    await new Promise(resolve => setTimeout(resolve, 30 * 1000)); // Pause de 30 secondes
                }
            }

            console.log(`Processus terminé : ${totalLeft} serveurs quittés.`);
        });

        client.login(config.bot.token).catch(error => {
            console.log(`[ERROR] Token invalide : ${error.message}`);
        });
    },
};
