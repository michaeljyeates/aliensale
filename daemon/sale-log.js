#!/usr/bin/env node

process.title = 'sale-log';

const fetch = require('node-fetch');
const fs = require('fs');

const config = require(`../config.${process.env.CONFIG}`);

const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    trustProxy: true,
    logger: true,
    serverTimeout: 5000
});
fastify.register(require('fastify-cors'), {
    allowedHeaders: 'Content-Type',
    origin: '*'
});

fastify.post('/sale', async (request, reply) => {
    const req = JSON.parse(request.body);
    fs.writeFileSync(`receipts/${req.txId}.txt`, req.country);
    return { success: true };
});

(async () => {
    try {
        await fastify.listen(config.sale_server_port, config.sale_server_host)
    } catch (err) {
        fastify.log.error(err);
        process.exit(1)
    }
})();
