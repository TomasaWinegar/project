import { NextApiRequest, NextApiResponse } from "next";
import { PREVIEW_PROJECT_PATH, runCommand } from "./shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await runCommand({
    cmd: "yarn",
    args: ["add", `${req.body.dependencies.join(" ")}`],
    cwd: PREVIEW_PROJECT_PATH,
  });

  res.status(200).send("Ok");
}
