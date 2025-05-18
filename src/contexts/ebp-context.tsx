import axios from "axios";
import React, { createContext, FC, useEffect, useState } from "react";
import { RequestState } from "../enums";
import { EbpProduct } from "../interfaces/ebp";
import { SnipcartCollection, SnipcartProduct } from "../interfaces/snipcart";

interface StockUpdateState {
  currentId: string;
  processedCount: number;
  errorCount: number;
  totalCount: number;
}

interface EbpContextValue {
  products: EbpProduct[];
  requestState: RequestState;
  updateStocks: boolean;
  stockUpdateState?: StockUpdateState;
  findById: (id: string) => EbpProduct | undefined;
  uploadEbpExport: (file: File) => void;
  setUpdateStocks: (updateStocks: boolean) => void;
}

const defaultValue: EbpContextValue = {
  products: [],
  requestState: RequestState.Idle,
  updateStocks: false,
  stockUpdateState: undefined,
  findById: () => undefined,
  uploadEbpExport: () => undefined,
  setUpdateStocks: (updateStocks: boolean) => undefined,
};

const EbpContext = createContext<EbpContextValue>(defaultValue);

export const EbpContextProvider: FC = ({ children }) => {
  const [products, setProducts] = useState<EbpProduct[]>([]);
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.Idle
  );
  const [updateStocks, setUpdateStocks] = useState(false);
  const [stockUpdateState, setStockUpdateState] = useState<
    StockUpdateState | undefined
  >();

  const findById = (id: string) => {
    if (id === "") return undefined;
    return products.find((product) => product.ebpId === id);
  };

  const uploadEbpExport = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    setRequestState(RequestState.Pending);

    // Parse EBP export file and retrieve a list of all products
    try {
      const response = await axios.post<EbpProduct[]>(
        "/.netlify/functions/upload-ebp-export",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setRequestState(RequestState.Success);
      setProducts(response.data);
    } catch (error) {
      setRequestState(RequestState.Failed);
    }
  };

  useEffect(
    () => {
      const update = async () => {
        // If no products exist in EBP import, or if the option to update stocks is set to off, abort
        if (products.length === 0 || !updateStocks) {
          return;
        }

        setStockUpdateState({
          currentId: "",
          processedCount: 0,
          errorCount: 0,
          totalCount: 0,
        });

        // Get a list of all Snipcart products
        const response = await axios.get<SnipcartCollection<SnipcartProduct>>(
          "/.netlify/functions/get-snipcart-products"
        );

        // If no products were found, abort
        if (response.data.totalItems === 0) {
          return;
        }

        // Update stock for each Snipcart product individually
        let currentId = "";
        let processedCount = 0;
        let errorCount = 0;
        const totalCount = response.data.totalItems;

        const snipcartProducts = response.data.items;

        for (const snipcartProduct of snipcartProducts) {
          try {
            currentId = snipcartProduct.userDefinedId;

            setStockUpdateState({
              currentId,
              processedCount,
              errorCount,
              totalCount,
            });

            const ebpProduct = findById(currentId);

            if (typeof ebpProduct === "undefined") {
              throw new Error(
                `Product ${currentId} (${snipcartProduct.name}) does not exist in EBP export.`
              );
            }

            const promises = [
              axios.put("/.netlify/functions/update-snipcart-product", {
                id: currentId,
                stock: ebpProduct.stock,
              }),
              axios.put("/.netlify/functions/update-game", {
                ebpId: currentId,
                lastReportedStock: ebpProduct.stock,
              }),
            ];

            await Promise.all(promises);
          } catch (error) {
            console.error(error);
            errorCount += 1;
          } finally {
            processedCount += 1;
          }
        }

        setStockUpdateState(undefined);
      };
      update();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
  );

  const value: EbpContextValue = {
    products,
    requestState,
    updateStocks,
    stockUpdateState,
    findById,
    uploadEbpExport,
    setUpdateStocks,
  };

  return <EbpContext.Provider value={value}>{children}</EbpContext.Provider>;
};

export default EbpContext;
