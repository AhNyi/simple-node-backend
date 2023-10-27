# Simple Node Backend

## Description

Simple Node Backend is a repository for a backend API developed using Node.js and Express.js. This API provides CRUD (Create, Read, Update, Delete) operations and uses a MySQL database for data storage. It serves as a foundation for building various applications that require a backend service.

## Technologies Used

- **Node.js:** The runtime environment for running server-side JavaScript code.
- **Express.js:** A web application framework for building robust APIs and web applications.
- **MySQL:** A popular relational database management system.
- **Sequelize:** An Object-Relational Mapping (ORM) tool for Node.js, used for working with databases.

## Key Features

- Create, Read, Update, and Delete (CRUD) operations for managing data.
- Utilizes a MySQL database for data storage.
- A solid foundation for building applications that require a backend service.

## Usage

To use this backend API, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Configure your MySQL database connection in the appropriate configuration files (as described below).
4. Run the following Sequelize commands to set up your database:
   - Create the database: `npx sequelize db:create`
   - Generate and apply migrations: `npx sequelize db:migrate`
   - (Optional) Seed the database with initial data: `npx sequelize db:seed:all`
5. Start the server using `node server.js`.
6. You can now make API requests to perform CRUD operations.


## Installation

To install and run this project locally, you need to have Node.js and MySQL installed. Follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ahnyi/simple-node-backend.git
cd simple-node-backend
