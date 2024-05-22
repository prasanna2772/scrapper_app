import { User } from './User.js';
import { Scraper } from './Scrapper.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import * as dotenv from "dotenv";
dotenv.config({ path:path.resolve(__dirname,'../config.txt')});


(async () => {
  const user = new User();
  await user.promptCredentials();
  
  const scraper = new Scraper(user);

  try {
    await scraper.init();
    let loginSuccess : boolean = await scraper.login();

    if(loginSuccess) {
      console.log('Fetching your last 10 orders...');
    const orders = await scraper.getLastTenOrders();
    
    if (orders.length === 0) {
      console.log('No orders found.');
    } else {
      console.log('Last 10 orders:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}: ${order.title} - ${order.date}`);
      });
    }
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await scraper.close();
  }
})();
