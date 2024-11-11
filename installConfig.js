const fs = require('fs');
const inquirer = require('inquirer');
const gradient = require('gradient-string');
const figlet = require('figlet');

//Code by JulesZ .
const text = 'InfinityBoost Bot API Intallation';
// Fonction pour demander une information et avoir un retour de l'utilisateur
const askQuestion = async (question) => {
  const prompt = inquirer.createPromptModule();  // Créer un module de prompt
  const response = await prompt([
    {
      type: 'input',
      name: 'value',
      message: question.message,
      default: question.default,
    },
  ]);
  return response.value;
};

async function askLanguage() {
  const { LangueShop } = await inquirer.prompt([
      {
          type: 'list',
          name: 'LangueShop',
          message: 'Entrez la langue que vous souhaitez utiliser pour votre bot :',
          choices: ['fr', 'en'],
          default: 'fr'
      }
  ]);
  return LangueShop;
}
// Fonction principale pour installer et configurer
const installConfig = async () => {
  const LangueShop = await askLanguage();
  
  // Demander les paramètres de configuration
  const NameShop = await askQuestion({
    message: 'Entrez le nom de votre shop :',
    default: 'ShopName',
  });

  
  const maintenance = await inquirer.createPromptModule()([
    {
      type: 'confirm',
      name: 'maintenance',
      message: 'Voulez-vous activer le mode maintenance ?',
      default: false,
    },
  ]);

  const apikey = await askQuestion({
    message: 'Entrez votre clé API (InfinityBoostAPI) :',
    default: '',
  });

  const botToken = await askQuestion({
    message: 'Entrez le token de votre bot :',
    default: '',
  });

  const guildId = await askQuestion({
    message: 'Entrez l\'ID de votre serveur Discord (guildid) :',
    default: '',
  });

  const clientId = await askQuestion({
    message: 'Entrez l\'ID de votre bot Discord (clientid) :',
    default: '',
  });

  const bio = await askQuestion({
    message: 'Entrez votre bio pour autobuy :',
    default: '.gg/infinityboost - https://bloumechat.com',
  });

  const apikeySellauth = await askQuestion({
    message: 'Entrez votre clé API Sellauth :',
    default: '',
  });

  const shopIdSellauth = await askQuestion({
    message: 'Entrez l\'ID de votre shop Sellauth :',
    default: '',
  });

  const discordWebhookCommandLog = await askQuestion({
    message: 'Entrez l\'URL du webhook Discord pour les logs de commandes :',
    default: '',
  });

  const discordWebhookConsole = await askQuestion({
    message: 'Entrez l\'URL du webhook Discord pour les logs de la console :',
    default: '',
  });

  const bioVariableCustomField = await askQuestion({
    message: 'Entrez le champ personnalisé bio_variable_Custom_Field :',
    default: '',
  });

  const guildidVariableCustomField = await askQuestion({
    message: 'Entrez le champ personnalisé guildid_variable_Custom_Field :',
    default: '',
  });

  const ordersCommandForPage = await askQuestion({
    message: 'Combien de commandes afficher par page ?',
    default: '100',
  });

  const host = await askQuestion({
    message: 'Entrez l\'hôte pour autobuy (laisser vide si non requis) :',
    default: '',
  });

  const port = await askQuestion({
    message: 'Entrez le port pour autobuy :',
    default: '10000',
  });

  // Création de l'objet de configuration
  const config = {
    maintenance: maintenance.maintenance ? 'true' : 'false',
    apikey,
    bot: {
      token: botToken,
      guildid: guildId,
      clientid: clientId,
    },
    service: {
      name_shop: NameShop,
      langue_shop: LangueShop,
    },
    autobuy: {
      bio,
      apikey_sellauth: apikeySellauth,
      shop_id_sellauth: shopIdSellauth,
      discord_webhook_url_command_log: discordWebhookCommandLog,
      discord_webhook_url_console: discordWebhookConsole,
      bio_variable_Custom_Field: bioVariableCustomField,
      guildid_variable_Custom_Field: guildidVariableCustomField,
      orders_command_for_page: parseInt(ordersCommandForPage, 10),
      host,
      port: parseInt(port, 10),
    },
  };

  // Sauvegarde de la configuration dans un fichier
  fs.writeFileSync('config-bot.json', JSON.stringify(config, null, 2));

  console.log('La configuration a été sauvegardée dans config-bot.json');
};

figlet(text, function(err, asciiArt) {
    console.log(gradient.rainbow(asciiArt));
    console.log(gradient.rainbow("InfinityBoost Bot API par ") +"JulesZ");
    console.log(gradient.rainbow("InfinityBoost Bot API Version ") + "V3.0");
    installConfig();
  });
