// @ts-check

/**
 * This script configures an entire organization based on inputs described in README.md
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.template this is the repo you want the labels to be copied from
 * @param {boolean} options.labels flag to trigger labels copying
 */
export async function script(octokit, repository, {template, labels}) {
    if (!template) {
        throw new Error(`--template is required`);
    }

    const [templateOwner, templateRepo] = template.split("/");
    const [targetOwner, targetRepo] = repository.full_name.split("/");

    if (labels) {
        octokit.log.info(`Deleting all labels of target repository [${targetOwner}/${targetRepo}]`);
        await delete_labels(octokit, targetOwner, targetRepo);

        octokit.log.info(`Copying now labels from template [${template}] for target repository [${targetOwner}/${targetRepo}]`, template, targetOwner, targetRepo);
        await copy_labels(octokit, {owner: templateOwner, repo: templateRepo}, {owner: targetOwner, repo: targetRepo});
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
 * @param source is the src <owner>/{repo} we want to get the labels from for the copy
 * @param target is the dst <owner>/{repo} we want to copy the labels to
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
