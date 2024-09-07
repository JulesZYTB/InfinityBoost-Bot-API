const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require('axios');
const config = require("../config-bot.json");

let apikey = config.apikey;

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
              .addChoice("Stock bot", 2)
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
        })   
        .addStringOption(option => 
            option.setName("bio")
              .setDescription("Bio personnalisée pour les boosts")
              .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const guildid = interaction.options.getString("guildid").toLowerCase().trim();
        const bio = interaction.options.getString("bio").toLowerCase().trim() || "By JulesZ";
        const nombre = interaction.options.getInteger("nombre1") || interaction.options.getInteger("nombre2");
        const type = interaction.options.getInteger("type");

        if (!guildid) {
            return interaction.editReply('Veuillez fournir le guild ID du serveur que vous voulez booster.');
        }
        if (!nombre) {
            return interaction.editReply('Veuillez fournir le nombre de boosts pour votre serveur.');
        }

        if(type === 1 || type === 3) {
        const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER`, {}, {
            timeout: 1000000
        });
        let your = "";
        if (type === 3) {
            your = "yes"; 
        } else {
            your = "no"; 
        }
        if (responseuser.data.user !== interaction.user.username) {
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
                .setDescription("Puisque tu n'es pas l'utilisateur qui possède ce Plan Obsidienne, tu ne peux pas utiliser cette commande.")
                .setTimestamp()
                .setFooter("Bot développé par BloumeGen");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }
        try {
            let boostCounts = 0;
            let boostCountsFailed = 0;

            for (let i = 0; i < nombre / 2; i++) {
                try {
                    const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${guildid}&bio=${bio}&your_stock=${your}`, {}, {
                        timeout: 1000000
                    });
                    //console.log(response);
                    //console.log(your);
                    if (response.data.erreur === 'APIKey invalide') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Erreur APIKey Invalid")
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");

                        return interaction.editReply({ embeds: [embed] });
                    }

                    if (response.data.erreur === 'hors stock') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Hors Stock")
                            .setDescription(`InfinityBoost n\'a plus de stock. Merci de patienter !`)
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
                            .setDescription(`Vous devez attendre ~1 jours pour refaire des boosts | Temps Recharge`)
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");

                        return interaction.editReply({ embeds: [embed], components: [row] });
                    }
                    if (response.data.erreur === 'bot') {
                        const row = new MessageActionRow()
                        .addComponents(
                          new MessageButton()
                            .setLabel('Add bot')
                            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${response.data.clientid}&permissions=1099512155265&scope=bot&guild_id=${guildid}`)
                            .setStyle('LINK')
                        );
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle("Invitée le bot")
                            .setDescription(`Le bot n'est pas dans le serveur que vous voulais booster donc il faut l'invitée !`)
                            .setTimestamp()
                            .setFooter("Bot développé par BloumeGen");

                        return interaction.editReply({ embeds: [embed], components: [row] });
                    }

                    if (response.data.erreur === 'Success') {
                        boostCounts++;
                    } else if (response.data.erreur === 'Erreur boost') {
                        boostCountsFailed++;
                    }

                    
                    function createProgressBar(current, total, barLength = 20) {
                        const progress = Math.round((current / total) * barLength);
                        const emptyProgress = barLength - progress;

                        const progressText = '▬'.repeat(progress); 
                        const emptyText = '▬'.repeat(emptyProgress); 
                        const percentage = Math.round((current / total) * 100);

                        return `[${progressText}${emptyText}] ${percentage}%`; 
                    }

                    
                    const totalBoosts = nombre;
                    const progressBar = createProgressBar(boostCounts, totalBoosts);

                    const update = new MessageEmbed()
                    .setColor('#0099ff') 
                    .setTitle('🚀 **Boost en Cours** 🚀') 
                    .setDescription(`🔹 Boosts réussis : **${boostCounts}/${totalBoosts}**\n🔸 Boosts échoués : **${boostCountsFailed}/${totalBoosts}**\n\n**Progression :**\n${progressBar}`)
                    .setThumbnail('https://panel.infinityboost.monster/standard (3).gif') 
                    

                    await interaction.editReply({ embeds: [update] });
                } catch (error) {
                    console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster", error);
                }
            }

            const final = new MessageEmbed()
                .setColor(0x000FF)
                .setTitle('Boost terminé')
                .setDescription(`Boost avec succès : ${boostCounts}/${nombre / 2}\nBoost échoués : ${boostCountsFailed}/${nombre / 2}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [final] });

        } catch (error) {
            console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster n\ : ", error);
            const embed = new MessageEmbed()
            .setColor("#071b47")
            .setTitle("Erreur API")
            .setDescription(`Contact InfinityBoost !`)
            .setTimestamp()
            .setFooter("Bot développé par BloumeGen");

        return interaction.editReply({ embeds: [embed] });
        }
    } else {
        const soon = new MessageEmbed()
        .setColor("#071b47")
        .setTitle("Boost avec votre stock")
        .setDescription(`Pour le moment cette fonctionnalité n'est pas encore disponible merci de patienter pour une maj !`)
        .setTimestamp()
        .setFooter("Bot développé par BloumeGen");

    return interaction.editReply({ embeds: [soon] });
    }
    }
};
