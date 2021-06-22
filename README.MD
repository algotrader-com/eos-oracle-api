# EOS Oracle API

Available under https://eosio.algotrader.com ([Source](https://github.com/algotrader-com/eos-oracle-ui))

This app acts as a simple wrapper around [EOS Oracle Smart Contract](https://github.com/algotrader-com/eos-oracle-contract) and allows to interact with it using REST API.

## API documentation

Live documentation and REST API client (Swagger UI) is available here: https://eosio.algotrader.com/api-docs

## Setup

To run the application, install dependencies first:
```
npm install
```

... then start:
```
npm start
```

By default the server will start listening on HTTP port 3000 (can be reconfigured by PORT env variable).

## Configuration

The application is configurable by environment variables:  
PORT (default: 3000) - HTTP port that the server listens on  
USERS (default: admin:admin) - One or more comma-separated user:password pairs that can be used on secured methods e.g. user1:pass1,user2:pass2  
EOS_ACCOUNT_NAME - EOS account name that the contract is deployed to  
EOS_PRIVATE_KEY - EOS private key (for authentication)  
EOS_RPC_SERVER (default: https://api.testnet.eos.io) - EOS server address  
UI_PATH (default: ./ui/build) - Path to eos-oracle-ui files to be served as static resources  