const config = require('./config.json');
const axios = require('axios');

const get_dapp_state = async (postgresPool) => {
    let postgresClient = null;

    try{

        postgresClient = await postgresPool.connect();

        for (const api of config.endpoints.chain) {

            try {
                const res = await axios.post(`${api}/v1/chain/get_table_rows`, {
                    table: "global",
                    scope: config.contracts.dapp,
                    code: config.contracts.dapp,
                    limit: 1,
                    json: true,
                });

                if (res.data.rows && res.data.rows.length > 0) {
                    const supply = parseFloat(res.data.rows[0].liquified_swax);
                    console.log(`lswax supply: ${supply}`);

                    const updateQuery = `
                        UPDATE fusion_stats 
                        SET lswax_supply = $1
                        WHERE id = $2
                    `;

                    const updateValues = [supply, 0];
                    await postgresClient.query(updateQuery, updateValues);

                    console.log(`Updated lswax supply`);                    

                    break;
                }
            } catch (e) {
                console.log(`error fetching global state: ${e}`);
            }
        }
    
    } catch (e) {
        console.log(`error executing get_wax_price: ${e}`);
    } finally {
        if (postgresClient) {
            postgresClient.release();
        }
    }    
}

module.exports = {
    get_dapp_state
}