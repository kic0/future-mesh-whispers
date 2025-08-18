# Projeto Futuro em Rede

## Project info

**URL**: https://lovable.dev/projects/0076c01a-5f8b-42aa-b171-0268b92b3c41

**Use your preferred IDE**

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
    mysql -u <your_username> -p < survey_db < server/database.sql
    ```
    You will be prompted to enter your MySQL password.

3.  **Configure the connection:** The backend server is configured to connect to the database with the following credentials:
    *   **Host:** `localhost`
    *   **User:** `root`
    *   **Password:** (empty)
    *   **Database:** `survey_db`

    If your MySQL setup uses different credentials, you will need to update the `server/db.js` file.


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

