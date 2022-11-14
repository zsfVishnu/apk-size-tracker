import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { getFeatureBranchSize } from './evaluator';
import { getMasterSizeFromArtifact, postComment } from './network';

const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');


try {
    const flavorToBuild = getInput('flavor');
    console.log(`Building flavor:  ${flavorToBuild}!`);
    const featSize = getFeatureBranchSize()
    const masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN)
    await postComment(featSize, masterSize, GITHUB_TOKEN);

} catch (error) {
    setFailed(error.message);
}