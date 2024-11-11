const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require('axios');
const config = require("../config-bot.json");
const fs = require('fs');
const langData = JSON.parse(fs.readFileSync('./api-translate/langs.json', 'utf-8'));
const lang = config.service.langue_shop;
const translations = langData[lang];
let name = config.service.name_shop;
// API key et client bot
let apikey = config.apikey;
let clientbot = config.bot.clientid;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription(translations['command']['10'])
        .addIntegerOption(option =>
            option.setName("nombre")
                .setDescription(translations['command']['11'])
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const nombre = interaction.options.getInteger("nombre");

        if (!nombre) {
            return interaction.editReply(translations['command']['26']);
        }

        // Détermine le stock à utiliser en fonction du choix de l'utilisateur
        let your = "yes";
        const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=${your}`, {}, {
            timeout: 1000000
        });
        if (responseuser.data.erreur === 'APIKey invalide') {
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle(translations['command']['5'])
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter(""+translations['command']['7']+" JulesZ");

            return interaction.editReply({ embeds: [embed] });
        } else if(responseuser.data.erreur === 'only API'){
            const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setLabel(translations['command']['4'])
                    .setURL(`https://panel.infinityboost.monster/`)
                    .setStyle('LINK')
                );
          let non = new MessageEmbed()
          .setColor("#ff0000")
          .setTitle(translations['command']['9'])
          .setDescription(translations['command']['8'])
          .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
          .setTimestamp()
          .setFooter(name+" - "+translations['command']['7']+" JulesZ")

          return interaction.editReply({ embeds: [non], components: [row] })
          } else if (responseuser.data.user !== interaction.user.username) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel(translations['command']['36'])
                    .setURL(`https://panel.infinityboost.monster/`)
                    .setStyle('LINK')
                );
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle(translations['command']['27'])
                .setDescription(translations['command']['12'])
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter(name+" - "+translations['command']['7']+" JulesZ");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }
        try {
            
            const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=SEND&nombre_tokens=${nombre}&your_stock=${your}`, {}, {
                timeout: 1000000 // Timeout pour la requête
            });

            if (response.data.erreur === 'hors stock') {
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Hors Stock")
                    .setDescription(name+translateText("n\'a plus de stock. Merci de patienter !", langue))
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");

                return interaction.editReply({ embeds: [embed] });
            }

            if (response.data.erreur === 'low_stock') {
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Hors Stock")
                    .setDescription(`InfinityBoost n\'a pas assez de stock. Merci de modifier le nombre choisix !`)
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");

                return interaction.editReply({ embeds: [embed] });
            }

            // Si les tokens ont été récupérés avec succès
            const pasteLink = response.data.link;
            const tokensTaken = response.data.tokens_taken;

            if (pasteLink) {
                const embed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle(translateText("Tokens récupérés avec succès !", langue))
                    .setDescription(`🔹 **`+translateText("Nombre de tokens envoyés", langue)+` :** ${tokensTaken}\n\n🔗 [`+translateText("Lien vers les tokens", langue)+`]( ${pasteLink} )`)
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(translateText("Erreur lors de la sauvegarde des tokens", langue))
                    .setDescription(translateText("Une erreur est survenue lors de l'envoi des tokens.", langue))
                    .setTimestamp()
                    .setFooter();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);

            // Gestion des erreurs d'appel API
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle(translations['command']['19'])
                .setDescription(translations['command']['20'])
                .setTimestamp()
                .setFooter(name+" - "+translations['command']['7']+" JulesZ");

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
