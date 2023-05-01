import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { PREVIEW_PROJECT_PATH, runCommand } from "./shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const filePath = `${PREVIEW_PROJECT_PATH}/src/app.tsx`;

  fs.writeFile(filePath, req.body.code, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("The file has been saved.");

    res.status(200).send("Ok");
  });
}
