# Star Notary Service (Blockchain Backed)
Star Notary service allows users to claim ownership of their favorite star in the night sky.  
Star Notary Service is provided to make sure:
1. Proof of existence
2. Proof of ownership
3. Security of assets

<img src="./public/images/star.jpg" alt="Drawing" style="width: 800px;"/>


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.  
Following technologies are used in this project:
1. Node.js
1. Express framework for web services
2. `express-generator`, to quickly create an application skeleton.
3. LevelDB to persist blocks
4. crypto-js library to encrypt blocks
5. `bitcoinjs-message` to validate signature

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].
- Test your node installation by typing below command in terminal
```
node --version
```
It should return node version e.g. `v8.9.4`

### Running Blockchain web service
- Installing project dependencies
```
npm install
```
- Start the application and browse it at : http://localhost:8000  
**Note** : `npm start` will invoke `./bin/www` script which contains web service startup script
```
 npm start
```
You should see this message **Welcome to Star Notary Service**


## Application Architecture
Application is structured in 3 layers:
1. Controllers  
Controllers are the entry points of this application. Endpoints are defined in controllers (./routes folder)
2. Services  
Services are actual implementation of -blockchain- concepts e.g. (hashing, validation, integrity etc...)
3. Database  
Level DB is used to persist actual -blockchain- data.

### Modules
Application is divided into 3 different modules.
1. Validation Service  
To validate user's address (blockchain ID)
2. Blockchain Service  
To save stars information in registry
3. Star Service  
Provides convenient methods to lookup stars by (address/hash)

## APIs
Following APIs are implemented. Use any REST client to test below APIs

----

### 1. Request validation
http://localhost:8000/validation/requestValidation  
Allows users to request validation for `Star Registry`.

* **URL**

  /validation/requestValidation

  * **Method:**

    `POST`

  *  **Request Body**

     `{"address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"}`

* **Success Response:**

  * **Code:** 200  
  * **Content:**
```
    {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "requestTimeStamp": "1532296090",
      "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
      "validationWindow": 300
     }
```

* **Error Response:**

  * **Code:** 500  
  * **Content:**
```
    {
      "code":"500",
      "status":"Internal Server Error",
      "message":"Error: Validation window time expired, please restart validation process
    }
```
----

### 2. Validate
http://localhost:8000/validation/validate  
After receiving the response, users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star.

* **URL**

  /validation/validate

  * **Method:**

    `POST`

  *  **Request Body**

```
     {
       "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
       "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
     }
```

* **Success Response:**

  * **Code:** 200  
  * **Content:**
```
    {
      "registerStar": true,
      "status":
      {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "requestTimeStamp": "1532296090",
        "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
        "validationWindow": 193,
        "messageSignature": "valid"
      }
    }
```

* **Error Response:**
  * **Code:** 500  
  * **Content:**
```
    {
      "code": "500",
      "status": "Internal Server Error",
      "message": "Error: Error, Unable to validate signature. You may need to request validation first."
    }
```
----


### 3. Register Star
    http://localhost:8000/block

    Allows users to register their star

  * **URL**

    /block

  * **Method:**

    `POST`

  *  **Request Body**

```
    {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star":
      {
        "dec": "-26° 29'\'' 24.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
      }
    }
```

  * **Success Response:**

    * **Code:** 200
    * **Content:**
```
    {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body":
        {
          "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
          "star":
          {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
          }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }
```

  * **Error Response:**

    * **Code:** 500 Internal Server Error
    * **Content:**
```
    {
        "code": "500",
        "status": "Internal Server Error",
        "message": "Error: Error, Unable to validate signature. You may need to request validation first."
    }
```
----

### 4. Get Star block height
    http://localhost:8000/block/1

Returns Star at particular block height

  * **URL**

    /block/:height

  * **Method:**

    `GET`

  *  **Request Param**  
    height[integer]

  * **Success Response:**

    * **Code:** 200
    * **Content:**
```
    {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body":
        {
          "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
          "star":
          {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
          }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }
```

  * **Error Response:**

    * **Code:** 500 Internal Server Error
    * **Content:**
```
    {
        "code": "500",
        "status": "Internal Server Error",
        "message": "Error: Block not found with height : 33"
    }
```
----

### 5. Get Stars by address
    http://localhost:8000/block/142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ

Returns all stars owned by address [blockchainID]

  * **URL**

    /stars/address/:address

  * **Method:**

    `GET`

  *  **Request Param**  
    address[string]

  * **Success Response:**

    * **Code:** 200
    * **Content:**
```
      [
        {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body":
        {
          "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
          "star":
          {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
          }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
        },
        {
        "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
        "height": 2,
        "body":
        {
          "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
          "star":
          {
            "ra": "17h 22m 13.1s",
            "dec": "-27° 14' 8.2",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
          }
        },
        "time": "1532330848",
        "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
        }
      ]
```

  * **Error Response:**

    * **Code:** 500 Internal Server Error
    * **Content:**
```
    {
        "code": "500",
        "status": "Internal Server Error",
        "message": "{Runtime Error}"
    }
```
----

### 6. Get Star by block hash
    http://localhost:8000/block/a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f

Returns star info by blockHash

  * **URL**

    /stars/hash/:blockHash

  * **Method:**

    `GET`

  *  **Request Param**  
    blockHash[string]

  * **Success Response:**

    * **Code:** 200
    * **Content:**
```
      {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body":
          {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star":
            {
              "ra": "16h 29m 1.0s",
              "dec": "-26° 29' 24.9",
              "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
              "storyDecoded": "Found star using https://www.google.com/sky/"
            }
          },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
      }
```

  * **Error Response:**

    * **Code:** 500 Internal Server Error
    * **Content:**
```
    {
        "code": "500",
        "status": "Internal Server Error",
        "message": "Error: Star not found with hash."
    }
```
