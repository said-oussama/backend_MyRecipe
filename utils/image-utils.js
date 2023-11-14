import fs from 'fs';

export function deleteImage(filename, callback) {
    fs.unlink(`public/images/${filename}`, (err) => {
        if (err) return callback(err);

        callback(null);
    });
}
