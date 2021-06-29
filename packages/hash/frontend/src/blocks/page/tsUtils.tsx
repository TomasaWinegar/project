import { Schema as JSONSchema } from "jsonschema";
import React, { ReactNode } from "react";
import { EditorProps, NodeView } from "prosemirror-view";
import { RemoteBlock } from "../../components/RemoteBlock/RemoteBlock";

// @todo this type properly exists already somewhere
export type Block = {
  entityId: string;
  entity: Record<any, any>;
  componentId: string;
  componentMetadata: {
    name: string;
    source?: string;
    url: string;
  } & (
    | { type?: undefined }
    | {
        type: "prosemirror";
        // @todo type this
        spec: any;
      }
  );
  componentSchema: JSONSchema;
};

type BlockMeta = Pick<Block, "componentMetadata" | "componentSchema">;

export const blockCache = new Map<string, BlockMeta>();

export const builtInBlocks: Record<string, BlockMeta> = {
  // @todo maybe this should be a nodeview too
  "https://block.blockprotocol.org/paragraph": {
    componentSchema: {},
    componentMetadata: {
      url: "https://block.blockprotocol.org/paragraph",
      name: "paragraph",
      type: "prosemirror",
      spec: {
        content: "text*",
        domTag: "p",
        marks: "_",
      },
    },
  },
};

export const fetchBlockMeta = async (
  url: string,
  signal?: AbortSignal
): Promise<BlockMeta> => {
  if (builtInBlocks[url]) {
    return builtInBlocks[url];
  }

  if (blockCache.has(url)) {
    return blockCache.get(url)!;
  }

  const metadata = await (
    await fetch(`${url}/metadata.json`, { signal })
  ).json();

  const schema = await (
    await fetch(`${url}/${metadata.schema}`, { signal })
  ).json();

  const result: BlockMeta = {
    componentMetadata: {
      ...metadata,
      url: url,
    },
    componentSchema: schema,
  };
  if (typeof window !== "undefined") {
    blockCache.set(url, result);
  }

  return result;
};

export const addBlockMetadata = async (
  block: Omit<Block, "componentMetadata" | "componentSchema">
): Promise<Block> => {
  return {
    ...block,
    ...(await fetchBlockMeta(block.componentId)),
  };
};

export const componentIdToName = (componentId: string) => {
  const stripped = componentId.replace(/[^a-zA-Z0-9]/g, "");
  return stripped.slice(0, 1).toUpperCase() + stripped.slice(1);
};
/**
 * @todo this API could possibly be simpler
 */
export type ReplacePortals = (
  existingNode: HTMLElement | null,
  nextNode: HTMLElement | null,
  reactNode: ReactNode | null
) => void;
type NodeViewConstructorArgs = Parameters<
  NonNullable<EditorProps["nodeViews"]>[string]
>;
type NodeViewConstructor = {
  new (...args: NodeViewConstructorArgs): NodeView;
};

export const createNodeView = (
  name: string,
  componentSchema: Block["componentSchema"],
  url: string,
  replacePortal: ReplacePortals
): NodeViewConstructor => {
  const editable = componentSchema.properties?.["editableRef"];

  const nodeView = class BlockWrapper implements NodeView {
    dom: HTMLDivElement = document.createElement("div");
    contentDOM: HTMLElement | undefined = undefined;

    private target = document.createElement("div");

    // @todo types
    constructor(
      node: NodeViewConstructorArgs[0],
      public view: NodeViewConstructorArgs[1],
      public getPos: NodeViewConstructorArgs[2]
    ) {
      this.dom.setAttribute("data-dom", "true");

      if (editable) {
        this.contentDOM = document.createElement("div");
        this.contentDOM.setAttribute("data-contentDOM", "true");
        this.contentDOM.style.display = "none";
        this.dom.appendChild(this.contentDOM);
      }

      this.target.setAttribute("data-target", "true");

      this.dom.appendChild(this.target);

      this.update(node);
    }

    update(node: any) {
      if (node) {
        if (node.type.name === name) {
          replacePortal(
            this.target,
            this.target,
            <RemoteBlock
              url={url}
              {...node.attrs.props}
              {...(editable
                ? {
                    editableRef: (node: HTMLElement) => {
                      if (
                        this.contentDOM &&
                        node &&
                        !node.contains(this.contentDOM)
                      ) {
                        node.appendChild(this.contentDOM);
                        this.contentDOM.style.display = "";
                      }
                    },
                  }
                : {})}
            />
          );

          return true;
        }
      }

      return false;
    }

    destroy() {
      this.dom.remove();
      replacePortal(this.target, null, null);
    }

    // @todo type this
    stopEvent(evt: any) {
      if (evt.type === "dragstart") {
        evt.preventDefault();
      }

      return true;
    }

    ignoreMutation(evt: any) {
      return !(
        !evt.target ||
        (evt.target !== this.contentDOM &&
          this.contentDOM?.contains(evt.target))
      );
    }
  };

  Object.defineProperty(nodeView, "name", { value: `${name}View` });

  return nodeView;
};
