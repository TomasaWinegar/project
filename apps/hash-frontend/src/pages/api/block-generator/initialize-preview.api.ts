import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { PREVIEW_PROJECT_PATH, runCommand } from "./shared";

const devFile = `import { MockBlockDock } from "mock-block-dock";
import { createRoot } from "react-dom/client";

import packageJson from "../package.json";
import exampleGraph from "./example-graph";
import Component from "./index";

const node = document.getElementById("app");

const DevApp = () => {
  return (
    <MockBlockDock
      blockDefinition={{ ReactComponent: Component }}
      blockEntityRecordId={exampleGraph.blockEntityRecordId}
      blockInfo={packageJson.blockprotocol}
      hideDebugToggle
      initialData={{
        initialEntities: exampleGraph.entities,
      }}
      simulateDatastoreLatency={{
        min: 50,
        max: 200,
      }}
      includeDefaultMockData
    />
  );
};

if (node) {
  createRoot(node).render(<DevApp />);
} else {
  throw new Error("Unable to find DOM element with id 'app'");
}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let pid = "";

  await runCommand({
    cmd: "lsof",
    args: ["-t", "-i", ":63212"],
    cwd: ".",
    stdOutCb: (data) => {
      pid = data.toString().trim();
    },
  });

  if (pid) {
    await runCommand({
      cmd: "kill",
      args: ["-9", pid],
      cwd: ".",
    });
  }

  if (!fs.existsSync("./generated-block")) {
    await runCommand({
      cmd: "npx",
      args: [
        "create-block-app@latest",
        "generated-block",
        "--template",
        "react",
      ],
      cwd: ".",
    });

    const filePath = `${PREVIEW_PROJECT_PATH}/src/dev.tsx`;

    await fs.writeFile(filePath, devFile, async (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log("dev file has been patched.");
    });
  }

  runCommand({
    cmd: "yarn",
    args: ["dev"],
    cwd: PREVIEW_PROJECT_PATH,
  });

  res.status(200).send("Ok");
}
