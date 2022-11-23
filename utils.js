import { noFlavorFoundError } from "./error";
import { execSync } from "child_process";
import { context } from "@actions/github";

export function getPascalCase(s) {
  s = s.toLowerCase();
  s = s.trim();
  if (s === "debug") {
    return "Debug";
  }

  if (s.includes("debug")) {
    const fl = s.split("debug")[0];
    return fl.charAt(0).toUpperCase() + fl.slice(1) + "Debug";
  }
  noFlavorFoundError();
}

export function getBuildPath(s) {
  let outputPath = "app/build/outputs/apk/";
  s = s.toLowerCase();
  s = s.trim();
  if (s === "debug") {
    return outputPath + "debug/";
  }

  if (s.includes("debug")) {
    const fl = s.split("debug")[0];
    return outputPath + fl + "/debug/";
  }
  noFlavorFoundError();
}

export function fileDiff() {
  console.log("****");
  console.log(execSync(`${context.base.ref}`, { encoding: "utf-8" }));
  console.log(execSync(`git fetch`, { encoding: "utf-8" }));
  console.log(execSync(`git branch --list`, { encoding: "utf-8" }));
  console.log("****");
  return execSync(
    `#!/bin/bash
USAGE='[--cached] [<rev-list-options>...]

Show file size changes between two commits or the index and a commit.'

. "$(git --exec-path)/git-sh-setup"
args=$(git rev-parse --sq --cached ${context.base.ref})
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
