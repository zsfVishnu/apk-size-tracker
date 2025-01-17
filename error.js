import { setFailed } from "@actions/core";

export function noArtifactFoundError() {
  let err = new Error(
    "No apk metric artifact found. Please add the apk-metric-upload action to the master/main branch"
  );
  err.description =
    "No apk metric artifact found. Please add the apk-metric-upload action to the master/main branch";
  throw err;
}

export function noFlavorFoundError() {
  let err = new Error(
    "No debug flavor found. Please make sure to specify a debug flavor"
  );
  err.description =
    "No debug flavor found. Please make sure to specify a debug flavor";
  throw err;
}

export function thresholdExceededError() {
  setFailed("Feature branch size exceeded the threshold provided");
}

export function buildPathError() {
  setFailed("Build Path error. Make sure the flavor provided is correct");
}

export function apkNameError() {
  setFailed("apk name error. Make sure the apk name provided is correct");
}
