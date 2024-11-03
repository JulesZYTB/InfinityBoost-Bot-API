<p align="center">
  <img src="https://imagedelivery.net/HL_Fwm__tlvUGLZF2p74xw/652f7c55-14b1-4726-dd20-60f539a53c00/public" width="300">
</p>

<p align="center">
  <b>Bienvenue sur InfinityBoost Bot API</b>
</p>

<p align="center">
    <br/><br/>
    <a href="https://discord.gg/bloumegen" target="_blank">
        <img src="https://img.shields.io/discord/1107692347657035819.svg?logo=discord&colorB=7289DA" alt="Discord" />
    </a>
</p>

[![](https://img.shields.io/badge/discord.js-v13.1.0--dev-blue.svg?logo=npm)](https://github.com/discordjs)
[![](https://img.shields.io/badge/paypal-donate-blue.svg)](https://paypal.me/BloumeGen)

InfinityBoost Bot API est un bot Discord de boost open source codé en JavaScript avec [Discord.js](https://discord.js.org) par [JulesZ](https://github.com/JulesZYTB).  
N'hésitez pas à ajouter une étoile ⭐ au référentiel pour promouvoir le projet!


### Mise a jours 
* SOON
* [Discord](https://discord.gg/infinityboost)

### Bot

Offres BloumeGen Bot API:
*   🇫🇷  Seulement accessible par les plan Obsidienne poiur l'api
*   ⚙️ Booster des serveur rapidement avec notre API
+   🛰️ Une interface a coupé le souffle

### Commandes

* /boost (guildid:) (type:) (nombre1:) (nombre2:) (bio: SOON) - Booster via l'api ou avec votre stock soon
* /stock - (type:) Voir le stock du site ou du bot
* /stats - Voir les stats du bot
* /send - (type:) - crée un lien pour send les tokens du stock de votre comptes .
* /leave - Faire quittée le bot boost de tout les serveur qu'il a sauf lui des cmd
  
### Info pour votre stock

* Il vous faudra juste restock les tokens et non les email:pass:token 

## Installation

* Aller dans le fichier `config.json` et mettez le token de votre bot
* Toujours dans le fichier `config.json` dans `apikey`mettez votre apikey pour que le bot work
* apikey_sellauth, shop_id_sellauth : https://dash.sellauth.com/api
* discord_webhook_url : Crée un webhook pour les logs des commandes passer.
* port : Mettre le port de votre pterodactyl si vous êtes sur un pterodactyl.
* Crée un produit simple (non variable) : options de livraison mettre dynamic, puis mettre votre ip ou host + port, mettre comme nom de produit [Nombre de boost par commande] boost 1 mois (Voir exemple).
* <img src="https://media.bloumechat.com/media/CAjrolIq7N.png" alt="exemple" /> <img src="https://media.bloumechat.com/media/CAjrolIq7N.png" alt="exemple" />
* ```
  {
    "maintenance": "SOON",
    "apikey": "InfinityBoostAPI_apikey",
    "bot": {
      "token": "token de votre bot discord",
      "guildid": "guild id ",
      "clientid": "client id du bot"
    },
    "serveur": {
      "adminid": "SOON"
    },
    "autobuy": {    
      "bio": ".gg/infinityboost - https://bloumechat.com",
      "apikey_sellauth": "",
      "shop_id_sellauth": "",
      "discord_webhook_url": "",
      "port": 00000
    }
  } 

* Ensuite allez dans CMD et faite `node index.js`

## Liens

*   [Discord](https://discord.gg/infinityboost)
*   [Youtube](https://www.youtube.com/julesZYTB)
*   [Github](https://github.com/JulesZYTB/)
