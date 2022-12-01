import {
  ReactElement,
  useMemo,
  createContext,
  useCallback,
  useEffect,
  useState,
  FunctionComponent,
} from "react";
import { useAuthenticatedUser } from "../../components/hooks/useAuthenticatedUser";
import { localStorageKeys } from "../../lib/config";
import { MinimalOrg } from "../../lib/org";
import { User } from "../../lib/user";

export type WorkspaceContextValue = {
  activeWorkspace?: User | MinimalOrg;
  activeWorkspaceAccountId?: string;
  updateActiveWorkspaceAccountId: (
    updatedActiveWorkspaceAccountId: string,
  ) => void;
};

const defaultWorkspaceContextValue: WorkspaceContextValue = {
  updateActiveWorkspaceAccountId: (_updatedActiveWorkspaceAccountId: string) =>
    undefined,
};

export const WorkspaceContext = createContext<WorkspaceContextValue>(
  defaultWorkspaceContextValue,
);

export const WorkspaceContextProvider: FunctionComponent<{
  children: ReactElement;
}> = ({ children }) => {
  const { authenticatedUser } = useAuthenticatedUser();

  const [activeWorkspaceAccountId, setActiveWorkspaceAccountId] =
    useState<string>();

  const updateActiveWorkspaceAccountId = useCallback(
    (updatedActiveWorkspaceAccountId: string) => {
      localStorage.setItem(
        localStorageKeys.workspaceAccountId,
        updatedActiveWorkspaceAccountId,
      );
      setActiveWorkspaceAccountId(updatedActiveWorkspaceAccountId);
    },
    [],
  );

  useEffect(() => {
    if (!activeWorkspaceAccountId) {
      /**
       * Initialize the `activeWorkspaceAccountId` with what has been persisted
       * in `localStorage` (if anything)
       */
      const localStorageInitialValue = localStorage.getItem(
        localStorageKeys.workspaceAccountId,
      );

      if (localStorageInitialValue) {
        setActiveWorkspaceAccountId(localStorageInitialValue);
      } else if (authenticatedUser) {
        /**
         * Initialize the `activeWorkspaceAccountId` to the account ID of the
         * currently authenticated user
         */
        updateActiveWorkspaceAccountId(authenticatedUser.userAccountId);
      }
    }
  }, [
    activeWorkspaceAccountId,
    updateActiveWorkspaceAccountId,
    authenticatedUser,
  ]);

  const workspaceContextValue = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace:
        authenticatedUser &&
        authenticatedUser.userAccountId === activeWorkspaceAccountId
          ? authenticatedUser
          : authenticatedUser?.memberOf?.find(
              ({ orgAccountId }) => orgAccountId === activeWorkspaceAccountId,
            ),
      activeWorkspaceAccountId,
      updateActiveWorkspaceAccountId,
    }),
    [
      authenticatedUser,
      activeWorkspaceAccountId,
      updateActiveWorkspaceAccountId,
    ],
  );

  return (
    <WorkspaceContext.Provider value={workspaceContextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
