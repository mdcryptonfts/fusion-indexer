const config = require('./config.json');
const axios = require('axios');
const { get_account_tvl } = require('./eos');

async function wax() {
  const accounts = ["dapp.fusion", "pol.fusion", "cpu1.fusion", "cpu2.fusion", "cpu3.fusion"];
  const tokens = [
      ["eosio.token", "WAX", "wax"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

const get_llama_tvl = async (postgresPool) => {
    let postgresClient = null;

    try{

        postgresClient = await postgresPool.connect();

        try {

            const tvl = await wax();          

            if(tvl?.wax){

                console.log(`tvl: ${tvl.wax}`)  

                const updateQuery = `
                    UPDATE fusion_stats 
                    SET tvl_wax = $1
                    WHERE id = $2
                `;

                const updateValues = [Math.round(tvl.wax), 0];
                await postgresClient.query(updateQuery, updateValues);

                console.log(`Updated tvl`);

            }         

        } catch (e) {
            console.log(`error updating tvl: ${e}`);
        }



    
    } catch (e) {
        console.log(`error executing tvl update: ${e}`);
    } finally {
        if (postgresClient) {
            postgresClient.release();
        }
    }   
}

module.exports = {
    get_llama_tvl
}