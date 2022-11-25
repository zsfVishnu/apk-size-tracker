import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFeatureBranchSize, getDeltaPayload } from "./evaluator";
import { getMasterSizeFromArtifact, postComment } from "./network";
import { getBuildPath, getPascalCase, handleThreshold } from "./utils";

const core = require("@actions/core");
const github = require("@actions/github");
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

try {
  const flavorToBuild = getInput("flavor");
  const threshold = getInput("threshold");
  console.log(`Building flavor:  ${flavorToBuild}!`);
  const pascalFlavor = getPascalCase(flavorToBuild);
  const buildPath = getBuildPath(flavorToBuild);
  const masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN);
  const featSize = getFeatureBranchSize(pascalFlavor, buildPath);
  const deltaPayload = getDeltaPayload(masterSize, featSize);
  await postComment(deltaPayload, GITHUB_TOKEN);
  handleThreshold(masterSize, featSize, threshold, GITHUB_TOKEN);
} catch (error) {
  setFailed(error.message);
}
