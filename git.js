'use strict';
const Rimraf = require('rimraf');
const Path = require('path');

const getRepoName = module.exports.getRepoName = function (repoUrl) {

    return repoUrl.replace('.git','').split('/').pop();
};

module.exports.clone = function (repo, workingdir) {

    const repoName = getRepoName(repo);
    return new Promise((resolve, reject) => {

        Rimraf(Path.join(workingdir, repoName), () => {

            const Cloner = require('simple-git')(workingdir);
            Cloner.clone(repo, repoName, (err) => {

                if (err) {
                    return reject(err);
                }
                return resolve(repoName);
            });
        });
    });
};

module.exports.listTags = function (repoName, workingdir) {

    const Git = require('simple-git')(Path.join(workingdir, repoName));
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

module.exports.checkout = function (repoName, toCheckout, workingdir) {

    const Git = require('simple-git')(Path.join(workingdir, repoName));
    return new Promise((resolve, reject) => {

        Git.checkout(toCheckout, (err) => {

            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};

