// This file content gon handles the Request/Response logic and error catching. It calls the FileService for all database interactions.

import { Request, Response } from 'express';
import { FileService } from '../services/file.service';


interface FileParams {
    id: string;
}

export const FileController = {
    list: async (req: Request, res: Response) => {
        try {
            const userId = req.user.id; // Assumes you have auth middleware
            const files = await FileService.listFiles(userId);
            res.json(files);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    save: async (req: Request, res: Response) => {
        try {
            const newFile = await FileService.saveFile({ ...req.body, user_id: req.user.id });
            res.status(201).json(newFile);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    },

    load: async (req: Request<FileParams>, res: Response) => {
        try {
            const file = await FileService.getFileById(req.params.id, req.user.id);
            res.json(file);
        } catch (err: any) {
            res.status(404).json({ error: "File not found" });
        }
    },

    remove: async (req: Request<FileParams>, res: Response) => {
        try {
            await FileService.deleteFile(req.params.id, req.user.id);
            res.status(204).send();
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
};
