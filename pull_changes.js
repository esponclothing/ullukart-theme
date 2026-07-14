require('dotenv').config({ path: '../ullukart manager/.env' });
const axios = require('axios');
const fs = require('fs');

const storeUrl = process.env.SHOPIFY_STORE_URL;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyClient = axios.create({
  baseURL: `https://${storeUrl}/admin/api/2024-04`,
  headers: {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json'
  }
});

async function pullThemeChanges() {
  try {
    const { data } = await shopifyClient.get('/themes.json');
    const activeTheme = data.themes.find(t => t.role === 'main');
    
    console.log(`Pulling templates/product.json from Theme: ${activeTheme.name} (ID: ${activeTheme.id})`);

    const assetRes = await shopifyClient.get(`/themes/${activeTheme.id}/assets.json`, {
      params: { asset: { key: 'templates/product.json' } }
    });

    const fileContent = assetRes.data.asset.value;
    fs.writeFileSync('./templates/product.json', fileContent);
    console.log('✅ Successfully pulled and updated templates/product.json locally!');
  } catch (error) {
    console.error('❌ Failed to pull theme changes:', error.response ? error.response.data : error.message);
  }
}

pullThemeChanges();
