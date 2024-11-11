const Discord = require("discord.js");
const { Client, Intents, Collection, MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("./config-bot.json");
const gradient = require('gradient-string');
const figlet = require('figlet');
(async () => {
  //Code by JulesZ .
const text = 'InfinityBoost Bot API';

figlet(text, function(err, asciiArt) {
  console.log(gradient.rainbow(asciiArt));
  console.log(gradient.rainbow("InfinityBoost Bot API par ") +"JulesZ");
  console.log(gradient.rainbow("InfinityBoost Bot API Version ") + "V3.0");
});
await new Promise((resolve) => setTimeout(resolve, 1000));
let guild = config.bot.guildid;
let client = config.bot.clientid;

const commands = [];
const commandFiles1 = fs.readdirSync("commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles1) {
  const command = require(`./commands/${file}`);
  commands.push(command.data);
}

const rest = new REST({ version: "9" }).setToken(config.bot.token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(client, guild), {
      body: commands,
    });
    console.log("clientId:", client);
    console.log("guildId:", guild);
    console.log("Les commands slash sont chargées sur Discord avec succès!");
  } catch (error) {
    console.error(error);
  }
})();
await new Promise((resolve) => setTimeout(resolve, 1000));
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, , Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });
bot.commands = new Collection();

const commandFiles = fs.readdirSync("commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.data.name, command);
    console.log(`✅ La commands ${command.data.name} charger avec sucess`);
 
  
}

require("./autobuy/index");

bot.on("ready", () => {
  
    console.log(`Le bot ${bot.user.tag} pour les slash commands est connecté`);
    var items = ['InfinityBoost API by JulesZ - bloumechat.com', '.gg/InfinityBoost API dev by JulesZ - bloumechat.com', '.gg/InfinityBoost API dev by JulesZ - bloumechat.com']; //Merci de pas edit ca peut vraiment nous aider !

    var stats = ['online'];
 
	  var type = ['PLAYING'];
      
   
    bot.user.setPresence({ activities: [{ name: items[Math.floor(Math.random() * items.length)], type: type[Math.floor(Math.random() * type.length)] }], status: stats[Math.floor(Math.random() * stats.length)] })



    
  });
  
  bot.on("interactionCreate", async (interaction) => {
    let userid = interaction.user.id;
    if(!interaction.isCommand()) return;

    const command = bot.commands.get(interaction.commandName);

    if(!command) return;
    try {
      
    await command.execute(interaction, bot);

        
    } catch (error) {

        console.log(error);
    }

});

bot.login(config.bot.token);
})();