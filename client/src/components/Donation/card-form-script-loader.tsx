import React, { useEffect, useState } from 'react';
import { squareLocationConfig } from '../../../../config/donation-settings';
import envData from '../../../../config/env.json';

const {
  squareApplicationId,
  deploymentEnv
}: { squareApplicationId: string | null; deploymentEnv: 'staging' | 'live' } =
  envData as {
    squareApplicationId: string | null;
    deploymentEnv: 'staging' | 'live';
  };

export const SQUARE_JS_URL_SANDBOX =
  'https://sandbox.web.squarecdn.com/v1/square.js';

function CardFormScriptLoader(): JSX.Element {
  // let squarePromise: Promise<void> | undefined;
  const [payments, setPayments] = useState();
  const [squareLoaded, setSquareLoaded] = useState(false);

  useEffect(() => {
    // Your code here
    void loadSquare();
  });

  const loadSquare = async (): Promise<T> => {
    if (!window.Square && !squareLoaded) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.crossOrigin = 'anonymous';
        script.src = SQUARE_JS_URL_SANDBOX;
        script.onload = () => {
          setSquareLoaded(true);
          console.log('onSquareLoad');
          try {
            void onSquareload();
          } catch {
            //handle error
          }
        };
        script.onabort = script.onerror = e => {
          // document.head.removeChild(script);
          // squarePromise = void 0;
          reject(e);
        };
        document.head.appendChild(script);
      });
    }
  };

  const onSquareload = async (): Promise<T> => {
    const locationId: string = squareLocationConfig[deploymentEnv];

    let payments = await window.Square.payments(
      squareApplicationId,
      locationId
    );

    let card = await initializeCard(payments);

    // handle error if it fails

    // setPayments(payments);
  };

  const initializeCard = async payments => {
    const card = await payments.card();
    await card.attach('#card-container');
    return card;
  };

  return (
    <form id='payment-form'>
      <div id='card-container' />
      <button className='confirm-donation-btn' id='card-button' type='button'>
        Pay $1.00
      </button>
    </form>
  );
}

CardFormScriptLoader.displayName = 'CardFormScriptLoader';

export default CardFormScriptLoader;
