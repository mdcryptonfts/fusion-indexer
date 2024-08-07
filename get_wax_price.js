const config = require('./config.json');
const axios = require('axios');

const get_wax_price = async (postgresPool) => {
    let postgresClient = null;

    try{

        postgresClient = await postgresPool.connect();

        try {
            const res = await axios.get(`${config.endpoints.waxprice}`, {});
      
            if(res?.data?.wax?.usd){
                console.log(`wax price: ${res.data.wax.usd}`)

                const updateQuery = `
                    UPDATE fusion_stats 
                    SET wax_price_usd = $1
                    WHERE id = $2
                `;

                const updateValues = [res.data.wax.usd, 0];
                await postgresClient.query(updateQuery, updateValues);

                console.log(`Updated wax price`);            
            }         

        } catch (e) {
            console.log(`error making api call to waxprice: ${e}`);
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
    get_wax_price
}