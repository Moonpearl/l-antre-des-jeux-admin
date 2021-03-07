import { createContext } from "react";
import { RequestState } from "../enums";

interface InitialContextValue {
  requestState: RequestState;
}

const defaultValue: InitialContextValue = {
  requestState: RequestState.Idle,
}

const InitialContext = createContext<InitialContextValue>(defaultValue);

export default InitialContext;
