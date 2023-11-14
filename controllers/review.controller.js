import {
    create,
    getAll,
    getById,
    deleteById,
    editById,
} from '../services/review.service.js';


export async function createReview(req, res) {
    const { name, review } = req.body;

    const reviewData = await create(
        name,
        review,
    );

    if (!reviewData) {
        return res.status(400).json({ error: 'Could not add review!' });
    }

    return res
        .status(201)
        .json({ message: 'Created Review!', id: reviewData._id });
}

export async function getReviews(req, res) {
    return res.send(await getAll());
}

export async function getReviewById(req, res) {
    const found1 = await getById(req.params.id);

    if (!found1) {
        return res.status(404).json({ error: 'Review not found!' });
    }

    return res.send(found1);
}

export async function editReview(req, res) {
    const { name, review } = req.body;

    const updatedReview = await editById(
        req.params.id,
        name,
        review,
    );
    if (!updatedReview.modifiedCount) {
        return res.status(404).json({ error: 'Review not updated!' });
    }
    return res.send({ message: 'Success.' });
}

/**
 *
 * @param {any} req
 * @param {any} res
 * @param {Number} statusCode
 */

export async function delReview(req, res) {
    const review = await getById(req.params.id);

    if (!review) {
        return res.status(404).json({ error: 'Not found!' });
    }

    const deletedData = await deleteById(req.params.id);

    if (!deletedData.deletedCount) {
        return res.status(404).json({ error: 'Not found!' });
    }

    return res.json({ message: 'Review deleted.' });
}

