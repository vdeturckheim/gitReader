'use strict';
const Git = require('./git');
const ReadDir = require('./dirReader');
const Path = require('path');
const Mkdirp = require('mkdirp');

const checkoutAndReadTag = function (repoName, tag, workingDir) {

    return Git.checkout(repoName, tag, workingDir)
        .then(() => ReadDir(Path.join(__dirname, workingDir, Git.getRepoName(repoName))));
};

const readAllTaggedRoles = function (repoName, tagList, workingDir) {

    const result = {};
    return new Promise((resolve, reject) => {

        let promise = Promise.resolve();
        tagList.forEach((tag) => {

            promise = promise.then(() => checkoutAndReadTag(repoName, tag, workingDir))
                .then((role) => {

                    result[tag] = role;
                });
        });
        promise.then(() => resolve(result))
            .catch((err) => reject(err));
    });
};

const mkdirp = function (dir) {

    return new Promise((resolve, reject) => {

        Mkdirp(dir, (err) => {

            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};

const main = function (repo) {

    const workingDir = 'tmp'; // TODO: clean this sometimes
    return mkdirp(Path.join(__dirname, workingDir))
        .then(() => Git.clone(repo, Path.join(__dirname, workingDir)))
        .then((rep) => Git.listTags(rep, Path.join(__dirname, workingDir)))
        .then((tags) => {

            tags.push('master');
            return readAllTaggedRoles(Git.getRepoName(repo), tags, workingDir);
        });
};

module.exports = main;
