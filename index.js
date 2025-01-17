import {getInput, setFailed} from "@actions/core";
import { context } from "@actions/github";
import { getFeatureBranchSize, getDeltaPayload, getBundleFeatureSize } from "./evaluator";
import { getMasterSizeFromArtifact, postComment } from "./network";
import { getBuildPath, getBundlePath, handleThreshold } from "./utils";
import * as core from "@actions/core";
import {logInputs} from "./input.utils";

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

async function main() {
  try {
    const flavorToBuild = getInput("flavor")
    const threshold = getInput("threshold");
    const isRN = getInput("is_react_native");
    const workingDir = getInput("working_directory");
    const isNativeChange =
        getInput("native_change") === "true" || getInput("yarn_lock_change") === "true";
    const isRNChange = getInput("rn_change") === "true";
    const bundleCommand = getInput("bundle_command");
    const streamOutputMaxBuffer = Number.parseInt(getInput("stream_output_max_buffer"));

    logInputs({
      flavorToBuild,
      threshold,
      isRN,
      workingDir,
      isNativeChange,
      isRNChange,
      bundleCommand,
      streamOutputMaxBuffer
    });

    let masterSize, featSize, buildPath;

    if (isNativeChange) {
      buildPath = getBuildPath(flavorToBuild);
      masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN, "apk");
      featSize = getFeatureBranchSize(workingDir, flavorToBuild, buildPath, isRN, streamOutputMaxBuffer);
    } else if (isRNChange) {
      masterSize = await getMasterSizeFromArtifact(GITHUB_TOKEN, "bundle");
      featSize = getBundleFeatureSize(bundleCommand, getBundlePath(), streamOutputMaxBuffer);
    }

    if (masterSize && featSize) {
      const deltaPayload = getDeltaPayload(masterSize, featSize, context);
      console.log("Delta payload:", deltaPayload);
      await postComment(deltaPayload, GITHUB_TOKEN);

      if (threshold) {
        console.log("Threshold provided, handling it...");
        handleThreshold(masterSize, featSize, threshold, GITHUB_TOKEN);
      } else {
        console.log("No threshold provided.");
      }
    } else {
      console.error("Master or feature size is undefined.");
    }
  } catch (error) {
    setFailed(error.message);
  }
}

main();
