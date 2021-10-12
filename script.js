// @ts-check

/**
 * This script copies labels from one repo to the next
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
    const [repoOwner, repoName] = repository.full_name.split("/");

    if (labels) {
        octokit.log.info(`Deleting first labels of target repository [${repoOwner}/${repoName}]`, repoOwner, repoName);
        await delete_labels(octokit, {repoOwner, repoName});
        octokit.log.info(`Copying now labels from template [${template}] for target repository [${repoOwner}/${repoName}]`, template, repoOwner, repoName);
        await copy_labels(octokit, {templateOwner, templateRepo}, {repoOwner, repoName});
    }

}

async function delete_labels(octokit, {repoOwner, repoName}) {
    const labels = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: repoOwner,
        repo: repoName
    });
    for (let i = 0; i < labels.data.length; i++) {
        const {name} = labels.data[i];
        await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {
            owner: repoOwner,
            repo: repoName,
            name,
        });
        octokit.log.info(`${name} label deleted`);
    }
}

async function copy_labels(octokit, {templateOwner, templateRepo}, {repoOwner, repoName}) {
    const labels = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: templateOwner,
        repo: templateRepo
    });
    try {
        for (let i = 0; i < labels.data.length; i++) {
            const {name, description, color} = labels.data[i];

            const label = await octokit.request('POST /repos/{owner}/{repo}/labels', {
                owner: repoOwner,
                repo: repoName,
                name,
                description,
                color
            });
            octokit.log.info(label);
            octokit.log.info(`${name} label created`);

        }
    } catch (err) {
        octokit.log.error(`unexpected error occurred when creating labels: ${err}`);
    }
}
