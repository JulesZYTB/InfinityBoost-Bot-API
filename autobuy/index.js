const http = require('http');
const url = require('url');
const fs = require('fs');
const path = './commandes.json';
const axios = require('axios');
const config = require("../config-bot.json");
//Code by JulesZ .
let apikey = config.apikey;
let portserveur = config.autobuy.port;
let autobuybio = config.autobuy.bio;
let shopId = config.autobuy.shop_id_sellauth;
let apikey_sellauth = config.autobuy.apikey_sellauth;
let discordWebhookUrl = config.autobuy.discord_webhook_url; // Assure-toi d'ajouter l'URL du webhook dans ton config-bot.json

const sendDiscordNotification = async (message) => {
    try {
        await axios.post(discordWebhookUrl, {
            content: message
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du webhook Discord :', error);
    }
};

const server = http.createServer((req, res) => {
    let body = '';
    
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            // Extraction des paramètres de l'URL
            const parsedUrl = url.parse(req.url, true);
            const queryParams = parsedUrl.query;

            // Extraire les informations nécessaires
            const { status, email, gateway } = queryParams;
            let price = parseInt(queryParams.price, 10);
            let invoice_id = parseInt(queryParams.invoice_id, 10);
            let productId = parseInt(queryParams.product_id, 10);
            let amount = parseInt(queryParams.amount, 10) || 1;
            let serveurID = queryParams['custom_fields[Serveur ID]'];

            const updateResponse = await axios.get(`https://api.sellauth.com/v1/shops/${shopId}/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${apikey_sellauth}`
                }
            });
             let products_name = updateResponse.data.name;
             let match = products_name.match(/\[(\d+)\]/);
             let unitPrice = 0;
             if (match) {
                unitPrice = parseInt(match[1], 10); 
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Nom du produit mal config il y a pas les [].' }));
            }
             // Calcule le prix total en fonction de la quantité
             let totalPrice = unitPrice * amount;
             let bio = autobuybio;             
            // Vérifie si le status est "completed"
            if (status !== 'completed') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Le statut de la commande n\'est pas "completed".' }));
                return;
            }

            // Charger le fichier JSON si déjà existant
            let commandes = [];
            if (fs.existsSync(path)) {
                const data = fs.readFileSync(path);
                commandes = JSON.parse(data);
            }

            // Vérifier si l'invoice_id existe déjà
            const commandeExistante = commandes.find(cmd => cmd.invoice_id === invoice_id);
            if (commandeExistante) {
                console.log(`Boost déjà livré, invoice_id: ${invoice_id}.`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Boost déjà livré, contacter le support.' }));
            }

            // Créer une nouvelle commande
            const nouvelleCommande = {
                invoice_id,
                email,
                amount,
                price,
                gateway,
                serveurID,
                status,
            };

            // Ajouter la commande et sauvegarder dans le fichier JSON
            commandes.push(nouvelleCommande);
            fs.writeFileSync(path, JSON.stringify(commandes, null, 2));

            // Répondre au client
            let boostCounts = 0;
            let boostCountsFailed = 0;
            for (let i = 0; i < totalPrice / 2; i++) {
                try {
                    const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${serveurID}&bio=${bio}&your_stock=yes`, {}, {
                        timeout: 1000000 
                    });
        
                    // Vérification des erreurs renvoyées par l'API
                    if (response.data.erreur === 'APIKey invalide') {
                        console.log(`Erreur APIKey Invalid, invoice_id: ${invoice_id}.`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Erreur APIKey Invalid, contactez-nous.' }));
                    }
                    if (response.data.erreur === 'hors stock') {
                        console.log(`Il n\'y a plus assez de stock, invoice_id: ${invoice_id}.`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Il n\'y a plus assez de stock, contactez-nous.' }));
                    }
                    if (response.data.erreur === 'bot') {
                        console.log(`Le bot n\'est pas dans votre serveur, invoice_id: ${invoice_id}.`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Le bot n\'est pas dans votre serveur, contactez-nous.' }));
                    }
        
                    // Gestion des boosts réussis
                    if (response.data.erreur === 'Success') {
                        boostCounts++; 
                    } else if (response.data.erreur === 'Erreur boost') {
                        boostCountsFailed++;
                    }
                } catch (error) {
                    boostCountsFailed++; // Compter comme échec en cas d'erreur
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Erreur code API, contactez-nous.' }));
                }
            }
            if (boostCounts > 0) {
                await sendDiscordNotification(`Nouvelle commande passée : \nInvoice ID: ${invoice_id}\nEmail: ${email}\nMontant: ${amount}\nBoost unitaire: ${unitPrice}\nTotal: ${totalPrice}\nPrix Total: ${price}\nGateway: ${gateway}`);
                console.log(`Tous les boosts ont été livrés, invoice_id: ${invoice_id}.`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Tous les boosts ont été livrés avec succès !' }));
            } 
        } catch (error) {
            // Réponse en cas d'erreur
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Erreur interne du serveur' }));
        }
    });
});

const PORT = portserveur;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
