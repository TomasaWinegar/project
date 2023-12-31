import { ApolloError } from "apollo-server-express";

import {
  getPageById,
  setPageParentPage,
} from "../../../../graph/knowledge/system-types/page";
import { MutationSetParentPageArgs, ResolverFn } from "../../../api-types.gen";
import { LoggedInGraphQLContext } from "../../../context";
import { dataSourcesToImpureGraphContext } from "../../util";
import { mapPageToGQL, UnresolvedPageGQL } from "../graphql-mapping";

export const setParentPageResolver: ResolverFn<
  Promise<UnresolvedPageGQL>,
  {},
  LoggedInGraphQLContext,
  MutationSetParentPageArgs
> = async (
  _,
  { pageEntityId, parentPageEntityId, prevIndex = null, nextIndex = null },
  { dataSources, user },
) => {
  const context = dataSourcesToImpureGraphContext(dataSources);

  if (pageEntityId === parentPageEntityId) {
    throw new ApolloError("A page cannot be the parent of itself");
  }

  const page = await getPageById(context, {
    entityId: pageEntityId,
  });

  const newParentPage = parentPageEntityId
    ? await getPageById(context, {
        entityId: parentPageEntityId,
      })
    : null;

  const updatedPage = await setPageParentPage(context, {
    page,
    parentPage: newParentPage,
    actorId: user.accountId,
    prevIndex,
    nextIndex,
  });

  return mapPageToGQL(updatedPage);
};
