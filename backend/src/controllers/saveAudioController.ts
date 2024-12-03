import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDirectory = './uploads';
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
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
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
};
  
export const upload = multer({ storage: storage, fileFilter: fileFilter });


export const uploadAudio = (req: Request, res: Response, next: NextFunction) => {
  upload.single('audio')(req, res, (err: any) => {
    if (err) {
      console.error('Error during file upload:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    console.log('File uploaded successfully:', req.file);
    res.status(200).json({
      message: 'Audio file uploaded successfully',
      filename: req.file.filename,
    });
  });
};

  
