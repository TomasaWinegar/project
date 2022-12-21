import { Entity } from "@hashintel/hash-subgraph";
import {
  getCommentAuthor,
  getCommentById,
} from "../../../../graph/knowledge/system-types/comment";
import { ResolverFn } from "../../../apiTypes.gen";
import { LoggedInGraphQLContext } from "../../../context";
import { UnresolvedCommentGQL, mapEntityToGQL } from "../graphql-mapping";

export const commentAuthorResolver: ResolverFn<
  Promise<Entity>,
  UnresolvedCommentGQL,
  LoggedInGraphQLContext,
  {}
> = async ({ metadata }, _, { dataSources: { graphApi } }) => {
  const comment = await getCommentById(
    { graphApi },
    {
      entityId: metadata.editionId.baseId,
    },
  );
  const author = await getCommentAuthor({ graphApi }, { comment });

  return mapEntityToGQL(author.entity);
};
