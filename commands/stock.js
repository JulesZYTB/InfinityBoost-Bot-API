const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config-bot.json");
const axios = require('axios');
const fs = require("fs");
const path = require("path");
let apikey = config.apikey;
//Code by JulesZ .
module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("Stock du site Panel.InfinityBoost.monster ou du bot")
        .addIntegerOption(optionr => 
            optionr.setName("type")
                .setDescription("Type de stock que vous voulais voir")
                .setRequired(true)
                .addChoice(`Site Web`, 1)
                .addChoice(`Site web YOU`, 2)
        ) ,
    async execute(interaction, bot) {
        await interaction.deferReply();
        try {
            const type = interaction.options.getInteger("type");
            if(type === 1) {
            const response = await axios.get(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&nombre=ALL&mode=STOCK`);
            if(response.data.erreur === 'APIKey invalide'){
              const row = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setLabel('Voir le site')
                      .setURL(`https://panel.infinityboost.monster/`)
                      .setStyle('LINK')
                  );
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle("Erreur APIKey Invalid")
            .setDescription("Votre APIKey est invalide acheter un plan ou génère une nouvelle API Key!")
            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
            .setTimestamp()
            .setFooter("Bot développé par JulesZ")

            return interaction.editReply({ embeds: [non], components: [row] })
            } else if(response.data.erreur === 'only API'){
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
              .setFooter("Bot développé par JulesZ")
  
              return interaction.editReply({ embeds: [non], components: [row] })
              } else {
            const stocks = response.data.stock;
            const message = response.data.message;
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(`${message}`)
            .setDescription("Stock du site pour des boosts")
            .addField(` Boost 1 Mois`, ` **${stocks}  boost**`)
            .addField(` T0k3n N1tr0 1 Mois`, ` **${stocks / 2}  T0k3n**`)
            .addField(` Boost 3 Mois`, ` **SOON boost**`)
            .addField(` T0k3n N1tr0 3 Mois`, ` **SOON T0k3n**`)
            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
            .setTimestamp()
            .setFooter("Bot développé par JulesZ")

            return interaction.editReply({ embeds: [non] })
        }
     } else if(type === 2) {
      const response = await axios.get(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&nombre=ALL&mode=STOCK&your_stock=yes`);
      //console.log(response);
      if(response.data.erreur === 'APIKey invalide'){
        const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Voir le site')
                .setURL(`https://panel.infinityboost.monster/`)
                .setStyle('LINK')
            );
      let non = new MessageEmbed()
      .setColor("#071b47")
      .setTitle("Erreur APIKey Invalid")
      .setDescription("Votre APIKey est invalide acheter un plan ou génère une nouvelle API Key!")
      .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
      .setTimestamp()
      .setFooter("Bot développé par JulesZ")

      return interaction.editReply({ embeds: [non], components: [row] })
      } else if(response.data.erreur === 'only API'){
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
      .setFooter("Bot développé par JulesZ")

      return interaction.editReply({ embeds: [non], components: [row] })
      } else {
      const stocks = response.data.stock;
      const message = response.data.message;
      let non = new MessageEmbed()
      .setColor("#071b47")
      .setTitle(`${message}`)
      .setDescription("Stock du site pour des boosts avec L'API")
      .addField(` Boost 1 Mois`, ` **${stocks}  boost**`)
      .addField(` T0k3n N1tr0 1 Mois`, ` **${stocks / 2}  T0k3n**`)
      .addField(` Boost 3 Mois`, ` **SOON boost**`)
      .addField(` T0k3n N1tr0 3 Mois`, ` **SOON T0k3n**`)
      .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
      .setTimestamp()
      .setFooter("Bot développé par JulesZ")

      return interaction.editReply({ embeds: [non] })
      }
  }

        } catch (error) {
            console.error('Erreur lors de la récupération des stocks :', error);
        }
        
        
    }
};
