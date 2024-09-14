const { loadavg, cpus, totalmem } = require('os');
const prettyMilliseconds = require('pretty-ms');
const version = "2.0.5";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const config = require("../config-bot.json");

// Store the bot's startup time
const botStartTime = Date.now();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Stats du bot !"),

    async execute(interaction) {
        let cpuCores = cpus().length;

        const e = new MessageEmbed()
            .setTitle("Informations sur le bot boost UHQ :")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter("Version " + version)
            .setTimestamp(Date())
            .setColor(interaction.color)
            .addField("**__:bookmark_tabs: Infos générales :__**", `> **:crown: Créateurs :** JulesZ\n**>  :calendar: Date de création :** 01/08/2024\n**>  :minidisc: Version :** ${version} `)
            .addField("**__:gear: Infos techniques :__**", `> **:floppy_disk: Bibliothèque :** Discord.JS V13.1.0\n > **:bar_chart: Utilisation du processeur :** ${(loadavg()[0] / cpuCores).toFixed(2)}% / 100% \n > **:bar_chart: Uptime :** ${prettyMilliseconds(Date.now() - botStartTime, { compact: true })}\n > **:bar_chart: Latence :** ${Math.sqrt(((new Date() - interaction.createdTimestamp) / (5 * 2)) ** 2)} ms \n > **:bar_chart: Utilisation de la RAM :** ${Math.trunc((process.memoryUsage().heapUsed) / 1000 / 1000)} MB / ${Math.trunc(totalmem() / 1000 / 1000)} MB`)

        await interaction.reply({ embeds: [e] });

        setTimeout(() => {
            return interaction.deleteReply().catch(console.error);
        }, 1 * 60 * 1000); // 1 minute in milliseconds
    }
};
