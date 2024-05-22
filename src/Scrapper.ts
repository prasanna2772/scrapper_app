import puppeteer, { Page } from 'puppeteer';
import { User } from './User';

export class Scraper {
  private page!: Page;

  constructor(private user: User) {}

  async init() {
    const browser = await puppeteer.launch(
        { 
            headless: true
        });
    this.page = await browser.newPage();
  }

  async login() {
    try {
      let webPageUrl = process?.env?.WEBPAGEURL || "";
      await this.page.goto(webPageUrl);
      
      await this.page.type('input#ap_email', this.user.username);
      await this.page.click('input#continue');
      await Promise.race([
        this.page.waitForSelector('input#ap_password', { visible: true }),
        this.page.waitForSelector('#auth-error-message-box', { visible: true })
      ]);
  
      // Check if there's an error message after entering the username
      const usernameError = await this.page.$('#auth-error-message-box');
      if (usernameError) {
        console.error("Error: Invalid email address or phone number.");
        return false;
      }
  
      // Type the password into the password input field
      await this.page.type('input#ap_password', this.user.password);
      
      // Click the sign-in button
      await this.page.click('input#signInSubmit');
      
      // Wait for navigation or an error message
      await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
        this.page.waitForSelector('#auth-error-message-box', { visible: true })
      ]);
  
      // Check if there's an error message after entering the password
      const passwordError = await this.page.$('#auth-error-message-box');
      if (passwordError) {
        console.error("Error: Incorrect password.");
        return false;
      }
  
      // Inform the user to complete any additional authentication steps in the browser
      // As of now there in no MFA and i made the puppeter headless
      console.log("Please complete any additional authentication steps in the browser.");
      console.log("Login successful or additional steps completed.");
      return true;
    } catch (error) {
      console.error("Error during login process:", error);
      return false;
    }
  }
  
  

  async getLastTenOrders() {
    let orderPageUrl:string = process.env.orderUrl || "";
    await this.page.goto(orderPageUrl);
    
    const orders = await this.page.$$eval('div.a-box-group.a-spacing-base.order', (orders) => {
      return orders.slice(0, 10).map(order => {
        const titleElement:any = order.querySelector('div.a-row > a.a-link-normal');
        const dateElement:any = order.querySelector('div.a-row span.a-color-secondary.value');
        return {
          title: titleElement ? titleElement.textContent.trim() : 'No title',
          date: dateElement ? dateElement.textContent.trim() : 'No date'
        };
      });
    });

    return orders;
  }

  async close() {
    await this.page.browser().close();
  }
}
