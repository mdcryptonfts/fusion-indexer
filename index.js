const { Pool } = require('pg');
const config = require('./config.json');
const { get_llama_tvl } = require('./get_llama_tvl')
const { get_holder_count } = require('./get_holder_count')
const { get_wax_price } = require('./get_wax_price')
const { get_dapp_state } = require('./get_dapp_state')

const postgresPool = new Pool({
    user: config.postgres.user,
    host: config.postgres.host,  
    database: config.postgres.database, 
    password: config.postgres.password, 
    port: config.postgres.port,      
    max: config.postgres.max,      
});


const runApp = async () => {

    console.log("Fusion Indexer is running")

    /**
     * @get_dapp_state
     * 
     * Fetches the global state from `dapp.fusion` contract
     * 
     * Updates stats table with lswax_supply
     * 
     * TODO: Use Thalos to track table deltas and store entire
     * state in its own table
     */

    setInterval(() => get_dapp_state(postgresPool), 60 * 5 * 1000);   // every 5 minutes

    /**
     * @get_llama_tvl
     * 
     * Fetches the current WaxFusion TVL (in USD) from DefiLlama
     * 
     * Updates postgres with the TVL, and a trigger function executes
     * to also update the WAX TVL based on current WAX price
     */

    setInterval(() => get_llama_tvl(postgresPool), 60 * 1000);   // every minute

    /**
     * @get_holder_count
     * 
     * Fetches the count of lsWAX token holders
     * 
     * Updates postgres with the new count
     */

    setInterval(() => get_holder_count(postgresPool), 60 * 5 * 1000);   // every 5 minutes

    /**
     * @get_wax_price
     * 
     * Fetches the current WAX price (in USD) from coingecko
     * 
     * Updates postgres with the new price
     */

    setInterval(() => get_wax_price(postgresPool), 60 * 1000);   // every minute

                  
    process.on('SIGINT', () => {
        process.exit();
    }); 
    
};

runApp();