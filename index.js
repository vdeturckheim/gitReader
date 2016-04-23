'use strict';
const Git = require('./git');
const ReadDir = require('./dirReader');
const Path = require('path');
const repo = 'git@github.com:STEAMULO/ansible-role-mysql.git';
const workingDir = 'roles';

const checkoutAndReadTag = function (repoName, tag) {

    return Git.checkout(repoName, tag, workingDir)
        .then(() => ReadDir(Path.join(__dirname, workingDir, Git.getRepoName(repoName))));
};

const readAllTaggedRoles = function (repoName, tagList) {

    const result = {};
    return new Promise((resolve, reject) => {

        let promise = Promise.resolve();
        tagList.forEach((tag) => {

            promise = promise.then(() => checkoutAndReadTag(repoName, tag))
                .then((role) => {

                    result[tag] = role;
                });
        });
        promise.then(() => resolve(result))
            .catch((err) => reject(err));
    });
};

Git.clone(repo, Path.join(__dirname, workingDir))
    .then((rep) => Git.listTags(rep, Path.join(__dirname, workingDir)))
    .then((tags) => readAllTaggedRoles(Git.getRepoName(repo), tags))
    .then((done) => console.log(JSON.stringify(done)));

