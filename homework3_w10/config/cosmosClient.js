// config/cosmosClient.js
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);

module.exports = { client, database };
