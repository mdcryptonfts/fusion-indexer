const config = require('./config.json');
const axios = require('axios');

const get_holder_count = async (postgresPool) => {
    let postgresClient = null;

    try{

        postgresClient = await postgresPool.connect();

        for (const api of config.endpoints.lightapi) {
            try {

                const res = await axios.get(`${api}/api/holdercount/wax/token.fusion/LSWAX`, {});

                if(res?.data){
                    console.log(`light api res: ${res.data}`)

                    const updateQuery = `
                        UPDATE fusion_stats 
                        SET holder_count = $1
                        WHERE id = $2
                    `;

                    const updateValues = [res.data, 0];
                    await postgresClient.query(updateQuery, updateValues);

                    console.log(`Updated holder count`);

                    break;
                }
                
            } catch (error) {
                console.log(`error making light api call: ${e}`);
            }
        }    
    
    } catch (e) {
        console.log(`error executing get_holder_count: ${e}`);
    } finally {
        if (postgresClient) {
            postgresClient.release();
        }
    }    
}

module.exports = {
    get_holder_count
}