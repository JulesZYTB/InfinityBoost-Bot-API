const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config-bot.json");
const axios = require('axios');
const fs = require("fs");
const path = require("path");
const langData = JSON.parse(fs.readFileSync('./api-translate/langs.json', 'utf-8'));
const lang = config.service.langue_shop;
const translations = langData[lang];
let name = config.service.name_shop;
let apikey = config.apikey;

//Code by JulesZ .
module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription(translations['command']['1']+name)
        .addIntegerOption(optionr => 
            optionr.setName("type")
                .setDescription(translations['command']['2'])
                .setRequired(true)
                .addChoice(`1 `+translations['command']['3'], 1)
                .addChoice(`3 `+translations['command']['3'], 2)
        ) ,
    async execute(interaction, bot) {
        await interaction.deferReply();
        try {
            const type = interaction.options.getInteger("type");
            if(type === 1) {
            const response = await axios.get(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&your_stock=yes&nombre=ALL&mode=STOCK`);
            if(response.data.erreur === 'APIKey invalide'){
              const row = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setLabel(translations['command']['4'])
                      .setURL(`https://panel.infinityboost.monster/`)
                      .setStyle('LINK')
                  );
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(translations['command']['5'])
            .setDescription(translations['command']['6'])
            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
            .setTimestamp()
            .setFooter(name+" - "+translations['command']['7']+" JulesZ")

            return interaction.editReply({ embeds: [non], components: [row] })
            } else if(response.data.erreur === 'only API'){
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
              } else {
            const stocks = response.data.stock;
            const message = response.data.message;
            let non = new MessageEmbed()
            .setColor("#071b47")
            .setTitle(`${message}`)
            .setDescription("Stock du "+name)
            .addField(` Boost 1 `+translations['command']['3'], ` **${stocks}  boost**`)
            .addField(` T0k3n N1tr0 1 `+translations['command']['3'], ` **${stocks / 2}  T0k3n**`)
            .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
            .setTimestamp()
            .setFooter(name+" - "+translations['command']['7']+" JulesZ")

            return interaction.editReply({ embeds: [non] })
        }
     } else if(type === 2) {
      const response = await axios.get(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&nombre=ALL&mode=STOCK&your_stock=yes`);
      //console.log(response);
      if(response.data.erreur === 'APIKey invalide'){
        const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel(translations['command']['4'])
                .setURL(`https://panel.infinityboost.monster/`)
                .setStyle('LINK')
            );
      let non = new MessageEmbed()
      .setColor("#071b47")
      .setTitle(translations['command']['5'])
      .setDescription(translations['command']['6'])
      .setImage('https://panel.infinityboost.monster/standard%20(3).gif') 
      .setTimestamp()
      .setFooter(name+" - "+translations['command']['7']+" JulesZ")

      return interaction.editReply({ embeds: [non], components: [row] })
      } else if(response.data.erreur === 'only API'){
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
      } else {
      const stocks = response.data.stock;
      const message = response.data.message;
      let non = new MessageEmbed()
      .setColor("#071b47")
      .setTitle(`${message}`)
      .setDescription("Stock de "+name)
      .addField(` Boost 3 `+translations['command']['3'], ` **SOON b00st**`)
      .addField(` T0k3n N1tr0 3 `+translations['command']['3'], ` **SOON T0k3n**`)
      .setImage('https://panel.infinityboost.monster/standard%20(3).gif')
      .setTimestamp()
      .setFooter(name+" - "+translations['command']['7']+" JulesZ")

      return interaction.editReply({ embeds: [non] })
      }
  }

        } catch (error) {
            console.error('Erreur lors de la récupération des stocks :', error);
        }
        
        
    }
};
