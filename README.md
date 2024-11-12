
<p align="center">
  <img src="https://imagedelivery.net/HL_Fwm__tlvUGLZF2p74xw/652f7c55-14b1-4726-dd20-60f539a53c00/public" width="300">
</p>

<p align="center">
  <b>Bienvenue sur InfinityBoost Bot API</b>
</p>

<p align="center">
    <br/><br/>
    <a href="https://discord.gg/infinityboost" target="_blank">
        <img src="https://img.shields.io/discord/1295854117779931237.svg?logo=discord&colorB=7289DA" alt="Discord" />
    </a>
</p>

[![](https://img.shields.io/badge/discord.js-v13.1.0--dev-blue.svg?logo=npm)](https://github.com/discordjs)
[![](https://img.shields.io/badge/paypal-donate-blue.svg)](https://paypal.me/BloumeGen)

InfinityBoost Bot API est un bot Discord open source conçu pour le boost de serveurs, codé en JavaScript avec [Discord.js](https://discord.js.org) par [JulesZ](https://github.com/JulesZYTB).  
N'hésitez pas à ajouter une étoile ⭐ au projet pour le soutenir !

### Mises à jour
* À venir
* [Discord](https://discord.gg/infinityboost)

### Fonctionnalités du bot

Ce que propose BloumeGen Bot API :
* 🇫🇷 Accessible uniquement pour les utilisateurs de l'API
* ⚙️ Boostez vos serveurs rapidement avec notre API
* 🛰️ Une interface utilisateur spectaculaire
* 🤖 Pas besoin de solver pour les captcha on sans occupe a votre place

### Commandes

* `/boost (guildid:) (type:) (nombre1:) (nombre2:) (bio:)` - Boost via l'API
* `/stock (type:)` - Affiche le stock disponible dans votre API ( bot )
* `/stats` - Affiche les statistiques du bot
* `/send (type:)` - Génère un lien pour envoyer des tokens depuis le stock de vitre API ( bot )
* `/leave` - Fait quitter le bot de tous les serveurs, sauf le sien pour les commandes

### Gestion du stock

* Vous n'avez besoin que de restocker les tokens, sans avoir à inclure les emails ni les mots de passe sous format `email:pass:token`.

## Installation

1. Dans le fichier `config.json`, renseignez le token de votre bot Discord.
2. Toujours dans `config.json`, ajoutez votre apikey sous `apikey` pour activer le bot.
3. `apikey_sellauth` et `shop_id_sellauth` peuvent être obtenus sur : https://dash.sellauth.com/api.
4. `discord_webhook_url_command_log` : Créez un webhook pour les logs des commandes.
5. `discord_webhook_url_console` : Créez un webhook pour les logs de la console.
6. `host` : Indiquez le nom domaine ou l'ip de votre Pterodactyl si vous l'utilisez.
7. `port` : Indiquez le port de votre Pterodactyl si vous l'utilisez.
8. Pour l'installer plus facilement lancé le fichier `InstallConfig.js`.
9. Créez un produit simple (non variable) sur votre site de vente :
    - Dans les options de livraison, sélectionnez "dynamic".
    - Ajoutez l'URL de votre serveur (IP ou hôte) suivi du port.
    - Nom du produit : `[Nombre de boosts par commande] boost 1/3 mois` (exemple ci-dessous).
  

<p align="center">
  <img src="https://media.bloumechat.com/media/CAjrolIq7N.png" alt="exemple" /> 
  <img src="https://media.bloumechat.com/media/TbhEtnkVWS.png" alt="exemple" />
</p>

Exemple de configuration dans `config.json` :
```json
{

  "maintenance": "false",

  "apikey": "",

  "bot": {

    "token": "",

    "guildid": "",

    "clientid": ""

  },

  "service": {

    "name_shop": "ShopName",

    "langue_shop": "fr"

  },

  "autobuy": {

    "bio": ".gg/infinityboost - https://bloumechat.com",

    "apikey_sellauth": "",

    "shop_id_sellauth": "",

    "discord_webhook_url_command_log": "",

    "discord_webhook_url_console": "",

    "bio_variable_Custom_Field": "",

    "guildid_variable_Custom_Field": "",

    "orders_command_for_page": 100,

    "host": "",

    "port": 10000

  }

}
```

7. Ensuite, dans le terminal, exécutez la commande `node index.js`.

## Liens

* [Discord](https://discord.gg/infinityboost)
* [YouTube](https://www.youtube.com/julesZYTB)
* [GitHub](https://github.com/JulesZYTB/)


