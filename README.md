# Projeto Futuro em Rede

## Project info

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Database Setup

This project now uses a local MySQL database. To set up the database, follow these steps:

1.  **Install MySQL:** If you don't have MySQL installed, you can download it from the official [MySQL website](https://dev.mysql.com/downloads/).

2.  **Create the database:** You can create the database and tables by importing the `server/database.sql` file. You can do this using the MySQL command-line client or a GUI tool like MySQL Workbench.

    Using the command-line client:
    ```sh
    mysql -u <your_username> -p < server/database.sql
    ```
    You will be prompted to enter your MySQL password.

3.  **Configure the connection:** The backend server is configured to connect to the database with the following credentials:
    *   **Host:** `localhost`
    *   **User:** `root`
    *   **Password:** (empty)
    *   **Database:** `survey_db`

    If your MySQL setup uses different credentials, you will need to update the `server/db.js` file.


## Backend Server Setup

To run the backend server, follow these steps:

1.  **Navigate to the server directory:**
    ```sh
    cd server
    ```

2.  **Install server dependencies:**
    ```sh
    npm install
    ```

3.  **Install PM2:** This project uses `pm2` to manage the server process and ensure it restarts automatically.

    The server includes `pm2` as a local dependency, which should be sufficient for most environments. However, if you encounter a `pm2: not found` error when running the start script, you may need to install it globally:
    ```sh
    sudo npm install -g pm2
    ```

4.  **Run the server:**
    *   To start the server in the background using `pm2`:
        ```sh
        npm start
        ```
    *   To run the server in development mode with auto-reloading (using `nodemon`):
        ```sh
        npm run dev
        ```

5.  **Managing the Server Process:**
    Once started with `npm start`, you can manage the server process with the following commands:
    *   `npm stop`: Stops the server process.
    *   `npm restart`: Restarts the server process.


## Admin Panel Setup

This project includes a standalone admin panel for managing survey data. To run the admin panel, follow these steps:

1.  **Navigate to the admin directory:**
    ```sh
    cd admin
    ```

2.  **Install admin dependencies:**
    ```sh
    npm install
    ```

3.  **Configuration:** The admin panel requires two sets of environment variables to be set before running.

    *   **Database Credentials:** The admin server is a separate process and needs access to the database.
        ```sh
        export DB_HOST=localhost
        export DB_USER=root
        export DB_PASSWORD=your_mysql_password
        export DB_NAME=survey_db
        ```

    *   **Admin Panel Credentials:** The admin panel is password-protected using basic authentication.
        ```sh
        export ADMIN_USER=admin
        export ADMIN_PASSWORD=your_secret_password
        ```

4.  **Run the admin server:**
    *   To run the admin server in development mode with auto-reloading (using `nodemon`):
        ```sh
        npm run dev
        ```
    The admin server will run on port `3002` by default.


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js (for the backend)
- Express.js (for the backend)
- MySQL (for the database)

