# WiseTogether

WiseTogether is a front-end web application that helps couples manage their finances by tracking shared expenses. Built with TypeScript, React, and Tailwind CSS, it provides a user-friendly interface to track, split, and manage expenses together.

## Features

- **Dashboard**: Displays a breakdown of expenses by **type** (personal vs shared), as well as a breakdown by **category** (e.g., groceries, rent, utilities, etc.).
- **Expense Tracking**: Users can add and track personal and shared expenses, categorizing them by type (e.g., groceries, rent, utilities, etc.).
- **Expense Splitting**: Easily split expenses between users, ensuring fair distribution based on customizable criteria (e.g., 50/50, percentages, etc.).
- **User Authentication**: Secure login and user management with **Supabase** for authentication.

## Tech Stack

- **TypeScript**: A typed superset of JavaScript, providing type safety and better tooling for React components.
- **React**: A popular JavaScript library for building user interfaces, used to create interactive and reusable UI components.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development and customization.
- **Supabase**: Used for user authentication and backend services, ensuring secure login and account management.
- **React Router**: For managing navigation and routing within the app.

## Installation

To get started with the project locally, follow these steps:

### Install Dependencies

```bash 
npm install
```

### Environment Variables

Before running the app locally, create a .env file in the root of your project and add the following:

```
VITE_API_BASE_URL=backend_api_url
VITE_APP_BASE_URL=frontend_app_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Development Server

To start the app locally, run the following command:

```bash 
npm run dev
```

## Contributing

We welcome contributions to the WiseTogether project! If you’d like to help out, please follow these steps:

1. Fork the repository.
2. Create a new branch `git checkout -b feature-name`.
3. Make your changes and commit them `git commit -am 'Add feature'`.
4. Push to your branch `git push origin feature-name`.
5. Open a pull request.


## License

WiseTogether is open-source and available under the MIT License.
