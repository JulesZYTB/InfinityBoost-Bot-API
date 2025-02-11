const http = require('http');
const url = require('url');
const axios = require('axios');
const fs = require('fs');
const path = './commandes.json';
const config = require("../config-bot.json");

let apikey = config.apikey;
let portserveur = config.autobuy.port;
let hostns = config.autobuy.host; 
let autobuybio = config.autobuy.bio;
let shopId = config.autobuy.shop_id_sellauth;
let apikey_sellauth = config.autobuy.apikey_sellauth;
let discordWebhookUrl = config.autobuy.discord_webhook_url_command_log;
let discordWebhookLOG = config.autobuy.discord_webhook_url_console;
let orders_command_for_page = config.autobuy.orders_command_for_page;
let guildid_variable_Custom_Field = config.autobuy.guildid_variable_Custom_Field || "User Discord";
let bio_variable_Custom_Field = config.autobuy.bio_variable_Custom_Field || "Bio";

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
        return erreur !== 'bot';
    } catch (error) {
        console.error('Erreur lors de la vérification du bot:', error);
        return false;
    }
};

const handleBooster = async (requestData, mode, res) => {
    try {
        const item = requestData.item;
        if (!item) {
            console.log(`[${new Date().toISOString()}] Données item manquantes`);
            return handleResponse(res, mode, 'Données item manquantes', 400);
        }

        // Extraction des données spécifiques
        const amount = parseInt(item.quantity, 10) || 1;
        const serveurID = item.custom_fields?.[guildid_variable_Custom_Field];
        const bio = item.custom_fields?.[bio_variable_Custom_Field] || autobuybio;
        const products_name = item.product?.name;

        console.log(`[${new Date().toISOString()}] Commande reçue pour le serveur: ${serveurID}`);
        await sendDiscordNotification(`Commande reçu, invoice_id: ${item.invoice_id}, serveur_id: ${serveurID}`, discordWebhookLOG);

        // Vérification des données requises
        if (!serveurID || !products_name) {
            console.log(`[${new Date().toISOString()}] Données manquantes: ${!serveurID ? 'serveurID' : 'products_name'}`);
            return handleResponse(res, mode, 'Données manquantes dans item', 400);
        }

        // Extraction des informations du nom du produit
        const match = products_name.match(/\[(\d+)\]/);
        const matchtype = products_name.match(/boost (1|3) Mois/);

        if (!match || !matchtype) {
            await sendDiscordNotification(`Nom du produit ou type de boost mal configuré, [] manquants ou autre, invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
            return handleResponse(res, mode, 'Nom du produit ou type de boost mal configuré, [] manquants ou autre.', 200);
        }

        const unitPrice = parseInt(match[1], 10);
        const totalPrice = unitPrice * amount;
        const boostDuration = parseInt(matchtype[1], 10);
        const typeboost = boostDuration === 3 ? "3m" : "1m";

        // Vérification des commandes existantes
        let commandes = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : [];
        if (commandes.find(cmd => cmd.invoice_id === item.invoice_id)) {
            await sendDiscordNotification(`Boost déjà livré, invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
            return handleResponse(res, mode, 'Boost déjà livré, contacter le support.', 200);
        }

        // Sauvegarde de la nouvelle commande
        const nouvelleCommande = {
            invoice_id: item.invoice_id,
            email: item.email,
            amount,
            price: item.total_price,
            gateway: requestData.gateway,
            serveurID,
            status: item.status,
            custom_fields: item.custom_fields,
            product_name: products_name
        };
        commandes.push(nouvelleCommande);
        fs.writeFileSync(path, JSON.stringify(commandes, null, 2));

        let boostCounts = 0;
        let boostCountsFailed = 0;
        let boosttttt = totalPrice / 2;
        let botAvailable = false;
        let verifCounts = 0;

        // Vérification de la disponibilité du bot
        while (!botAvailable && verifCounts < 12) {
            try {
                botAvailable = await checkIfBotIsAvailable(serveurID);
                if (!botAvailable) {
                    verifCounts++;
                    const minutesWaited = verifCounts * 5;
                    await sendDiscordNotification(`Bot non disponible. Vérification n° ${verifCounts}/12 après ${minutesWaited} minutes, invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
                    if (verifCounts < 12) {
                        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
                    }
                }
            } catch (error) {
                console.error(`Erreur lors de la vérification du bot: ${error.message}, invoice_id: ${item.invoice_id}.`);
                await sendDiscordNotification(`Erreur lors de la vérification du bot, invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
                verifCounts++;
                if (verifCounts < 12) {
                    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
                }
            }
        }

        if (!botAvailable) {
            return handleResponse(
                res,
                mode,
                'Le bot n\'est pas dans votre serveur. J\'ai attendu 60 minutes, la commande est annulée.',
                200
            );
        }

        // Application des boosts
        for (let i = 0; i < totalPrice / 2; i++) {
            try {
                const response = await axios.post(
                    `https://panel.infinityboost.monster/api/api?APIKey=${apikey}&mode=BOOST&id=${serveurID}&bio=${bio}&your_stock=yes&type=${typeboost}`,
                    {},
                    { timeout: 1000000 }
                );
                const { erreur } = response.data;
                
                if (['APIKey invalide', 'hors stock'].includes(erreur)) {
                    if (erreur === 'hors stock') {
                        const message = `Il n'y a plus assez de stock. ${boostCounts * 2} boosts déjà livrés. Invoice_id: ${item.invoice_id}`;
                        console.log(message);
                        await sendDiscordNotification(message, discordWebhookLOG);
                    }
                    return handleResponse(res, mode, `Erreur: ${erreur}.`, 200);
                }
                
                if (erreur === 'Success') boostCounts++;
                else if (erreur === 'Erreur boost') boostCountsFailed++;
            } catch {
                boostCountsFailed++;
            }
        }

        // Envoi des notifications finales
        const commandeInfo = `Nouvelle commande passée : \nInvoice ID: ${item.invoice_id}\nEmail: ${item.email}\nNombre de Vérification du bot : ${verifCounts}\nNombre Acheter: ${amount}\nNombre de boost a l'unité: ${unitPrice}\nNombre de Boost Total: ${totalPrice}\nPrix Total: ${item.total_price}€\nGateway: ${requestData.gateway}`;
        await sendDiscordNotification(commandeInfo, discordWebhookUrl);

        if (boostCounts >= boosttttt) {
            await sendDiscordNotification(`Tous les boosts ont été livrés (${boostCounts * 2} boosts), invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
            return handleResponse(res, mode, 'Tous les boosts ont été livrés avec succès ou en cours de livraison.', 200);
        } else {
            await sendDiscordNotification(`${boostCountsFailed * 2} boosts non livrés, invoice_id: ${item.invoice_id}.`, discordWebhookLOG);
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

const server = http.createServer(async (req, res) => {
    console.log(`[${new Date().toISOString()}] Nouvelle requête reçue: ${req.method} ${req.url}`);
    
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                console.log(`[${new Date().toISOString()}] Corps de la requête POST reçu:`, body);
                const requestData = JSON.parse(body);
                const mode = 'json';
                
                const parsedUrl = url.parse(req.url, true);
                if (parsedUrl.pathname === '/booster' && !requestData.event) {
                    // Pour les requêtes manuelles, on utilise directement les données reçues
                    console.log(`[${new Date().toISOString()}] Traitement d'une requête /booster manuelle`);
                    await handleBooster(requestData, mode, res);
                } else if (requestData.event === 'INVOICE.ITEM.DELIVER-DYNAMIC') {
                // Pour les webhooks SellAuth
                    console.log(`[${new Date().toISOString()}] Traitement d'une commande INVOICE.ITEM.DELIVER-DYNAMIC`);
                    await handleBooster(requestData, mode, res);
                } else {
                    console.log(`[${new Date().toISOString()}] Event non supporté:`, requestData.event);
                    handleResponse(res, mode, 'Event non supporté', 400);
                }
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Erreur parsing JSON:`, error);
                handleResponse(res, 'json', 'Erreur parsing JSON', 400);
            }
        });
    } else if (req.method === 'GET') {
        try {
            const parsedUrl = url.parse(req.url, true);
            const queryParams = parsedUrl.query;
            const page = queryParams.page || '1';
            console.log(`[${new Date().toISOString()}] Requête GET reçue pour ${parsedUrl.pathname}, params:`, queryParams);

            if (parsedUrl.pathname === '/orders') {
                console.log(`[${new Date().toISOString()}] Traitement d'une requête /orders, page:`, page);
                handleOrders(res, page);
            } else {
                console.log(`[${new Date().toISOString()}] Route non trouvée:`, parsedUrl.pathname);
                handleResponse(res, 'json', 'Route non trouvée', 404);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Erreur lors du traitement de la requête GET:`, error);
            handleResponse(res, 'json', { error: 'Erreur interne du serveur', details: error.message }, 500);
        }
    } else {
        console.log(`[${new Date().toISOString()}] Méthode non supportée:`, req.method);
        handleResponse(res, 'json', 'Méthode non supportée', 405);
    }
});

server.listen(portserveur, () => {
    console.log(`[${new Date().toISOString()}] Serveur démarré sur http://${hostns}:${portserveur}`);
});
