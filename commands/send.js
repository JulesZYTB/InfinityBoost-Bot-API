const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require('axios');
const config = require("../config-bot.json");

// API key et client bot
let apikey = config.apikey;
let clientbot = config.bot.clientid;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Crée un lien avec les token de votre stock")
        .addIntegerOption(option =>
            option.setName("nombre")
                .setDescription("Nombre de tokens à envoyer")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("type")
                .setDescription("Utilisez votre stock")
                .setRequired(true)
                .addChoice("Stock site YOU", 3)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const nombre = interaction.options.getInteger("nombre");
        const type = interaction.options.getInteger("type");

        if (!nombre) {
            return interaction.editReply('Veuillez fournir le nombre de tokens pour envoyer.');
        }

        // Détermine le stock à utiliser en fonction du choix de l'utilisateur
        let your = (type === 3) ? "yes" : "no";
        const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=${your}`, {}, {
            timeout: 1000000
        });
        if (responseuser.data.erreur === 'APIKey invalide') {
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Erreur APIKey Invalid")
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter("Bot développé par JulesZ");

            return interaction.editReply({ embeds: [embed] });
        } else if(responseuser.data.erreur === 'only API'){
            const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setLabel('Voir le site')
                    .setURL(`https://panel.infinityboost.monster/`)
                    .setStyle('LINK')
                );
          let non = new MessageEmbed()
          .setColor("#ff0000")
          .setTitle("Erreur only API")
          .setDescription("Votre APIKey ne peut utiliser que votre stock et non celui de InfinityBoost !")
          .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
          .setTimestamp()
          .setFooter("Bot developpé par BloumeGen")

          return interaction.editReply({ embeds: [non], components: [row] })
          } else if (responseuser.data.user !== interaction.user.username) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Utilisée le panel')
                    .setURL(`https://panel.infinityboost.monster/`)
                    .setStyle('LINK')
                );
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Utilisation Interdit")
                .setDescription("Puisque tu n'es pas l'utilisateur qui possède ce Plan Obsidienne/API, tu ne peux pas utiliser cette commande.")
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter("Bot développé par JulesZ");

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
                    .setDescription(`InfinityBoost n\'a plus de stock. Merci de patienter !`)
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter("Bot développé par JulesZ");

                return interaction.editReply({ embeds: [embed] });
            }

            if (response.data.erreur === 'low_stock') {
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Hors Stock")
                    .setDescription(`InfinityBoost n\'a pas assez de stock. Merci de modifier le nombre choisix !`)
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter("Bot développé par JulesZ");

                return interaction.editReply({ embeds: [embed] });
            }

            // Si les tokens ont été récupérés avec succès
            const pasteLink = response.data.link;
            const tokensTaken = response.data.tokens_taken;

            if (pasteLink) {
                const embed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("Tokens récupérés avec succès !")
                    .setDescription(`🔹 **Nombre de tokens envoyés :** ${tokensTaken}\n\n🔗 [Lien vers les tokens]( ${pasteLink} )`)
                    .setTimestamp()
                    .setFooter("Bot développé par JulesZ");

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Erreur lors de la sauvegarde des tokens")
                    .setDescription("Une erreur est survenue lors de l'envoi des tokens.")
                    .setTimestamp()
                    .setFooter("Contactez le support de BloumeGen");

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);

            // Gestion des erreurs d'appel API
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Erreur API")
                .setDescription("Une erreur est survenue lors de l'appel à l'API. Contactez InfinityBoost.")
                .setTimestamp()
                .setFooter("Bot développé par JulesZ");

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
