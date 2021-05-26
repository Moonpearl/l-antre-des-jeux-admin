import axios from "axios";
import { useContext, useState, useEffect, ChangeEventHandler } from "react";
import { EbpContext, GraphcmsContext } from "../contexts";
import { RequestState } from "../enums";
import { EbpProduct } from "../interfaces/ebp";
import { GraphcmsProduct, GraphcmsShelf } from "../interfaces/graphcms";

const useNewProduct = () => {
  const { findById } = useContext(EbpContext);
  const { shelves } = useContext(GraphcmsContext);
  const [requestState, setRequestState] = useState(RequestState.Idle);
  const [ebpId, setEbpId] = useState('');
  const [ebpProduct, setEbpProduct] = useState<EbpProduct | undefined>();
  const [isValid, setIsValid] = useState<boolean | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [shelf, setShelf] = useState<GraphcmsShelf>();

  useEffect(
    () => {
      if (ebpId === '') {
        if (submitted) {
          setIsValid(false);
        } else {
          setIsValid(undefined);
        }
        setEbpProduct(undefined);
      } else {
        const product = findById(ebpId);
    
        if (typeof product === 'undefined') {
          setIsValid(false);
        } else {
          setIsValid(true);
        }

        setEbpProduct(product);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ebpId, submitted]
  );

  const handleEbpIdChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value.toUpperCase();
    setEbpId(newValue);
    setSubmitted(false);
  };

  const handleShelfChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setShelf(
      shelves.find( shelf => shelf.id === event.target.value )
    );
  };

  const createProduct = async (product: GraphcmsProduct) => {
    setSubmitted(true);
    if (!isValid || typeof shelf === 'undefined') {
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

  return {
    states: {
      requestState,
      ebpId,
      ebpProduct,
      isValid,
      submitted,
      shelf,
    },
    stateSetters: {
      setRequestState,
      setEbpId,
      setEbpProduct,
      setIsValid,
      setSubmitted,
      setShelf,
    },
    eventHandlers: {
      handleEbpIdChange,
      handleShelfChange,
      createProduct,
    },
  };
}

export default useNewProduct;
