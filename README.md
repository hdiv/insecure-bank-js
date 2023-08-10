# Insecure Bank (node)

## Running the application locally

1.  Clone the repository:

        $ git clone https://github.com/hdiv/insecure-bank-js.git

2.  Run the application using express:

        $ npm install
        $ npm run start

3.  You can then access the bank application here: http://localhost:3000

## Running with Docker

Run the insecure-bank application with Docker.

        $ docker build -t insecure-bank .
        $ docker run -p 3000:3000 -d --name insecure-bank-app insecure-bank
        $ docker logs insecure-bank-app

Open the application in > http://localhost:3000

## Login credentials

-   Username: john
-   Password: test
