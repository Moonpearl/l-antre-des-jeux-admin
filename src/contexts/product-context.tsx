import axios from "axios";
import React, { createContext, FC, useContext, useReducer, useState } from "react";
import { EbpContext } from ".";
import { RequestState } from "../enums";
import { GraphcmsProduct, GraphcmsVariant } from "../interfaces/graphcms";
import createCollectionReducer, { UseCollectionAction } from "../reducers/create-collection-reducer";

export enum ProductReducerType {
  SetProperties = 'PRODUCT_REDUCER_SET_PROPERTIES',
  Reset = 'PRODUCT_REDUCER_RESET',
};

type ProductFragment = {
  [K in keyof GraphcmsProduct]?: GraphcmsProduct[K]
};

type ProductReducerPayload = {
  [ProductReducerType.SetProperties]: ProductFragment
  [ProductReducerType.Reset]: undefined
};

type ProductReducerAction = {
  [K in ProductReducerType]: {
    type: K;
    payload: ProductReducerPayload[K];
  }
}[ProductReducerType];

const productReducer = (state: GraphcmsProduct, action: ProductReducerAction) => {
  switch (action.type) {
    case ProductReducerType.SetProperties:
      return { ...state, ...action.payload };
    
    case ProductReducerType.Reset:
      return initialProduct;

    default:
      return state;
  }
};

const initialProduct: GraphcmsProduct = {
  id: '',
  slug: '',
  ebpId: '',
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  lastReportedStock: 0,
};

interface ProductContextValue {
  states: {
    product: GraphcmsProduct;
    variants: GraphcmsVariant[];
    requestState: RequestState;
  };
  actions: {
    mutateProduct: React.Dispatch<ProductReducerAction>,
    mutateVariants: React.Dispatch<UseCollectionAction<GraphcmsVariant>>,
    createProduct: (product: GraphcmsProduct) => void;
    setRequestState: (requestState: RequestState) => void;
  };
  assertors: {
    isPropertyValid: (propName: keyof GraphcmsProduct) => boolean,
    isProductValid: () => boolean,
  },
}

const ProductContext = createContext<ProductContextValue>({
  states: {
    product: initialProduct,
    variants: [],
    requestState: 0,
  },
  actions: {
    mutateProduct: () => {},
    mutateVariants: () => {},
    createProduct: () => undefined,
    setRequestState: () => undefined,
  },
  assertors: {
    isPropertyValid: () => false,
    isProductValid: () => false,
  },
});

export const ProductContextProvider: FC = ({ children }) => {
  const { findById } = useContext(EbpContext);
  const [requestState, setRequestState] = useState(RequestState.Idle);
  const [product, mutateProduct] = useReducer(productReducer, initialProduct);
  const [variants, mutateVariants] = useReducer(createCollectionReducer<GraphcmsVariant>(), []);

  const isPropertyValid = (propName: keyof GraphcmsProduct): boolean => {
    switch (propName) {
      case 'ebpId':
        if (product[propName] === '') return false;
        const ebpProduct = findById(product[propName])
        return typeof ebpProduct !== 'undefined';
      
      case 'name':
        return product[propName] !== '';

      case 'shelf':
        return typeof product[propName] !== 'undefined';

      default:
        return true;
    }
  }

  const isProductValid = () => {
    let propName: keyof GraphcmsProduct;
    for (propName in product) {
      if (!isPropertyValid(propName)) {
        return false;
      }
    }
    return true;
  }

  const createProduct = async (product: GraphcmsProduct) => {
    if (!isProductValid()) {
      return;
    }

    setRequestState(RequestState.Pending);
    await axios.post(`/.netlify/functions/create-game`,
      product
    );
    await axios.post(`/.netlify/functions/create-snipcart-product`,
      { slug: product.slug.split('-').filter(item => item !== '').join('-') }
    );

    setRequestState(RequestState.Success);
  };

  const value = {
    states: {
      product,
      variants,
      requestState,
    },
    actions: {
      mutateProduct,
      mutateVariants,
      createProduct,
      setRequestState,
    },
    assertors: {
      isPropertyValid,
      isProductValid,
    },
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export default ProductContext;
