import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDirectory = './uploads';
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
    console.log('Received file type:', file.mimetype);
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  };
  
export const upload = multer({ storage: storage, fileFilter: fileFilter });


export const uploadAudio = async (req: Request, res: Response) => {
    upload.single('audio')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({
          error: err instanceof Error ? err.message : 'An unexpected error occurred during file upload',
        });
      }
  
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
      }
  
      console.log('File uploaded:', req.file);
      try {
        res.status(200).json({
          message: 'Audio file uploaded successfully',
          filename: req.file.filename,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        res.status(500).json({ error: errorMessage });
      }
    });
  };
  