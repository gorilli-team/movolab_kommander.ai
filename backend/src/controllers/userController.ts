import { Request, Response } from "express";
import User from "../models/userModel";
import { RequestHandler } from "express";

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, token } = req.body;

  try {
    let user = await User.findOne({ username });

    if (user) {
      if (user.token !== token) {
        user.token = token;
        await user.save();
        res.status(200).json({ message: "Token aggiornato, login effettuato con successo", userId: user._id });
      } else {
        res.status(200).json({ message: "Login effettuato con successo", userId: user._id });
      }
    } else {
      user = new User({ username, token });
      await user.save();
      res.status(200).json({ message: "Utente creato con successo, login effettuato", userId: user._id });
    }
  } catch (error: any) {
    console.error("Errore login:", error);
    res.status(500).json({ message: "Errore interno del server." });
  }
};
