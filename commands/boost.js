const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require('axios');
const config = require("../config-bot.json");
//Code by JulesZ .
let apikey = config.apikey;
let clientbot = config.bot.clientid;
module.exports = {
    data: new SlashCommandBuilder()
        .setName("boost")
        .setDescription("Booster un serveur Discord")
        .addStringOption(option => 
            option.setName("guildid")
              .setDescription("Guild ID de votre serveur Discord")
              .setRequired(true)
          )
          .addIntegerOption(option => 
            option.setName("type")
              .setDescription("Utilisée votre stock ou le stock du site !")
              .setRequired(true)
              .addChoice("Stock site", 1)
              .addChoice("Stock site YOU", 3)
          )
          .addStringOption(option => 
            option.setName("bio")
              .setDescription("Bio personnalisée pour les boosts")
              .setRequired(true)
        )
        .addIntegerOption(option => {
            option.setName("nombre1")
                .setDescription("Nombre de boosts pour votre serveur de 2 à 28")
                .setRequired(true);

            for (let i = 2; i <= 28; i += 2) {
                option.addChoice(`${i} boosts`, i);
            }

            return option;
        })
        .addIntegerOption(option => {
            option.setName("nombre2")
                .setDescription("Nombre de boosts pour votre serveur de 30 à 56")
                .setRequired(false);

            for (let i = 30; i <= 56; i += 2) {
                option.addChoice(`${i} boosts`, i);
            }

            return option;
        }),

    async execute(interaction) {
        await interaction.deferReply();
        const guildid = interaction.options.getString("guildid").toLowerCase().trim();
        const bio = interaction.options.getString("bio");
        const nombre = interaction.options.getInteger("nombre1") || interaction.options.getInteger("nombre2");
        const type = interaction.options.getInteger("type");

        if (!guildid) {
            return interaction.editReply('Veuillez fournir le guild ID du serveur que vous voulez booster.');
        }
        if (!nombre) {
            return interaction.editReply('Veuillez fournir le nombre de boosts pour votre serveur.');
        }

        if(type === 1 || type === 3) {
        let your = "";
        if (type === 3) {
            your = "yes"; 
        } else {
            your = "no"; 
        }
        const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=${your}`, {}, {
            timeout: 1000000
        });
        if (responseuser.data.erreur === 'APIKey invalide') {
            const embed = new MessageEmbed()
                .setColor("#071b47")
                .setTitle("Erreur APIKey Invalid")
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter("Bot développé par BloumeGen");

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
          .setColor("#071b47")
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
                .setColor("#071b47")
                .setTitle("Utilisation Interdit")
                .setDescription("Puisque tu n'es pas l'utilisateur qui possède ce Plan Obsidienne/API, tu ne peux pas utiliser cette commande.")
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter("Bot développé par BloumeGen");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }
        try {
            let boostCounts = 0;
            let boostCountsFailed = 0;
        
            // Fonction pour créer la barre de progression
            function createProgressBar(current, total, barLength = 20) {
                const progress = Math.round((current / total) * barLength);
                const emptyProgress = barLength - progress;
        
                const progressText = '▬'.repeat(progress); // Progrès effectué
                const emptyText = '░'.repeat(emptyProgress); // Progrès restant
                const percentage = Math.round((current / total) * 100); // Calcul du pourcentage
        
                return `[${progressText}${emptyText}] ${percentage}%`; // Retourne la barre de progression et le pourcentage
            }
        
            const totalBoosts = nombre; // Le nombre total de boosts définis
        
            // Envoi d'un premier message avec la barre de progression à 0
            const initialEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('🚀 **Boost en Cours** 🚀')
                .setDescription(`🔹 Boosts réussis : **0/${totalBoosts}**\n🔸 Boosts échoués : **0/${totalBoosts}**\n\n**Progression :**\n${createProgressBar(0, totalBoosts)}`)
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
                .setTimestamp();
        
            const progressMessage = await interaction.editReply({ embeds: [initialEmbed] });
        
            for (let i = 0; i < totalBoosts / 2; i++) { // Itération pour chaque boost
                try {
                    const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${guildid}&bio=${bio}&your_stock=${your}`, {}, {
                        timeout: 1000000 // Timeout pour la requête
                    });
        
                    // Vérification des erreurs renvoyées par l'API
                    if (response.data.erreur === 'APIKey invalide') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Erreur APIKey Invalid")
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");
        
                        return interaction.editReply({ embeds: [embed] });
                    }

                    if(response.data.erreur === 'only API'){
                        const row = new MessageActionRow()
                            .addComponents(
                              new MessageButton()
                                .setLabel('Voir le site')
                                .setURL(`https://panel.infinityboost.monster/`)
                                .setStyle('LINK')
                            );
                      let non = new MessageEmbed()
                      .setColor("#071b47")
                      .setTitle("Erreur only API")
                      .setDescription("Votre APIKey ne peut utiliser que votre stock et non celui de InfinityBoost !")
                      .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                      .setTimestamp()
                      .setFooter("Bot developpé par BloumeGen")
          
                      return interaction.editReply({ embeds: [non], components: [row] })
                      }

                    if (response.data.erreur === 'hors stock') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Hors Stock")
                            .setDescription(`InfinityBoost n\'a plus de stock. Merci de patienter !`)
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");
        
                        return interaction.editReply({ embeds: [embed] });
                    }
        
                    if (response.data.erreur === 'limite boost') {
                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setLabel('Add bot')
                                    .setURL(`https://panel.infinityboost.monster/profile`)
                                    .setStyle('LINK')
                            );
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Limite de boost depassée")
                            .setDescription(`Vous devez attendre ~1 jours pour refaire des boosts | Temps Recharge\n\n 🔹 Boosts réussis : **0/${totalBoosts}**\n🔸 Boosts échoués : **0/${totalBoosts}**\n\n**Progression :**\n${createProgressBar(0, totalBoosts)}`)
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");
        
                        return interaction.editReply({ embeds: [embed], components: [row] });
                    }
        
                    if (response.data.erreur === 'bot') {
                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setLabel('Add bot')
                                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clientbot}&permissions=1099512155265&scope=bot&guild_id=${guildid}`)
                                    .setStyle('LINK')
                            );
                        
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Invitée le bot")
                            .setDescription(`Le bot n'est pas dans le serveur que vous voulez booster, donc il faut l'inviter !\n\n 🔹 Boosts réussis : **0/${totalBoosts}**\n🔸 Boosts échoués : **0/${totalBoosts}**\n\n**Progression :**\n${createProgressBar(0, totalBoosts)}`)
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");
        
                        return interaction.editReply({ embeds: [embed], components: [row] });
                    }
        
                    // Gestion des boosts réussis
                    if (response.data.erreur === 'Success') {
                        boostCounts++; // Incrémenter si succès
                    } else if (response.data.erreur === 'Erreur boost') {
                        boostCountsFailed++; // Incrémenter si échec
                    }
        
                    // Mise à jour du message avec la progression des boosts
                    const updateEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('🚀 **Boost en Cours** 🚀')
                        .setDescription(`🔹 Boosts réussis : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts échoués : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**Progression :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
                        .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
                        .setTimestamp();
        
                    // Mise à jour du message avec l'embed mis à jour
                    await progressMessage.edit({ embeds: [updateEmbed] });
        
                } catch (error) {
                    boostCountsFailed++; // Compter comme échec en cas d'erreur
                    console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster", error);
                }
            }
        
            // Message final une fois les boosts terminés
            const finalEmbed = new MessageEmbed()
                .setColor(0x000FF)
                .setTitle('Boost terminé')
                .setDescription(`🔹 Boosts réussis : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts échoués : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**Progression :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp();
        
            await interaction.editReply({ embeds: [finalEmbed] });
        
        } catch (error) {
            console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster", error);
            const embed = new MessageEmbed()
                .setColor("#071b47")
                .setTitle("Erreur API")
                .setDescription(`Contactez InfinityBoost !`)
                .setTimestamp()
                .setFooter("Bot développé par BloumeGen");
        
            return interaction.editReply({ embeds: [embed] });
        }
        
        
        }
    }
};
