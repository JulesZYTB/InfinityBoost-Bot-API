const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config-bot.json");
const axios = require('axios');
let apikey = config.apikey;
//Code by JulesZ .
module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leave tout les serveurs du bot !"),
        

        async execute(interaction) {
            await interaction.deferReply();
            const responseuser = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=USER`, {}, {
                timeout: 1000000
            });
          let guildid_nol = interaction.guild.id;
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
                .setDescription("Puisque tu n'es pas l'utilisateur qui possède ce Plan Obsidienne/API, tu ne peux pas utiliser cette commande.")
                .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
                .setTimestamp()
                .setFooter("Bot développé par BloumeGen");

            return interaction.editReply({ embeds: [embed], components: [row] });
        }

            const embed = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(`Reset des serveurs 0/None`)
            .setDescription(`Reset de tout les serveur du bot démarage !`)
            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
            .setTimestamp()
            .setFooter("Bot développé par JulesZ");
            await interaction.editReply({ embeds: [embed] });
                  const { Client, Intents } = require("discord.js");
                  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, , Intents.FLAGS.GUILD_MEMBERS] });
                
                  let maxLogs = 6;
                  let savedLogs =  [];
                  var totalJoined = 0;
                  client.on('ready', async () => {
                    const count = client.guilds.cache.size - 1;
                
                    
                    client.guilds.cache.forEach(async (guild) => {
                        
                        if (guild.id === guildid_nol) return;
                
                        try {
                            await new Promise((resolve) => setTimeout(resolve, 5000)); 
                            await guild.leave();
                
                            totalJoined++;
                
                            let newLog = `[+] Le Bot ${client.user.tag} a quitté le serveur ${guild.name}`;
                
                            
                            if (savedLogs.length >= maxLogs) {
                                
                                savedLogs.pop();
                            }
                                            
                            savedLogs.unshift(newLog);
                
                            const embed = new MessageEmbed()
                                .setColor("#071b47")
                                .setTitle(`Reset des serveurs ${totalJoined}/${count}`)
                                .setDescription(`Reset de tous les serveurs du bot boost !`)
                                .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
                                .setTimestamp()
                                .setFooter("Bot développé par JulesZ");
                
                            
                            if (savedLogs.length > 0) {
                                let logsText = savedLogs.join('\n');
                                embed.addField("Logs", "```\n" + logsText + "\n```", true);
                            }
                
                            await interaction.editReply({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Erreur en quittant le serveur ${guild.name}: ${error}`);
                        }
                    });
                
                    //console.log(`${client.guilds.cache.size}`);
                });
                
                
              
              
                client.login(config.bot.token).catch((error) => {
                  console.log(`${chalk.redBright("[ERROR]")} Invalide token ${gradient.instagram(token)}`);
                  console.log(error);
                });
             

        
    }
   
};