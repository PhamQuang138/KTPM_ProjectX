import {Router} from 'express';
import {uploadController} from '../controllers/upload.controller';
import {requireAuth} from '../middlewares/auth';
import {imageUpload} from '../middlewares/upload';

export const uploadRouter = Router();

uploadRouter.post('/images', requireAuth, imageUpload.single('image'), uploadController.uploadImage);
