'use strict';
const Rimraf = require('rimraf');

const getRepoName = module.exports.getRepoName = function (repoUrl) {

    return repoUrl.replace('.git','').split('/').pop();
};

module.exports.clone = function (repo) {

    const repoName = getRepoName(repo);
    return new Promise((resolve, reject) => {

        Rimraf(`./roles/${repoName}`, () => {

            const Cloner = require('simple-git')('./roles');
            Cloner.clone(repo, repoName, (err) => {

                if (err) {
                    return reject(err);
                }
                return resolve(repoName);
            });
        });
    });
};

module.exports.listTags = function (repoName) {

    const Git = require('simple-git')(`./roles/${repoName}`);
    return new Promise((resolve, reject) => {

        Git.tags((err, tags) => {

            if (err) {
                return reject(err);
            }
            const result = tags.all.filter((tag) => tag !== '');
            return resolve(result);
        });
    });
};

module.exports.checkout = function (repoName, toCheckout) {

    const Git = require('simple-git')(`./roles/${repoName}`);
    return new Promise((resolve, reject) => {

        Git.checkout(toCheckout, (err) => {

            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};

