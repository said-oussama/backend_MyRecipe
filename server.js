import express from 'express';
import mongoose from "mongoose";
import { errorHandler, notFoundError } from './middlewares/error-handler.js';
import morgan from 'morgan';
import cors from "cors";
import fs from "fs-extra";
//const { readFile } = fs;
//import dotenv from "dotenv";
//import Moralis from "moralis";
//import base58 from "bs58";
//import jwt from "jsonwebtoken";
//import cookieParser from "cookie-parser";
//import { upload } from './middlewares/storage-videos.js';
//import * as RecipeService from '../services/recipe.js';

import userRoutes from './routes/user.js';
import RecipeRouter from './routes/recipe.router.js';
import ReviewRouter from './routes/review.router.js';

// import bookRoutes from './routes/routebook.js';
// import quizRoutes from './routes/routeQuiz.js';
// import chatroute from './routes/chat-route.js';
// import likeRoutes from './routes/like-route.js';
import path from 'path';
import multer from 'multer';
//dotenv.config();

const app=express();
const port=process.env.PORT || 3000;
const databaseName = "oussamaServer";
// cela affichera les requetes mongodb dans le terminal
mongoose.set("debug", true);
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false)
mongoose
  .connect(process.env.MONGO_URL || `mongodb://0.0.0.0:27017/oussamaServer`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    
    
  })
  .then(() => {
    console.log(`Connecté à ${databaseName}`);
  })
  .catch((err) => {
    console.error(`Erreur de connexion à la base de données : ${err}`);
  });




app.use(cors());//Cross Origin Resource Sharing(yaati l'acces localhost:3000).
//The :status token will be colored green for success codes, red for server error codes, yellow for client error codes
app.use(morgan("dev"));//utiliser morgan
app.use(express.json());//pour analyser app/json
app.use(express.urlencoded({ extended: true }));//pour analyser app/x-www-foem-urlencoded
app.use('/user',userRoutes);//préfixe chaque route ici avec /user
// app.use('/book',bookRoutes);
// app.use('/quiz',quizRoutes);
app.use('/user/upload', express.static('upload/images'));
// app.use('/like',likeRoutes);
app.use('/recipe', RecipeRouter);
app.use('/review', ReviewRouter);
app.use(
  '/img',
  express.static('public/images', {
      extensions: ['jpg', 'jpeg', 'png'],
  })
);

// added for chat 
// app.use("/chat",chatroute);

//
//



// Serve uploaded videos
app.use('/videos', express.static('upload/videos'));

// multer Configuration
const storage = multer.diskStorage({
  destination: (req,file, cb) => {
    cb(null, './upload/videos');
  },
  filename:  (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `video_${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage: storage });

// Upload video
app.post("/uploads", upload.single('video'), (req, res) => {
  res.json({
    success: 1,
    videoURL: `/videos/${req.file.filename}`
  });
});
// Get video
app.get('/videos/:filename', (req, res) => {
  const fileName = req.params.filename;
  res.sendFile(path.join(__dirname, `/upload/videos/${fileName}`));
});

//utiliser le middleware gestionnaire d'erreurs
app.use(notFoundError);
app.use(errorHandler);

//////////////////////////////////////////////////////////////////////////////////////////////////////
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.get("/", async (req, res) => {
//   res.send(await readFile("./index.html", "utf8"));
// });

// const init = async () => {
//   await Moralis.start({
//     apiKey: process.env.MORALIS_API_KEY,
//   });
// };
// init();

// app.post("/requestMessage", async (req, res) => {
//   const { address } = req.body;

//   const response = await Moralis.Auth.requestMessage({
//     network: "solana",
//     solNetwork: "devnet",
//     address: address,
//     domain: "localhost",
//     statement: "Sign the message to authenticate",
//     uri: `http://localhost:${port}/`,
//     timeout: 60,
//   }).catch((e) => {
//     res.status(400).json({ e });
//   });

//   res.status(200).json({ data: response });
// });

// app.post("/verifySignature", async (req, res) => {
//   const { signature, message } = req.body;
//   const response = await Moralis.Auth.verify({
//     message,
//     signature: base58.encode(signature.data),
//     network: "solana",
//   }).catch((e) => {
//     res.status(400).json(e);
//   });
//   const token = jwt.sign(response.data, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "10000s",
//   });

//   res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60),
//     })
//     .json({ data: response.data });
// });

// app.get("/verifyAuth", (req, res) => {
//   const token = req.cookies.token;
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.json({ auth: false });
//     res.json({ auth: true });
//   });
// });

// app.delete("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.json({ auth: false });
// });


///////////////////////////////////////////////////////////////////////////////////////////////

// app.listen(8000);
// app.use(express.json());
// //const { readFile } = require("fs").promises;
// require("dotenv").config();
// //const Moralis = require("moralis").default;
// import { Streams } from '@moralisweb3/streams';
// import Moralis from "moralis";
// //import Moralis from 'moralis/node';



// //const base58 = require("bs58");
// //const jwt = require("jsonwebtoken");

// //const cookieParser = require("cookie-parser");
// app.use(cookieParser());

// app.get("/", async (req, res) => {
//   res.send(await readFile("./index.html", "utf8"));
// });

// const init = async () => {
//   await Moralis.start({
//     apiKey: process.env.MORALIS_API_KEY,
//   });
// };
// init();

// app.post("/requestMessage", async (req, res) => {
//   const { address } = req.body;

//   const response = await Moralis.Auth.requestMessage({
//     network: "solana",
//     solNetwork: "devnet",
//     address: address,
//     domain: "localhost",
//     statement: "Sign the message to authenticate",
//     uri: "http://localhost:8000/",
//     timeout: 60,
//   }).catch((e) => {
//     res.status(400).json({ e });
//   });

//   res.status(200).json({ data: response });
// });

// app.post("/verifySignature", async (req, res) => {
//   const { signature, message } = req.body;
//   const response = await Moralis.Auth.verify({
//     message,
//     signature: base58.encode(signature.data),
//     network: "solana",
//   }).catch((e) => {
//     res.status(400).json(e);
//   });
//   const token = jwt.sign(response.data, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "10000s",
//   });

//   res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60),
//     })
//     .json({ data: response.data });
// });

// app.get("/verifyAuth", (req, res) => {
//   const token = req.cookies.token;
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.json({ auth: false });
//     res.json({ auth: true });
//   });
// });

// app.delete("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.json({ auth: false });
// });


//////////////////////////////////////////////////////////////////////////////////////////////////
//import express from "express";
// import { readFile } from "fs/promises";
// import dotenv from "dotenv";
// //import express from "express";
// import Moralis from "moralis";

// import base58 from "bs58";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// //import Parse from 'parse/node';

// import Parse from 'parse';



// Parse.initialize(process.env.MORALIS_APP_ID, process.env.JS_KEY, process.env.MASTER_KEY);
// //Parse.serverURL = process.env.SERVER_URL;

// // Define a TestObject class that inherits from Parse.Object
// class TestObject extends Parse.Object {
//   // We recommend initializing the class with a schema name
//   constructor() {
//     super('TestObject');
//   }
// }

// // Create a new instance of your TestObject class
// const testObject = new TestObject();

// // Save the instance of TestObject to Parse
// testObject.save().then((response) => {
//   console.log('New object created with objectId:', response.id);
// }).catch((error) => {
//   console.error('Error creating new object:', error);
// });

// dotenv.config();

// // const app = express();
// // const port = 8000;

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });

// app.use(express.json());
// app.use(cookieParser());

// app.get("/", async (req, res) => {
//   res.send(await readFile("./index.html", "utf8"));
// });

// const init = async () => {
//   await Moralis.initialize(process.env.MORALIS_APP_ID);
//   Moralis.serverURL = process.env.MORALIS_SERVER_URL;
// };

// init();

// app.post("/requestMessage", async (req, res) => {
//   const { address } = req.body;

//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     address: address,
//     network: "testnet",
//     signMessage: (message) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.sign(message, address));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json({ e });
//   });

//   res.status(200).json({ data: response });
// });

// app.post("/verifySignature", async (req, res) => {
//   const { signature, message } = req.body;
//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     message,
//     signature: base58.encode(signature.data),
//     network: "testnet",
//     verifyMessage: (message, signature) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.verify(message, signature));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json(e);
//   });

//   const token = jwt.sign(response, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "10000s",
//   });

//   res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60),
//     })
//     .json({ data: response });
// });

// app.get("/verifyAuth", (req, res) => {
//   const token = req.cookies.token;

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.json({ auth: false });
//     res.json({ auth: true });
//   });
// });

// app.delete("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.json({ auth: false });
// });


///////////////////////////////////////////////////////////////////////////////////////////
//import express from "express";
// import { readFile } from "fs/promises";
// import dotenv from "dotenv";
// import Moralis from "moralis/dist/moralis.js";
// import base58 from "bs58";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";

// dotenv.config();

// // const app = express();
// // const port = 8000;

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// app.use(express.json());
// app.use(cookieParser());

// app.get("/", async (req, res) => {
//   res.send(await readFile("./index.html", "utf8"));
// });

// const init = async () => {
//   await Moralis.start({
//     serverUrl: process.env.MORALIS_SERVER_URL,
//     appId: process.env.MORALIS_APP_ID,
//   });
// };

// init();

// app.post("/requestMessage", async (req, res) => {
//   const { address } = req.body;

//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     address: address,
//     network: "testnet",
//     signMessage: (message) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.sign(message, address));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json({ e });
//   });

//   res.status(200).json({ data: response });
// });

// app.post("/verifySignature", async (req, res) => {
//   const { signature, message } = req.body;
//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     message,
//     signature: base58.encode(signature.data),
//     network: "testnet",
//     verifyMessage: (message, signature) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.verify(message, signature));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json(e);
//   });

//   const token = jwt.sign(response, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "10000s",
//   });

//   res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60),
//     })
//     .json({ data: response });
// });

// app.get("/verifyAuth", (req, res) => {
//   const token = req.cookies.token;

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.json({ auth: false });
//     res.json({ auth: true });
//   });
// });

// app.delete("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.json({ auth: false });
// });


/////////////////////////////////////////////////////////////////////////////////////////
// import { readFile } from "fs/promises";
// import dotenv from "dotenv";
// import Moralis from "moralis/dist/moralis.js";
// import base58 from "bs58";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import Web3 from "web3";
// const MWeb3 = typeof Web3 === "undefined" ? null : new Web3(window.solana);



// dotenv.config();

// //const express = require('express');
// // const app = express();
// // const port = process.env.PORT || 8000;

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// app.use(express.json());
// app.use(cookieParser());

// app.get("/", async (req, res) => {
//   res.send(await readFile("./index.html", "utf8"));
// });

// const init = async () => {
//   await Moralis.start({
//     serverUrl: process.env.MORALIS_SERVER_URL,
//     appId: process.env.MORALIS_APP_ID,
//   });
// };

// init();

// app.post("/requestMessage", async (req, res) => {
//   const { address } = req.body;

//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     address: address,
//     network: "testnet",
//     signMessage: (message) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.sign(message, address));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json({ error: e });
//   });

//   res.status(200).json({ data: response });
// });

// app.post("/verifySignature", async (req, res) => {
//   const { signature, message } = req.body;
//   const response = await Moralis.Web3.authenticate({
//     provider: "walletconnect",
//     message,
//     signature: base58.encode(signature.data),
//     network: "testnet",
//     verifyMessage: (message, signature) => {
//       return new Promise((resolve, reject) => {
//         resolve(Moralis.Web3.verify(message, signature));
//       });
//     },
//   }).catch((e) => {
//     res.status(400).json({ error: e });
//   });

//   const token = jwt.sign(response, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "10000s",
//   });

//   res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60),
//     })
//     .json({ data: response });
// });

// app.get("/verifyAuth", (req, res) => {
//   const token = req.cookies.token;

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.json({ auth: false });
//     res.json({ auth: true });
//   });
// });

// app.delete("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.json({ auth: false });
// });


////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});






