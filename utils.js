import { noFlavorFoundError, thresholdExceededError } from "./error";
import { execSync } from "child_process";
import { context } from "@actions/github";
import { postComment } from "./network";

export function getPascalCase(s) {
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return "Debug";
  }

  if (s.includes("Debug")) {
    const fl = s.split("Debug")[0];
    return fl.charAt(0).toUpperCase() + fl.slice(1) + "Debug";
  }
  noFlavorFoundError();
}

export function getBuildPath(s) {
  let outputPath = "app/build/outputs/apk/";
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return outputPath + "debug/";
  }

  if (s.includes("Debug")) {
    const fl = s.split("Debug")[0];
    return outputPath + fl + "/debug/";
  }

  if (s.toLowerCase() === "release") {
    return outputPath + "release/";
  }

  if (s.includes("Release")) {
    const fl = s.split("Release")[0];
    return outputPath + fl + "/release/";
  }
  buildPathError();
}

export function getBundlePath() {
  let outputPath = "android/infra/react/src/main/assets/"
  return outputPath
}

export function getApkName(s) {
  s = s.trim();
  if (s.toLowerCase() === "debug") {
    return "app-debug.apk";
  }

  if (s.includes("Debug")) {
    const fl = s.split("Debug")[0];
    return "app-" + fl + "-debug.apk";
  }
  apkNameError();
}

export function fileDiff(context) {
  return execSync(
    `#!/bin/bash
USAGE='[--cached] [<rev-list-options>...]

Show file size changes between two commits or the index and a commit.'

. "$(git --exec-path)/git-sh-setup"
args=$(git rev-parse --sq origin/${context.payload.pull_request.base.ref}..origin/${context.payload.pull_request.head.ref})
[ -n "$args" ] || usage
cmd="diff-tree -r"
[[ $args =~ "--cached" ]] && cmd="diff-index"
eval "git $cmd $args" | {
  total=0
  while read A B C D M P
  do
    case $M in
      M) bytes=$(( $(git cat-file -s $D) - $(git cat-file -s $C))) ;;
      A) bytes=$(git cat-file -s $D) ;;
      D) bytes=-$(git cat-file -s $C) ;;
      *)
        echo >&2 warning: unhandled mode $M in \"$A $B $C $D $M $P\"
        continue
        ;;
    esac
    total=$(( $total + $bytes ))
    printf '%d\t%s\n' $bytes "$P"
  done
  echo $total total
}`,
    { encoding: "utf-8" }
  );
}

export async function handleThreshold(
  masterSize,
  featSize,
  threshold,
  GITHUB_TOKEN
) {
  const diff = (featSize - masterSize) / 1024;
  if (diff > threshold) {
    let payload = `WORKFLOW FAILED DUE TO EXCEEDING THRESHOLD!!! \n \n \n 

   | Threshold  | Actual Delta | \n | ------------- | ------------- | \n | ${threshold} MB | ${diff} MB |  `;

    await postComment(payload.toString(), GITHUB_TOKEN);
    console.log(payload);
    thresholdExceededError();
  }
}
