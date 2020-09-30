const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // `reviews` and `team` inputs defined in action metadata file
    const team = JSON.parse(core.getInput('team'));
    const githubToken = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(githubToken)
    const reviews = (await octokit.pulls.listReviews({
      owner: github.context.payload.pull_request.base.repo.owner.login,
      repo: github.context.payload.pull_request.base.repo.name,
      pull_number: github.context.payload.pull_request.number,
    })).data.map((review) => review.user.login);
    
    let requiredReviews = [];
      
    console.log(`reviews payload: ${JSON.stringify(reviews)}`);
    console.log(`team payload: ${JSON.stringify(team)}`);

    team.forEach(member => {
      requiredReviews.push(reviews.includes(member));
    });

    console.log(requiredReviews);
    if(!requiredReviews.includes(true)) {
      core.setFailed("You need a review from a team member before merging.");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();