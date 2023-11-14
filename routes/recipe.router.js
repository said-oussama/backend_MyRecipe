import { Router } from 'express';
import { checkToken } from '../middlewares/auth.js';


import {
    createRecipe,
    delRecipe,
    editRecipe,
    getRecipeById,
    getRecipes,
    updateRecipePhoto,
} from '../controllers/recipe.controller.js';

import uploader from '../middlewares/uploader.js';

const router = Router();

router.route('/').post(checkToken,createRecipe).get(getRecipes);

router
    .route('/:id')
    .patch(uploader(), updateRecipePhoto)
    .get(getRecipeById)
    .put(editRecipe)
    .delete(delRecipe);

export default router;
