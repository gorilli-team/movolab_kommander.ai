import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.error('FFmpeg binary not found. Ensure ffmpeg-static is properly installed.');
}

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
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const uploadedFilePath = path.join(uploadsDirectory, req.file.filename);

    if (path.extname(uploadedFilePath) === '.wav') {
      const outputFilePath = path.join(uploadsDirectory, Date.now() + '.mp3');

      ffmpeg(uploadedFilePath)
        .output(outputFilePath)
        .audioCodec('libmp3lame')
        .on('end', () => {
          fs.unlinkSync(uploadedFilePath);
          res.status(200).json({
            message: 'Audio file uploaded and converted successfully',
            filename: path.basename(outputFilePath),
          });
        })
        .on('error', (err: any) => {
          res.status(500).json({ message: 'Error during file conversion', error: err.message });
        })
        .run();
    } else {
      res.status(200).json({
        message: 'Audio file uploaded successfully',
        filename: req.file.filename,
      });
    }
  });
};
