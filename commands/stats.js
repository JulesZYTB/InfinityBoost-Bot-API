const { loadavg, cpus, totalmem, freemem, uptime } = require('os');
const prettyMilliseconds = require('pretty-ms');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const config = require("../config-bot.json");
const fs = require('fs');
const path = require('path');
const disk = require('diskusage'); 
const langData = JSON.parse(fs.readFileSync('./api-translate/langs.json', 'utf-8'));
const lang = config.service.langue_shop; 
const translations = langData[lang];  
const botStartTime = Date.now();
const version = "3.0.0";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription(translations['command']["64"]),

    async execute(interaction) {
        let cpuCores = cpus().length;
        let cpuUsage = (loadavg()[0] / cpuCores).toFixed(2); 
        let memoryUsed = Math.trunc((process.memoryUsage().heapUsed) / 1024 / 1024); 
        let totalMemory = Math.trunc(totalmem() / 1024 / 1024); 
        let freeMemory = Math.trunc(freemem() / 1024 / 1024); 
        let nodeVersion = process.version; 
        let discordVersion = require("discord.js").version; 
        let botUptime = prettyMilliseconds(Date.now() - botStartTime, { compact: true });
        let systemUptime = prettyMilliseconds(uptime() * 1000, { compact: true }); 

        let diskInfo;
        try {
            diskInfo = disk.checkSync(path.parse(__dirname).root); 
        } catch (e) {
            console.error("Erreur lors de la récupération des informations de disque :", e);
        }
        
        let diskUsage = diskInfo ? ((diskInfo.total - diskInfo.free) / diskInfo.total * 100).toFixed(2) : "Indisponible";
        
        const embed = new MessageEmbed()
            .setTitle(translations['command']["49"]) 
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter(translations['command']["50"] + " " + version) 
            .setTimestamp(new Date())
            .setColor(interaction.color || "#7289DA")
            .addField("**__" + translations['command']["51"] + ":__**", 
                `> **:crown: ${translations['command']["59"]} :** JulesZ\n` +
                `> **:calendar: ${translations['command']["60"]} :** 11/01/2024\n` +
                `> **:minidisc: ${translations['command']["61"]} :** ${version}\n` +
                `> **:electric_plug: Version ${translations['command']["62"]} Node.js :** ${nodeVersion}\n` +
                `> **:electric_plug: Version ${translations['command']["62"]} Discord.js :** ${discordVersion}`
            )
            .addField("**__" + translations['command']["53"] + ":__**",
                `> **:gear: CPU :** ${cpuCores} ${translations['command']["56"]}\n` +
                `> **:bar_chart: ${translations['command']["63"]} CPU :** ${cpuUsage}% / 100%\n` +
                `> **:chart_with_upwards_trend: Uptime ${translations['command']["65"]} bot :** ${botUptime}\n` +
                `> **:chart_with_upwards_trend: Uptime ${translations['command']["65"]} système :** ${systemUptime}\n` +
                `> **:stopwatch: Latence :** ${Math.sqrt(((new Date() - interaction.createdTimestamp) / (5 * 2)) ** 2)} ms`
            )
            .addField("**__" + translations['command']["54"] + ":__**", 
                `> **:floppy_disk: RAM utilisée :** ${memoryUsed} MB / ${totalMemory} MB\n` +
                `> **:floppy_disk: RAM libre :** ${freeMemory} MB / ${totalMemory} MB\n` +
                `> **:minidisc: ${translations['command']["63"]} ${translations['command']["65"]} disque :** ${diskUsage}%`
            );

        await interaction.reply({ embeds: [embed] });

        setTimeout(() => {
            return interaction.deleteReply().catch(console.error);
        }, 1 * 60 * 1000); 
    }
};
