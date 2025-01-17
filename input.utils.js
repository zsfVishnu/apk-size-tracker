import { getInput } from "@actions/core";

export const logInputs = (inputs) => {
    console.log("Inputs:", JSON.stringify(inputs, null, 2));
}