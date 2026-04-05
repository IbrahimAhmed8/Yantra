import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all file routes
router.use(authenticate);

router.get('/', FileController.list);
router.post('/', FileController.save);
router.get('/:id', FileController.load);
router.delete('/:id', FileController.remove);

export default router;
