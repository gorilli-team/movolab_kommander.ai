import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { uploadAudio, upload } from './controllers/saveAudioController';
import { getMessages, createMessage } from './controllers/messageController';



const app = express();

app.use(bodyParser.json());
app.use(cors());


app.post('/upload-audio', upload.single('audio'), uploadAudio);


app.get('/messages', getMessages);


app.post('/new_message', createMessage);

export default app;

