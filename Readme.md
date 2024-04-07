# Hooked on Books - Books Management Application

Hooked on Books is a comprehensive books management application based on the microservices architecture. It comprises of the AUTH, BOOKS, and AUTHORS services, each hosted separately and communicating with each other using HTTP calls. This distributed architecture enhances modularity and scalability, allowing for independent development and deployment of each service.

## Books Service

The Books service is a pivotal component of the Hooked on Books application, dedicated to managing books-related data.

### Features

-   **Comprehensive REST API**: Encompasses a comprehensive range of endpoints, facilitating seamless management of books data.

-   **Authentication Middleware**: Includes a custom middleware to authenticate users before accessing books-related routes, enhancing the security and integrity of the books management system.

### Deployed App Link

[Hooked on Books - Books Service](https://hookedonbooks-book.onrender.com)

## Installation

To run the Books service locally, follow these steps:

1.  Clone the Books service repository:

    ```bash
    git clone https://github.com/mohit1301/HookedOnBooks-Book.git
    ```

2.  Install dependencies:

    ```bash
    cd HookedOnBooks-Book
    npm install
    ```

3.  Create a .env file in the root directory and add the following environment variables:

    ```bash
    MONGODB_AUTHOR_URL=<your_mongodb_author_url>
    BOOK_PORT=<desired_port_number>
    JWT_SECRET_KEY=<your_jwt_secret_key>
    JWT_REFRESH_SECRET_KEY=<your_jwt_refresh_secret_key>
    AUTHOR_BASEURL=<your_author_baseurl>
    AUTH_BASEURL=<your_auth_baseurl>
    BOOKS_BASEURL=<your_books_baseurl>
    ```

4.  Start the server:

    ```bash
    npm start
    ```

5.  For development with automatic server restart, you can use:

    ```bash
    npm run devStart
    ```

## Note

Keep the values of `JWT_SECRET_KEY` & `JWT_REFRESH_SECRET_KEY` environment variables same across all the services of the Hooked On Books app, namely **_AUTH, BOOKS, AUTHORS_**. Links to other services -

-   [Authors Service](https://github.com/mohit1301/HookedOnBooks-Author)
-   [Auth Service](https://github.com/mohit1301/HookedOnBooks-Auth)
