import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import {getFeatureBranchSize, getDeltaPayload, getBundleFeatureSize} from "./evaluator";
import { getMasterSizeFromArtifact, postComment } from "./network";
import { getBuildPath, getPascalCase, handleThreshold } from "./utils";

const core = require("@actions/core");
const github = require("@actions/github");
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

let masterSize
let featSize
let buildPath

try {
  const flavorToBuild = getInput("flavor");
  const threshold = getInput("threshold");
  const isRN = getInput("is-react-native");
  const bundle_diff = getInput("bundle_diff")
  const isNativeChange = getInput("native_change")
  console.log(`Building flavor:  ${flavorToBuild}!`);
  if (isRNChange) {
    buildPath = getBuildPath(flavorToBuild);
    masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN);
    featSize = getFeatureBranchSize(flavorToBuild, buildPath, isRN);
  } else {
    buildPath = "infra/react/src/main/assets/"
    //masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN);
    masterSize = 20
    //featSize = getBundleFeatureSize(flavorToBuild, buildPath, isRN);
    featSize = 25
  }
  const deltaPayload = getDeltaPayload(masterSize, featSize, context);
  await postComment(deltaPayload, GITHUB_TOKEN);
  if (!(threshold === "")) {
    console.log("threshold provided");
    handleThreshold(masterSize, featSize, threshold, GITHUB_TOKEN);
  } else {
    console.log("threshold not provided");
  }
} catch (error) {
  setFailed(error.message);
}
