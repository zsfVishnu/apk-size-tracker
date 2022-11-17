import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { getFeatureBranchSize, getDeltaPayload } from './evaluator';
import { getMasterSizeFromArtifact, postComment } from './network';

const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');


try {
    const flavorToBuild = getInput('flavor');
    console.log(`Building flavor:  ${flavorToBuild}!`);
    const masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN)
    const featSize = getFeatureBranchSize()
    const deltaPayload = getDeltaPayload(masterSize, featSize)
    await postComment(deltaPayload, GITHUB_TOKEN);

} catch (error) {
    setFailed(error.message);
}