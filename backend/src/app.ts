import express, { Request, Response } from "express";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import { Message } from "./models/Message";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

let db: Db;


function connectToDatabase(): void {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  client.connect()
    .then(() => {
      db = client.db("widgetDB");
      console.log("Database connected successfully!");
    })
    .catch((error) => {
      console.error("Error connecting to the database:", error);
      process.exit(1);
    });
}

app.use(express.json());


app.post("/api/messages", (req: Request, res: Response) => {
  const { content, type, userId, metadata } = req.body;

  const newMessage: Message = {
    content,
    createdAt: new Date(),
    type,
    userId,
  };

  db.collection("messages")
    .insertOne(newMessage)
    .then((result) => {
      return res.status(200).json({
        message: "Message saved successfully",
        id: result.insertedId
      });
    })
    .catch((error) => {
      console.error("Error saving the message:", error);
      res.status(500).json({ error: "Error handling the message" });
    });
});

connectToDatabase();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
