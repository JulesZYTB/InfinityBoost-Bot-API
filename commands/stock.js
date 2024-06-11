const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const config = require("../config-bot.json");
const axios = require('axios');
const fs = require("fs");
const path = require("path");
let apikey = config.apikey;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("Stock du site Panel.InfinityBoost.monster ou du bot")
        .addIntegerOption(optionr => 
            optionr.setName("type")
                .setDescription("Type de stock que vous voulais voir")
                .setRequired(true)
                .addChoice(`Site Web`, 1)
                .addChoice(`Bot`, 2)
        ) ,
    async execute(interaction, bot) {
        await interaction.deferReply({ });
        try {
            const type = interaction.options.getInteger("type");
            if(type === 1) {
            const response = await axios.get(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&nombre=ALL&mode=STOCK`);
            if(response.data.erreur === 'APIKey invalide'){
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle("Erreur APIKey Invalid")
            .setTimestamp()
            .setFooter("Bot developpé par BloumeGen")

            return interaction.editReply({ embeds: [non] })
            } else {
            const stocks = response.data.stock;
            const message = response.data.message;
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(`${message}`)
            .addField('Stock', `${stocks} ♾️`)
            .setTimestamp()
            .setFooter("Bot developpé par BloumeGen")

            return interaction.editReply({ embeds: [non] })
        }
     } else {

        const BoostFichier = '/stock/';

        const cheminCompletBoostFichier = path.join(__dirname, '..', BoostFichier, `1m.txt`);

        const BoostFichier2 = '/stock/'; 

        const cheminCompletBoostFichier2 = path.join(__dirname, '..', BoostFichier2, `3m.txt`);

        function countLines(filePath) {
          try {
            const data = fs.readFileSync(filePath, 'utf-8');
            const lines = data.split('\n');
        
            const nonEmptyLines = lines.filter(line => line.trim() !== '');
        
            return nonEmptyLines.length;
          } catch (error) {
            console.error('Erreur lors de la lecture du fichier :', error);
            return 0;
          }
        }

      
        const boostall = countLines(cheminCompletBoostFichier);
        const boostall2 = countLines(cheminCompletBoostFichier2);

          let booster1 = boostall * 2;
          let booster3 = boostall2 * 2;
          let embed = new MessageEmbed()
          .setColor("#ad0c98")
          .setTitle(`Stock`)
          .setDescription("Stock du bot pour des boosts et des T0k3n N1tr0")
          .addField(` Boost 1 Mois`, ` **${booster1} boost**`)
          .addField(` T0k3n N1tr0 1 Mois`, ` **${boostall} T0k3n**`)
          .addField(` Boost 3 Mois`, ` **${booster3} boost**`)
          .addField(` T0k3n N1tr0 3 Mois`, ` **${boostall2} T0k3n**`)
          .setTimestamp()
          .setFooter(`Bot developpé par BloumeGen`);
          return interaction.editReply({ embeds: [embed] });
     }

        } catch (error) {
            console.error('Erreur lors de la récupération des stocks :', error);
        }
        
        
    }
};
