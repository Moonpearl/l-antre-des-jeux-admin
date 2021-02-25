import axios from "axios";
import { createContext, FC, Reducer, useContext, useEffect, useReducer, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { RequestState } from "../enums";

const resources = ['categories', 'mechanics'] as const;
type Resource = typeof resources[number];

interface ResourceLoaderProps {
  resource: Resource;
}

enum ResourceLoaderState {
  Idle,
  FetchMissing,
  CreateMissing,
  Done,
}

const ResourceLoader: FC<ResourceLoaderProps> = ({ resource }) => {
  const [missingAssets, setMissingAssets] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [requestState, setRequestState] = useState<RequestState>(RequestState.Idle);
  const [currentCreatingAsset, setCurrentCreatingAsset] = useState<number>(0);

  const context = useContext(InitialContext);
  const { actions } = context;
  const loaderState = context.allLoaderStates[resource];

  const setLoaderState = (state: ResourceLoaderState) => actions.setLoaderState(resource, state);

  useEffect(
    () => {
      const fetchMissing = async () => {
        setLoaderState(ResourceLoaderState.FetchMissing);
        setRequestState(RequestState.Pending);
        const response = await axios.get(`/.netlify/functions/get-missing-assets?resource=${resource}`);

        const missingAssets = response.data;
        if (missingAssets.length > 0) {
          setMissingAssets(response.data);
          setRequestState(RequestState.Success);
        } else {
          setLoaderState(ResourceLoaderState.Done);
        }
      };
      fetchMissing();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resource]
  );

  useEffect(
    () => {
      if (missingAssets.length > 0) {
        const createMissing = async () => {
          setLoaderState(ResourceLoaderState.CreateMissing);
          for (const index in missingAssets) {
            setCurrentCreatingAsset(Number(index));
            const asset = missingAssets[index];
            await axios.post(`/.netlify/functions/create-asset?resource=${resource}`, {
              name: asset.name,
              boardgameatlasId: asset.id,
            });
          }
          setLoaderState(ResourceLoaderState.Done);
        };
        createMissing();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [missingAssets]
  );

  const renderMessage = (): string | null => {    
    switch (loaderState) {
      case ResourceLoaderState.Idle:
        return `Initializing...`;

      case ResourceLoaderState.FetchMissing:
        return `Checking for missing ${resource}…`;

      case ResourceLoaderState.CreateMissing:
        return `Creating ${currentCreatingAsset} of ${missingAssets.length} missing ${resource}…`;

      case ResourceLoaderState.Done:
        return `Ready!`;
      
      default:
        return null;
    }
  }

  return (
    <div>
      <Alert variant={loaderState === ResourceLoaderState.Done ? 'success' : 'primary'}>
        {loaderState !== ResourceLoaderState.Done && <Spinner animation="border" variant="primary" size="sm" />}
        &nbsp;
        {renderMessage()}
      </Alert>
    </div>
  );
}

type AllLoaderStates = Record<Resource, ResourceLoaderState>;

const defaultAllLoaderStates: AllLoaderStates = {
  categories: ResourceLoaderState.Idle,
  mechanics: ResourceLoaderState.Idle,
};

interface InitialContextValue {
  allLoaderStates: AllLoaderStates,
  actions: {
    setLoaderState: (resource: Resource, state: ResourceLoaderState) => void,
  }
}

const defaultContextValue: InitialContextValue = {
  allLoaderStates: defaultAllLoaderStates,
  actions: {
    setLoaderState: () => {},
  }
}

const InitialContext = createContext<InitialContextValue>(defaultContextValue);

const loaderStateReducer: Reducer<AllLoaderStates, LoaderStateAction> = (state, action) => {
  const { type, value } = action;
  return {
    ...state,
    [type]: value,
  };
}

interface LoaderStateAction {
  type: Resource;
  value: ResourceLoaderState;
}

const InitialLoader: FC = ({ children }) => {
  const [allLoaderStates, dispatchLoaderStates] = useReducer<Reducer<AllLoaderStates, LoaderStateAction>>(loaderStateReducer, defaultAllLoaderStates);

  const setLoaderState = (type: Resource, value: ResourceLoaderState) => {
    dispatchLoaderStates({ type, value });
  };

  const contextValue: InitialContextValue = {
    allLoaderStates,
    actions: {
      setLoaderState,
    },
  };

  if (Object.values(allLoaderStates).every( loaderState => loaderState === ResourceLoaderState.Done )) {
    return <>{children}</>;
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">Loading...</h1>
      <InitialContext.Provider value={contextValue}>
        {resources.map(
          resource =>
            <ResourceLoader key={resource} resource={resource} />
        )}
      </InitialContext.Provider>
    </Container>
  )
}

export default InitialLoader;
