import { MongoClient, Db } from "mongodb";

let db: Db;

export async function connectToDatabase(uri: string): Promise<Db> {
  if (!db) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("widgetDB");
  }
  return db;
}
