import { Router } from 'express';

import {
    createReview,
    delReview,
    editReview,
    getReviewById,
    getReviews,
} from '../controllers/review.controller.js';


const router = Router();

router.route('/').post(createReview).get(getReviews);

router
    .route('/:id')
    .get(getReviewById)
    .put(editReview)
    .delete(delReview);

export default router;
