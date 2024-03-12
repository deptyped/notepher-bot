## Usage

1. **Environment Variables Setup**
    
    Create an environment variables file by copying the provided example file:
    ```bash
    # development
    cp .env.example .env.bot.dev

    # production
    cp .env.example .env.bot.prod
    ```

    Open the newly created `.env.bot.dev` and `.env.bot.prod` files and set the `BOT_TOKEN` and `WEB_APP_URL` environment variables.

2. **Launching the Bot**
    
    You can run your bot in both development and production modes.

    **Development Mode:**
    
    Install the required dependencies:
    ```bash
    npm install
    ```
    Start the bot in watch mode (auto-reload when code changes):
    ```bash
    docker compose up
    ```

   **Production Mode:**
    
    Set `WEB_APP_URL` environment variable and the `NODE_ENV` environment variable to "production" in your `.env.bot.prod` file. Also, make sure to update `BOT_WEBHOOK` with the actual URL where your bot will receive updates.
    ```dotenv
    NODE_ENV=production
    BOT_WEBHOOK=<your_webhook_url>
    ```
    
    Start the bot in production mode:
    ```bash
    docker compose -f compose.yml -f compose.prod.yml up
    ```
