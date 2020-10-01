#!/usr/bin/env node

/*
Generates 500 memo references and sends them to the contract (for eos start at 10k for the id)
 */

const { Api, JsonRpc, Serialize } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require("node-fetch");

const config = require(`../config.${process.env.CONFIG}`);


const rpc = new JsonRpc(config.endpoint, {fetch});
const signatureProvider = new JsSignatureProvider([config.private_key]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });


const submit_addresses = async (addresses) => {
    const actions = [];

    addresses.forEach((ad) => {
        actions.push({
            account: config.contract,
            name: 'addaddress',
            authorization: [{
                actor: config.contract,
                permission: config.populate_permission,
            }],
            data: {
                address_id: ad.id,
                foreign_chain: 'eos',
                address: ad.address
            }
        });
    });

    await api.transact({actions}, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
}


const start = async () => {
    let x = 0;
    let populate_data = [];

    while (x < 500) {
        const address = (Math.random() + 1).toString(36).replace(/[^a-z0-9]+/g, '').substr(1, 10);

        populate_data.push(
            {id: x + 10000, address}
        );

        if ((x % 20) === 0 && x > 0){
            // submit to chain
            try {
                await submit_addresses(populate_data);
            }
            catch (e){
                console.log(`${x} failed ${e.message}`);
            }

            populate_data = [];
        }

        x++;
    }


    if (populate_data.length){
        await submit_addresses(populate_data);
    }

}

start();
