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
        const tvl = await wax();

        console.log("new tvl:")
        console.log(tvl)

    } catch (e) {
        console.log(`error getting tvl: ${e}`)
    }

    try{

        postgresClient = await postgresPool.connect();

        try {
            const res = await axios.get(`${config.endpoints.defillama}?_=${new Date().getTime()}`, {
                headers: {
                    'Cache-Control': 'no-store',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }                
            });
      
            if(res?.data){
                console.log(`llama tvl: ${res.data}`);
                const tvl_int = Math.round(res.data);

                const updateQuery = `
                    UPDATE fusion_stats 
                    SET tvl_usd = $1
                    WHERE id = $2
                `;

                const updateValues = [tvl_int, 0];
                await postgresClient.query(updateQuery, updateValues);

                console.log(`Updated llama tvl`);

            }         

        } catch (e) {
            console.log(`error making api call to llama: ${e}`);
        }



    
    } catch (e) {
        console.log(`error executing get_llama_tvl: ${e}`);
    } finally {
        if (postgresClient) {
            postgresClient.release();
        }
    }    
}

module.exports = {
    get_llama_tvl
}