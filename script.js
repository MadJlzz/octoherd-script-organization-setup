// @ts-check

/**
 * This script configures an entire organization based on inputs described in README.md
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.template this is the repo you want the labels to be copied from
 * @param {boolean} options.copyLabels flag to trigger labels copying
 * @param {boolean} options.copyMergeOptions flag to trigger merge option copying
 */
export async function script(octokit, repository, options) {
    if (!options.template) {
        throw new Error(`--template is required`);
    }

    const [templateOwner, templateRepo] = options.template.split("/");
    const [targetOwner, targetRepo] = repository.full_name.split("/");

    if (options.copyLabels) {
        octokit.log.info(`Deleting all labels of target repository [${targetOwner}/${targetRepo}]`);
        await delete_labels(octokit, targetOwner, targetRepo);

        octokit.log.info(`Copying now labels from template [${templateOwner}/${templateRepo}] for target repository [${targetOwner}/${targetRepo}]`);
        await copy_labels(octokit, {owner: templateOwner, repo: templateRepo}, {owner: targetOwner, repo: targetRepo});
    }

    if (options.copyMergeOptions) {
        octokit.log.info(`Copying merge options from template [${templateOwner}/${templateRepo}] to target repository [${targetOwner}/${targetRepo}]`);
        await copy_merge_options(octokit, {owner: templateOwner, repo: templateRepo}, {
            owner: targetOwner,
            repo: targetRepo
        });
    }

}

/**
 * Delete all labels for a given <owner>/<repo>.
 * This method is not efficient because we can't batch the delete requests.
 *
 * @param octokit is the authenticated client to perform API request
 * @param owner is the repository's owner
 * @param repo is the name of the repository.
 */
async function delete_labels(octokit, owner, repo) {
    const labels = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: owner,
        repo: repo
    });
    for (let i = 0; i < labels.data.length; i++) {
        const {name} = labels.data[i];
        await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {
            owner: owner,
            repo: repo,
            name: name,
        });
        octokit.log.info(`${name} label deleted`);
    }
}

/**
 * Copy all labels present in source into target.
 * This method is not efficient because we need to create labels one by one.
 *
 * @param octokit is the authenticated client to perform API request
 * @param {object} source is the template used for performing the copy
 * @param {string} source.owner is the owner of the template
 * @param {string} source.repo is the name of the repository template
 * @param {object} target is the destination (repository) where we should copy settings to
 * @param {string} target.owner is the owner of the destination repository
 * @param {string} target.repo is the name of the destination repository
 *
 */
async function copy_labels(octokit, source, target) {
    const labels = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: source.owner,
        repo: source.repo
    });
    try {
        for (let i = 0; i < labels.data.length; i++) {
            const {name, description, color} = labels.data[i];
            await octokit.request('POST /repos/{owner}/{repo}/labels', {
                owner: target.owner,
                repo: target.repo,
                name: name,
                description: description,
                color: color
            });
            octokit.log.info(`[${name}] label created`);
        }
    } catch (err) {
        octokit.log.error(`unexpected error occurred when creating labels: ${err}`);
    }
}

/**
 * Copy merge options from the source into the target.
 * Merge options is used to control PR merge strategy.
 *
 * @param octokit is the authenticated client to perform API request
 * @param {object} source is the template used for performing the copy
 * @param {string} source.owner is the owner of the template
 * @param {string} source.repo is the name of the repository template
 * @param {object} target is the destination (repository) where we should copy settings to
 * @param {string} target.owner is the owner of the destination repository
 * @param {string} target.repo is the name of the destination repository
 *
 */
async function copy_merge_options(octokit, source, target) {
    const repositoryMergeOpts = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: source.owner,
        repo: source.repo,
    }).then(value => {
        return {
            allow_squash_merge: value.data.allow_squash_merge,
            allow_merge_commit: value.data.allow_merge_commit,
            allow_rebase_merge: value.data.allow_rebase_merge
        }
    });
    octokit.log.info(`Merge settings from template are: [${JSON.stringify(repositoryMergeOpts)}]`);
    await octokit.request('PATCH /repos/{owner}/{repo}', {
        owner: target.owner,
        repo: target.repo,
        ...repositoryMergeOpts,
    });
}
