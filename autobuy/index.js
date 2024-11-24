const http = require('http');
const url = require('url');
const fs = require('fs');
const path = './commandes.json';
const axios = require('axios');
const config = require("../config-bot.json");
//Code by JulesZ .
let apikey = config.apikey;
let portserveur = config.autobuy.port;
let hostns = config.autobuy.host; 
let autobuybio = config.autobuy.bio;
let shopId = config.autobuy.shop_id_sellauth;
let apikey_sellauth = config.autobuy.apikey_sellauth;
let discordWebhookUrl = config.autobuy.discord_webhook_url_command_log;
let discordWebhookLOG = config.autobuy.discord_webhook_url_console;
let guildid_variable_Custom_Field = config.autobuy.guildid_variable_Custom_Field; 
let bio_variable_Custom_Field = config.autobuy.bio_variable_Custom_Field; 
let orders_command_for_page = config.autobuy.orders_command_for_page; 

const sendDiscordNotification = async (message, WebhookSend) => {
    try {
        await axios.post(WebhookSend, { content: message });
    } catch (error) {
        console.log('Erreur lors de l\'envoi du webhook Discord :', error);
    }
};

const handleResponse = (res, mode, data, statusCode = 200) => {
    if (mode === 'write') {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        res.write(data);
    } else {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
};

const checkIfBotIsAvailable = async (serveurID, retries = 12) => {
    try {
        const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=CHECK_BOT&id=${serveurID}&your_stock=yes`, {}, { timeout: 1000000 });
        const { erreur } = response.data;
        if (erreur === 'bot') {
            return false;  // Le bot n'est pas encore disponible
        } else {
            return true; // Le bot est disponible
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du bot:', error);
        return false; // En cas d'erreur, on suppose que le bot n'est pas disponible
    }
};

const handleBooster = async (queryParams, mode, res) => {
    const { status, email, gateway } = queryParams;
    let price = parseFloat(queryParams.price);
    let invoice_id = parseInt(queryParams.invoice_id, 10);
    let productId = parseInt(queryParams.product_id, 10);
    let amount = parseInt(queryParams.amount, 10) || 1;
    let serveurID = queryParams[`custom_fields[${guildid_variable_Custom_Field}]`];
    let bio = queryParams[`custom_fields[${bio_variable_Custom_Field}]`] || autobuybio;
    console.log(`Commande reçu, invoice_id: ${invoice_id}.`);
    await sendDiscordNotification(`Commande reçu, invoice_id: ${invoice_id}.`, discordWebhookLOG);
    try {
        const updateResponse = await axios.get(`https://api.sellauth.com/v1/shops/${shopId}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${apikey_sellauth}` }
        });
        const products_name = updateResponse.data.name;
        const match = products_name.match(/\[(\d+)\]/);
        const matchtype = products_name.match(/boost (1|3) Mois/);
        if (!match || !matchtype) {
            await sendDiscordNotification(`Nom du produit ou type de boost mal configuré, [] manquants ou autre, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            return handleResponse(res, mode, 'Nom du produit ou type de boost mal configuré, [] manquants ou autre.', 200);
        }
        let typeboost = "";
        const unitPrice = parseInt(match[1], 10);
        const totalPrice = unitPrice * amount;
		const boostDuration = parseInt(matchtype[1], 10); // Récupère la valeur capturée (1 ou 3)
        if (boostDuration === 3) {
            typeboost = "3m";
        } else if (boostDuration === 1) {
            typeboost = "1m";
        }
        
        if (status !== 'completed') {
            return handleResponse(res, mode, 'Le statut de la commande n\'est pas "completed".', 200);
        }

        let commandes = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : [];
        if (commandes.find(cmd => cmd.invoice_id === invoice_id)) {
            await sendDiscordNotification(`Boost déjà livré, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            return handleResponse(res, mode, 'Boost déjà livré, contacter le support.', 200);
        }

        const nouvelleCommande = { invoice_id, email, amount, price, gateway, serveurID, status };
        commandes.push(nouvelleCommande);
        fs.writeFileSync(path, JSON.stringify(commandes, null, 2));

        let boostCounts = 0;
        let boostCountsFailed = 0;
        let boosttttt = totalPrice / 2;

        let botAvailable = false;
        let verifCounts = 0;

        while (!botAvailable) {
            try {
                // Vérification de la limite d'attente
                if (verifCounts >= 12) {
                    const message = `Le bot n'est pas dans votre serveur après 12 vérifications (60 minutes), invoice_id: ${invoice_id}.`;
                    console.log(message);
                    await sendDiscordNotification(message, discordWebhookLOG);
                    return handleResponse(
                        res,
                        mode,
                        'Le bot n\'est pas dans votre serveur. J\'ai attendu 60 minutes, la commande est annulée.',
                        200
                    );
                }

                // Vérifie si le bot est disponible dans le serveur
                botAvailable = await checkIfBotIsAvailable(serveurID);

                if (!botAvailable) {
                    // Si le bot n'est pas disponible, attendre 5 minutes avant la prochaine vérification
                    verifCounts++;
                    const minutesWaited = verifCounts * 5;
                    const retryMessage = `Bot non disponible. Vérification n° ${verifCounts}/12 après ${minutesWaited} minutes, invoice_id: ${invoice_id}.`;
                    console.log(retryMessage);
                    await sendDiscordNotification(retryMessage, discordWebhookLOG);

                    // Attente avant la prochaine tentative (5 minutes)
                    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); 
                }
            } catch (error) {
                console.log(`Erreur lors de la vérification du bot: ${error.message}, invoice_id: ${invoice_id}.`);
                await sendDiscordNotification(`Erreur lors de la vérification du bot, invoice_id: ${invoice_id}.`, discordWebhookLOG);

                // Continuer la boucle pour les autres vérifications
                verifCounts++;
                await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); 
            }
        }

		// Si le bot est disponible ou pas d'erreur, procéder avec les boosts
        for (let i = 0; i < totalPrice / 2; i++) {
            try {
                const response = await axios.post(`https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${serveurID}&bio=${bio}&your_stock=yes&type=${typeboost}`, {}, { timeout: 1000000 });
                const { erreur } = response.data;
                if (['APIKey invalide', 'hors stock'].includes(erreur)) {
                    if(['hors stock'].includes(erreur)) {
                        console.log(`Il n\'y a plus assez de stock, invoice_id: ${invoice_id}.`);
                        console.log(`Il a déjà reçu ${boostCounts * 2} boost, invoice_id: ${invoice_id}.`);
                        await sendDiscordNotification(`Il n\'y a plus assez de stock, invoice_id: ${invoice_id}.`, discordWebhookLOG);
                        await sendDiscordNotification(`Il a déjà reçu ${boostCounts * 2} boost, invoice_id: ${invoice_id}.`, discordWebhookLOG);
                    }
                    return handleResponse(res, mode, `Erreur: ${erreur}.`, 200);
                }
                if (erreur === 'Success') boostCounts++;
                else if (erreur === 'Erreur boost') boostCountsFailed++;
            } catch {
                boostCountsFailed++;
            }
        }
		
        if (boostCounts >= boosttttt) {
            await sendDiscordNotification(`Nouvelle commande passée : \nInvoice ID: ${invoice_id}\nEmail: ${email}\nNombre de Vérification du bot : ${verifCounts}\nNombre Acheter: ${amount}\nNombre de boost a l'unité: ${unitPrice}\nNombre de Boost Total: ${totalPrice}\nPrix Total: ${price}€\nGateway: ${gateway}`, discordWebhookUrl);
            await sendDiscordNotification(`Tous les boosts ont été livrés, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            console.log(`Il a reçu ${boostCounts * 2} boost, invoice_id: ${invoice_id}.`);
            await sendDiscordNotification(`Il a reçu ${boostCounts * 2} boost, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            console.log(`Tous les boosts ont été livrés, invoice_id: ${invoice_id}.`);
            return handleResponse(res, mode, 'Tous les boosts ont été livrés avec succès ou en cours de livraison.', 200);
        } else {
            await sendDiscordNotification(`Nouvelle commande passée : \nInvoice ID: ${invoice_id}\nEmail: ${email}\nNombre de Vérification du bot : ${verifCounts}\nNombre Acheter: ${amount}\nNombre de boost a l'unité: ${unitPrice}\nNombre de Boost Total: ${totalPrice}\nPrix Total: ${price}€\nGateway: ${gateway}`, discordWebhookUrl);
            await sendDiscordNotification(`Tous les boosts non pas été livrés, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            console.log(`Il y a ${boostCountsFailed * 2} boost non livrée, invoice_id: ${invoice_id}.`);
            await sendDiscordNotification(`Il y a ${boostCountsFailed * 2} boost non livrée, invoice_id: ${invoice_id}.`, discordWebhookLOG);
            console.log(`Tous les boosts non pas été livrés, invoice_id: ${invoice_id}.`);
            return handleResponse(res, mode, 'Erreur de livraison le bot n\'a pas les perms ou les conditions son pas respecté.', 200);
        }
        
    } catch (error) {
        console.error(error);
        handleResponse(res, mode, 'Erreur interne du serveur', 500);
    }
};

const handleOrders = (res, queryParams) => {
    if (!fs.existsSync(path)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Aucune commande trouvée</h1>');
        return;
    }

    const commandes = JSON.parse(fs.readFileSync(path));
    const itemsPerPage = orders_command_for_page || 100;
    const currentPage = parseInt(queryParams) || 1; 
    const totalOrders = commandes.length;
    const totalPages = Math.ceil(totalOrders / itemsPerPage); 
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCommandes = commandes.slice(startIndex, endIndex);

    const totalCompletedOrders = commandes.filter(commande => commande.status === 'completed').length;
    const totalBoosts = commandes.reduce((total, commande) => { 
        const amount = parseInt(commande.amount, 10); 
        const boostCount = amount * 14; 
        return total + boostCount; 
    }, 0);    
    const totalEarned = commandes.reduce((total, commande) => {
        const price = parseFloat(commande.price);
        return total + (isNaN(price) ? 0 : price); 
    }, 0);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard des Commandes</title>
            <style>
                body { background-color: #f0f2f5; font-family: Arial, sans-serif; }
                .dashboard { max-width: 1200px; margin: auto; padding: 20px; }
                header { text-align: center; margin-bottom: 20px; }
                header h1 { font-size: 2rem; color: #333; }
                header p { font-size: 1.2rem; color: #555; }
                .logo { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; }
                .logo img { width: 100px; height: auto; margin-right: 10px; }
                .logo h1 { font-size: 2.5rem; color: #3b5998; }
                table { width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
                th, td { padding: 15px; text-align: left; color: #333; }
                th { background-color: #3b5998; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                tr:hover { background-color: #eaf3ff; }
                footer { text-align: center; margin-top: 30px; font-size: 1rem; color: #555; }
                .pagination { text-align: center; margin-top: 20px; }
                .pagination a { margin: 0 5px; text-decoration: none; padding: 8px 15px; background-color: #3b5998; color: white; border-radius: 5px; }
                .pagination a:hover { background-color: #2a437a; }
            </style>
        </head>
        <body>
            <div class="dashboard">
                <div class="logo">
                    <img src="https://media.bloumechat.com/media/PFq3HUI6Es.png" alt="Logo">
                    <h1>InfinityBoost</h1>
                </div>

                <header>
                    <h1>Dashboard des Commandes</h1>
                    <p>Total Gagné : <span id="totalEarned">${totalEarned.toFixed(2)}€</span> | Total Boosts : <span id="totalBoosts">${totalBoosts}</span> | Total Commandes : <span id="totalCompletedOrders">${totalCompletedOrders}</span></p>
                </header>
                
                <!-- Tableau des commandes -->
                <section class="commandes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Email</th>
                                <th>Prix (€)</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Gateway</th>
                                <th>Serveur ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paginatedCommandes.map(cmd => `
                                <tr>
                                    <td>${cmd.invoice_id}</td>
                                    <td>${cmd.email}</td>
                                    <td>${parseFloat(cmd.price).toFixed(2)}€</td>
                                    <td>${cmd.status}</td>
                                    <td>${cmd.amount}</td>
                                    <td>${cmd.gateway}</td>
                                    <td>${cmd.serveurID}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </section>

                <!-- Pagination -->
                <div class="pagination">
                    ${currentPage > 1 ? `<a href="/orders?page=${currentPage - 1}">&laquo; Précédent</a>` : ''}
                    <span>Page ${currentPage} / ${totalPages}</span>
                    ${currentPage < totalPages ? `<a href="/orders?page=${currentPage + 1}">Suivant &raquo;</a>` : ''}
                </div>
                
                <!-- Footer -->
                <footer>
                    <p>&copy; 2024 InfinityBoost. Tous droits réservés.</p>
                </footer>
            </div>
        </body>
        </html>
    `);
};



const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;
    const mode = queryParams.mode || 'json';
    const page = queryParams.page || '1';

    if (parsedUrl.pathname === '/booster') {
        handleBooster(queryParams, mode, res);
    } else if (parsedUrl.pathname === '/orders') {
        handleOrders(res, page);
    } else {
        handleResponse(res, mode, 'Page non trouvée', 404);
    }
});

server.listen(portserveur, () => {
    console.log(`Serveur démarré sur http://${hostns}:${portserveur}`);
});
