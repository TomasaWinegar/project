import { useQuery } from "@apollo/client";
import { TextToken } from "@hashintel/hash-shared/graphql/types";
import { EntityMetadata, Entity } from "@hashintel/hash-subgraph";
import { EntityId } from "@hashintel/hash-shared/types";
import {
  GetPageCommentsQuery,
  GetPageCommentsQueryVariables,
} from "../../graphql/apiTypes.gen";
import { getPageComments } from "../../graphql/queries/page.queries";

export type PageThread = PageComment & {
  replies: PageComment[];
};

export type PageComment = {
  hasText: Array<TextToken>;
  textUpdatedAt: string;
  author: Entity;
  parent: Entity;
  metadata: EntityMetadata;
};

export type PageCommentsInfo = {
  data: PageThread[];
  loading: boolean;
};

const emptyComments: PageThread[] = [];

export const usePageComments = (pageEntityId: EntityId): PageCommentsInfo => {
  const { data, loading } = useQuery<
    GetPageCommentsQuery,
    GetPageCommentsQueryVariables
  >(getPageComments, {
    variables: { entityId: pageEntityId },
  });

  return { data: data?.pageComments ?? emptyComments, loading };
};
