import axios from "axios";
import React, { createContext, FC, useState } from "react";
import { RequestState } from "../enums";
import { EbpProduct } from "../interfaces/ebp";

interface EbpContextValue {
  products: EbpProduct[];
  requestState: RequestState;
  findById: (id: string) => EbpProduct | undefined;
  uploadEbpExport: (file: File) => void;
}

const defaultValue: EbpContextValue = {
  products: [],
  requestState: RequestState.Idle,
  findById: () => undefined,
  uploadEbpExport: () => undefined,
};

const EbpContext = createContext<EbpContextValue>(defaultValue);

export const EbpContextProvider: FC = ({ children }) => {
  const [products, setProducts] = useState<EbpProduct[]>([]);
  const [requestState, setRequestState] = useState<RequestState>(RequestState.Idle);

  const findById = (id: string) => {
    return products.find(product => product.ebpId === id);
  };

  const uploadEbpExport = async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);

    setRequestState(RequestState.Pending);

    try {
      const result = await axios.post<EbpProduct[]>(
        '/.netlify/functions/upload-ebp-export',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setRequestState(RequestState.Success);
      setProducts(result.data);
    }
    catch (error) {
      setRequestState(RequestState.Failed);
    }
  };

  const value: EbpContextValue = {
    products,
    requestState,
    findById,
    uploadEbpExport,
  };

  return (
    <EbpContext.Provider value={value}>
      {children}
    </EbpContext.Provider>
  );
}

export default EbpContext;
