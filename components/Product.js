import Image from 'next/image'
import React ,{ useCallback , useState } from 'react';
import styles from '../styles/Home.module.css';
import { TOKENADDRESS, BASECOIN , TOKENNAME, CONTADDRESS, TXNURL, GUIDE, TIPS, TOKENCT } from '../config/constclient';
import SimpleStorageContract from '../config/contracts/Dstate.json';
import toast from "../components/Toast";
import Web3 from 'web3';

export default function Product(props) {
  const { product, onAdd, isConnected, web3, accounts,  rbal, setRbalance } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingr, setIsLoadingr] = useState(false);
  
  const notify = useCallback((type, message , action) => {
    toast({ type, message, action });
  }, []);

  const copyToken = async () => {
    navigator.clipboard.writeText(TOKENADDRESS);
    notify("success","Address Copied! Please Import token into MetaMask ", GUIDE);
   }

  const gotourl = async (urls) => {
    window.open(urls, '_blank').focus();
   }

  const callRedeemCT = async (accounts) => {
    try {
      if(accounts) {
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        CONTADDRESS
      );

        if(!instance) {
          notify("info","Please try again! To know the steps ", GUIDE);
        }
        else {
      await instance.methods.withdraw().send({ from: accounts }, 
      function(error, transactionHash){
        if (error) {
          notify("info","Please try again! To know the steps ", GUIDE);
        } else {
          notify("info","To achieve great earnings-tips & tricks ", TIPS);
          notify("success", "Please find redeem receipt  " , TXNURL + transactionHash);
        }
    });
  }
  } else
  {
    
  }
    } catch (error) {
      notify("info","Please try again! To know the steps ", GUIDE);
    }
  }; 


    /* callredeem */
    const callredeem = async (account) => {
      try {
      setIsLoadingr(true);
      await callRedeemCT(account);
      setIsLoadingr(false);
    } catch (err) {
      setIsLoadingr(false);
    }
    }

  return (
    <span  className={styles.card}>

    {/* <label>Mint 2 Earn</label> */}
    <div>

        {true && (<button  title="Guide" className={styles.refreshbutton} 
                onClick={(e) => {
                  e.preventDefault();
                  gotourl(GUIDE);
                }}
                disabled={isLoading}>
                  <Image src="/guide.png" alt="Refresh" width={10} height={10} />
                </button>)}
                &nbsp;
        {true && (<button title="Token Scan" className={styles.refreshbutton} 
                onClick={(e) => {
                  e.preventDefault();
                  gotourl(TOKENCT);
                }}
                disabled={isLoading}>
                  <Image src="/settings.png" alt="Refresh" width={10} height={10} />
                </button>)}

                &nbsp;
        {isConnected && (<button title="Refresh Balance" className={styles.refreshbutton} 
                onClick={(e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  setRbalance(accounts);
                  setIsLoading(false);
                }}
                disabled={isLoading}>
                  {isLoading && <span className={styles.loaderre}></span>}
                  {!isLoading && <Image src="/refresh.png" alt="Refresh" width={10} height={10} />}
                </button>)}
 
      </div>

      {!isConnected && (
      <>
      <div className={styles.h3}>
      Polygon Mainnet 
      </div>
      <div className={styles.h33}>
      Specialized Nft generates recurring {BASECOIN}<Image src="/maticcoin.png"  width={15} height={15} />  on each mint
      </div>
      </>
      )}

      {isConnected && (
      <>
      <div className={styles.h3}>
        {Number.parseFloat(rbal).toFixed(3)}<sup className={styles.supf}>{BASECOIN}</sup>
      </div>
      
      {rbal <= 0 && (<div> Your Redeem Balance  </div> )}
      {rbal > 0 && (<div> <button className={styles.betbutton}
       onClick={(e) => {
        e.preventDefault();
        callredeem(accounts);
      }
      }
    disabled={isLoadingr}>
     {isLoadingr && <span className={styles.loaderre}></span>}
      Redeem</button>   </div> )}
     
      </> )}

      <div className={styles.line}></div>
      <div className={styles.brow}>
        <span className={styles.lbcolumn}>
        <img className="small" src={product.image} alt={product.name} width={150} height={150} />
        </span>
        <span className={styles.rbcolumn}>
        <ul className={styles.ulstyle}>
          <li>{product.name}</li>
          <li>ERC-721</li>
          <li>Polygon</li>
          <li><a className={styles.invisbut}
                         onClick={(e) => {
                          e.preventDefault();
                          copyToken();
                        }
                      }
                    >{TOKENADDRESS.substr(0,10)}</a>

          </li>
          <li>
          <Image src="/maticcoin.png"  width={15} height={15} /> {product.price} 
          </li>
        </ul>
        </span>
      </div>
 
      <div>
        <button className={styles.betbutton} onClick={() => onAdd(product)}>Add Cart</button>
      </div>

      </span>
  );
}
