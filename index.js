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
  const isRNChange = getInput("rn_change")
  const isNativeChange = getInput("native_change")
  console.log(`Building flavor:  ${flavorToBuild}!`);
  if (isNativeChange) {
    buildPath = getBuildPath(flavorToBuild);
    masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN, "apk");
    featSize = getFeatureBranchSize(flavorToBuild, buildPath, isRN);
  } else if (isRNChange) {
    buildPath = "infra/react/src/main/assets/"
    masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN, "bundle");
    featSize = getBundleFeatureSize(flavorToBuild, buildPath, isRN);
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
