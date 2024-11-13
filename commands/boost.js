const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require('axios');
const config = require("../config-bot.json");
const fs = require('fs');
const langData = JSON.parse(fs.readFileSync('./api-translate/langs.json', 'utf-8'));
const lang = config.service.langue_shop;
const translations = langData[lang];
let name = config.service.name_shop;
//Code by JulesZ .
let apikey = config.apikey;
let clientbot = config.bot.clientid;
module.exports = {
    data: new SlashCommandBuilder()
        .setName("boost")
        .setDescription(translations['command']['38'])
        .addStringOption(option => 
            option.setName("guildid")
              .setDescription(translations['command']['39'])
              .setRequired(true)
          )
          .addIntegerOption(option => 
            option.setName("type")
              .setDescription(translations['command']['40'])
              .setRequired(true)
              .addChoice("1 "+translations['command']['3'], 1)
              .addChoice("3 "+translations['command']['3'], 3)
          )
          .addStringOption(option => 
            option.setName("bio")
              .setDescription(translations['command']['41'])
              .setRequired(true)
        )
        .addIntegerOption(option => {
            option.setName("nombre1")
                .setDescription(translations['command']['42'])
                .setRequired(true);

            for (let i = 2; i <= 28; i += 2) {
                option.addChoice(`${i} boosts`, i);
            }

            return option;
        }),

    async execute(interaction) {
        await interaction.deferReply();
        const guildid = interaction.options.getString("guildid").toLowerCase().trim();
        const bio = interaction.options.getString("bio");
        const nombre = interaction.options.getInteger("nombre1");
        const type = interaction.options.getInteger("type");

        if (!guildid) {
            return interaction.editReply(translations['command']['34']);
        }
        if (!nombre) {
            return interaction.editReply(translations['command']['35']);
        }

        if(type === 1) {
        const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=yes&type=1m`, {}, {
            timeout: 1000000
        });
        if (responseuser.data.erreur === 'APIKey invalide') {
            const embed = new MessageEmbed()
                .setColor("#071b47")
                .setTitle(translations['command']['5'])
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter(name+" - "+translations['command']['7']+" JulesZ");

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
          .setColor("#071b47")
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
                .setColor("#071b47")
                .setTitle(translations['command']['27'])
                .setDescription(translations['command']['12'])
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter(name+" - "+translations['command']['7']+" JulesZ");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }
        try {
            let boostCounts = 0;
            let boostCountsFailed = 0;
        
            // Fonction pour créer la barre de `+translations['command']['32']+`
            function createProgressBar(current, total, barLength = 20) {
                const progress = Math.round((current / total) * barLength);
                const emptyProgress = barLength - progress;
        
                const progressText = '▬'.repeat(progress); // Progrès effectué
                const emptyText = '░'.repeat(emptyProgress); // Progrès restant
                const percentage = Math.round((current / total) * 100); // Calcul du pourcentage
        
                return `[${progressText}${emptyText}] ${percentage}%`; // Retourne la barre de `+translations['command']['32']+` et le pourcentage
            }
        
            const totalBoosts = nombre; // Le nombre total de boosts définis
        
            // Envoi d'un premier message avec la barre de `+translations['command']['32']+` à 0
            const initialEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('🚀 **Boost '+translations['command']['23']+'** 🚀')
                .setDescription(`🔹 Boosts `+translations['command']['22']+` : **0/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **0/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar(0, totalBoosts)}`)
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
                .setTimestamp();
        
            const progressMessage = await interaction.editReply({ embeds: [initialEmbed] });
        
            for (let i = 0; i < totalBoosts / 2; i++) { // Itération pour chaque boost
                try {
                    const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${guildid}&bio=${bio}&your_stock=yes&type=1m`, {}, {
                        timeout: 1000000 // Timeout pour la requête
                    });
        
                    // Vérification des erreurs renvoyées par l'API
                    if (response.data.erreur === 'APIKey invalide') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle(translations['command']['5'])
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter(name+" - "+translations['command']['7']+" JulesZ");
        
                        return interaction.editReply({ embeds: [embed] });
                    }

                    if(response.data.erreur === 'only API'){
                        const row = new MessageActionRow()
                            .addComponents(
                              new MessageButton()
                                .setLabel(translations['command']['4'])
                                .setURL(`https://panel.infinityboost.monster/`)
                                .setStyle('LINK')
                            );
                      let non = new MessageEmbed()
                      .setColor("#071b47")
                      .setTitle(translations['command']['9'])
                      .setDescription(translations['command']['8'])
                      .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                      .setTimestamp()
                      .setFooter(name+" - "+translations['command']['7']+" JulesZ")
          
                      return interaction.editReply({ embeds: [non], components: [row] })
                      }

                    if (response.data.erreur === 'hors stock') {
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle(translations['command']['33'])
                            .setDescription(name+translations['command']['13'])
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter(name+" - "+translations['command']['7']+" JulesZ");
        
                        return interaction.editReply({ embeds: [embed] });
                    }
        
                    if (response.data.erreur === 'bot') {
                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setLabel(translations['command']['31'])
                                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clientbot}&permissions=1099512155265&scope=bot&guild_id=${guildid}`)
                                    .setStyle('LINK')
                            );
                        
                        const embed = new MessageEmbed()
                            .setColor("#071b47")
                            .setTitle(translations['command']['29'])
                            .setDescription(translations['command']['29']+`\n\n 🔹 Boosts `+translations['command']['22']+` : **0/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **0/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar(0, totalBoosts)}`)
                            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                            .setTimestamp()
                            .setFooter(name+" - "+translations['command']['7']+" JulesZ");
        
                        return interaction.editReply({ embeds: [embed], components: [row] });
                    }
        
                    // Gestion des boosts `+translations['command']['22']+`
                    if (response.data.erreur === 'Success') {
                        boostCounts++; // Incrémenter si succès
                    } else if (response.data.erreur === 'Erreur boost') {
                        boostCountsFailed++; // Incrémenter si échec
                    }
        
                    // Mise à jour du message avec la `+translations['command']['32']+` des boosts
                    const updateEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('🚀 **Boost '+translations['command']['23']+'** 🚀')
                        .setDescription(`🔹 Boosts `+translations['command']['22']+` : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
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
                .setTitle('Boost '+translations['command']['21'])
                .setDescription(`🔹 Boosts `+translations['command']['22']+` : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp();
        
            await interaction.editReply({ embeds: [finalEmbed] });
        
        } catch (error) {
            console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster", error);
            const embed = new MessageEmbed()
                .setColor("#071b47")
                .setTitle(translations['command']['19'])
                .setDescription(translations['command']['20'])
                .setTimestamp()
                .setFooter(name+" - "+translations['command']['7']+" JulesZ");
        
            return interaction.editReply({ embeds: [embed] });
        }
        
        
        } else {
            const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER&your_stock=yes&type=3m`, {}, {
                timeout: 1000000
            });
            if (responseuser.data.erreur === 'APIKey invalide') {
                const embed = new MessageEmbed()
                    .setColor("#071b47")
                    .setTitle(translations['command']['5'])
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");
    
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
              .setColor("#071b47")
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
                    .setColor("#071b47")
                    .setTitle(translations['command']['27'])
                    .setDescription(translations['command']['12'])
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");
    
                return interaction.editReply({ embeds: [embed], components: [row] });
            }
            try {
                let boostCounts = 0;
                let boostCountsFailed = 0;
            
                // Fonction pour créer la barre de `+translations['command']['32']+`
                function createProgressBar(current, total, barLength = 20) {
                    const progress = Math.round((current / total) * barLength);
                    const emptyProgress = barLength - progress;
            
                    const progressText = '▬'.repeat(progress); // Progrès effectué
                    const emptyText = '░'.repeat(emptyProgress); // Progrès restant
                    const percentage = Math.round((current / total) * 100); // Calcul du pourcentage
            
                    return `[${progressText}${emptyText}] ${percentage}%`; // Retourne la barre de `+translations['command']['32']+` et le pourcentage
                }
            
                const totalBoosts = nombre; // Le nombre total de boosts définis
            
                // Envoi d'un premier message avec la barre de `+translations['command']['32']+` à 0
                const initialEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('🚀 **Boost '+translations['command']['23']+'** 🚀')
                    .setDescription(`🔹 Boosts `+translations['command']['22']+` : **0/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **0/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar(0, totalBoosts)}`)
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
                    .setTimestamp();
            
                const progressMessage = await interaction.editReply({ embeds: [initialEmbed] });
            
                for (let i = 0; i < totalBoosts / 2; i++) { // Itération pour chaque boost
                    try {
                        const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${guildid}&bio=${bio}&your_stock=yes&type=3m`, {}, {
                            timeout: 1000000 // Timeout pour la requête
                        });
            
                        // Vérification des erreurs renvoyées par l'API
                        if (response.data.erreur === 'APIKey invalide') {
                            const embed = new MessageEmbed()
                                .setColor("#071b47")
                                .setTitle(translations['command']['5'])
                                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                                .setTimestamp()
                                .setFooter(name+" - "+translations['command']['7']+" JulesZ");
            
                            return interaction.editReply({ embeds: [embed] });
                        }
    
                        if(response.data.erreur === 'only API'){
                            const row = new MessageActionRow()
                                .addComponents(
                                  new MessageButton()
                                    .setLabel(translations['command']['4'])
                                    .setURL(`https://panel.infinityboost.monster/`)
                                    .setStyle('LINK')
                                );
                          let non = new MessageEmbed()
                          .setColor("#071b47")
                          .setTitle(translations['command']['9'])
                          .setDescription(translations['command']['8'])
                          .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                          .setTimestamp()
                          .setFooter(name+" - "+translations['command']['7']+" JulesZ")
              
                          return interaction.editReply({ embeds: [non], components: [row] })
                          }
    
                        if (response.data.erreur === 'hors stock') {
                            const embed = new MessageEmbed()
                                .setColor("#071b47")
                                .setTitle(translations['command']['33'])
                                .setDescription(name+translations['command']['13'])
                                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                                .setTimestamp()
                                .setFooter(name+" - "+translations['command']['7']+" JulesZ");
            
                            return interaction.editReply({ embeds: [embed] });
                        }
            
                        if (response.data.erreur === 'bot') {
                            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setLabel(translations['command']['31'])
                                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clientbot}&permissions=1099512155265&scope=bot&guild_id=${guildid}`)
                                        .setStyle('LINK')
                                );
                            
                            const embed = new MessageEmbed()
                                .setColor("#071b47")
                                .setTitle(translations['command']['29'])
                                .setDescription(translations['command']['29']+`\n\n 🔹 Boosts `+translations['command']['22']+` : **0/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **0/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar(0, totalBoosts)}`)
                                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                                .setTimestamp()
                                .setFooter(name+" - "+translations['command']['7']+" JulesZ");
            
                            return interaction.editReply({ embeds: [embed], components: [row] });
                        }
            
                        // Gestion des boosts `+translations['command']['22']+`
                        if (response.data.erreur === 'Success') {
                            boostCounts++; // Incrémenter si succès
                        } else if (response.data.erreur === 'Erreur boost') {
                            boostCountsFailed++; // Incrémenter si échec
                        }
            
                        // Mise à jour du message avec la `+translations['command']['32']+` des boosts
                        const updateEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('🚀 **Boost '+translations['command']['23']+'** 🚀')
                            .setDescription(`🔹 Boosts `+translations['command']['22']+` : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
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
                    .setTitle('Boost '+translations['command']['21'])
                    .setDescription(`🔹 Boosts `+translations['command']['22']+` : **${boostCounts * 2}/${totalBoosts}**\n🔸 Boosts `+translations['command']['28']+` : **${boostCountsFailed * 2}/${totalBoosts}**\n\n**`+translations['command']['32']+` :**\n${createProgressBar((boostCounts + boostCountsFailed) * 2, totalBoosts)}`)
                    .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                    .setTimestamp();
            
                await interaction.editReply({ embeds: [finalEmbed] });
            
            } catch (error) {
                console.log("Erreur API contact ADMIN Panel.Infinityboost.Monster", error);
                const embed = new MessageEmbed()
                    .setColor("#071b47")
                    .setTitle(translations['command']['19'])
                    .setDescription(translations['command']['20'])
                    .setTimestamp()
                    .setFooter(name+" - "+translations['command']['7']+" JulesZ");
            
                return interaction.editReply({ embeds: [embed] });
            }
        }
    }
};
