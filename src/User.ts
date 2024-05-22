// src/User.ts

import readline from 'readline';

export class User {
  username!: string;
  password!: string;

  private askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }));
  }

  async promptCredentials() {
    this.username = await this.askQuestion('Enter your username: ');
    this.password = await this.askQuestion('Enter your password: ');
  }
}
