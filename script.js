// @ts-check

/**
 * This script copies labels from one repo to the next
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.template this is the repo you want the labels to be copied from
 */
export async function script(octokit, repository, { template }) {
  if (!template) {
    throw new Error(`--template is required`);
  }

  octokit.log.debug(
    "Load branch protection settings from template repository %s",
    template
  );

  const [templateOwner, templateRepo] = template.split("/");
  const [repoOwner, repoName] = repository.full_name.split("/");

  const labels = await octokit.request('GET /repos/{owner}/{repo}/labels', {
    owner: templateOwner,
    repo: templateRepo
  })

  console.log(labels);

}
