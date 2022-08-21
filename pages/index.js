import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useCallback , useState } from "react";
import toast from "../components/Toast";
import Web3 from 'web3';
import Main from '../components/Main';
import Basket from '../components/Basket';
import data from '../components/data';
import { BSCTESTNET, CONTADDRESS, DSTATECT, GUIDE, PAPERS, TIPS, TWITTER, YOUTUBE,BASEIMAGEPATH, TIKTOK, TOKENADDRESS, TOKENCT } from '../config/constclient';
import SimpleStorageContract from '../config/contracts/Dstate.json';

export default function Home() {
 
  const [pizzadice, setPizzadice] = useState(false);
  const [pizzaflappy, setPizzaflappy] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [isLoadingConn, setIsLoadingConn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [rbal, setRbal] = useState(0.0);
  const faviconpath = BASEIMAGEPATH.concat('favicon.ico');
 
  const notify = useCallback((type, message , action) => {
    toast({ type, message, action });
  }, []);

  /* Cart */
  const { products } = data;
  const [cartItems, setCartItems] = useState([]);
  const onAdd = (product) => {
    const exist = cartItems.find((x) => x.id === product.id);
    if (exist) {
      if(exist.qty === 99){
        notify("info","Maximum Quantity achieved", GUIDE);
        return;
      }
      setCartItems(
        cartItems.map((x) =>
          x.id === product.id ? { ...exist, qty: exist.qty + 1 } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };
  const onRemove = (product) => {
    const exist = cartItems.find((x) => x.id === product.id);
    if (exist.qty === 1) {
      setCartItems(cartItems.filter((x) => x.id !== product.id));
    } else {
      setCartItems(
        cartItems.map((x) =>
          x.id === product.id ? { ...exist, qty: exist.qty - 1 } : x
        )
      );
    }
  };
  /* Pass */

  const gotouri = async (urls) => {
    window.open(urls, '_blank').focus();
   }
 
  /* chain switch */
  const networks = {
    polygontest: {
      chainId: `0x${Number(80001).toString(16)}`,
      chainName: "Mumbai Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
    },
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"]
    }
   };
 

  /* MM Connect - begins */
  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      notify("info", "Please install MetaMask! Check the guide " , GUIDE);
    }
    return provider;
  };

  const onConnect = async () => {
    try {
      setIsLoadingConn(true);
      const currentProvider = detectCurrentProvider();
      if (currentProvider) {
        if (currentProvider !== window.ethereum) {
          notify("info","Please install MetaMask! ", GUIDE);
          setIsLoadingConn(false);
          return;
        }

        try {
          await currentProvider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                ...networks['polygon']
              }
            ]
          });
        } catch (err) {
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{  chainId: `0x${Number(137).toString(16)}` }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      ...networks['polygon']
                    },
                  ],
                });
              } catch (addError) {
                notify("info","Please reload and try connect wallet!", GUIDE);
                setIsLoadingConn(false);
              }
            }
          }
          setIsLoadingConn(false);
        }

        await currentProvider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(currentProvider);
        const userAccount = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        const account = userAccount[0];
        let ethBalance = await web3.eth.getBalance(account); 
        ethBalance = web3.utils.fromWei(ethBalance, 'ether'); 
        if (userAccount.length === 0) {
          notify("info","Please connect to meta mask! ", GUIDE);
          setIsLoadingConn(false);
        } else {
          setWeb3(web3);
          setAccounts(account);
          setIsLoadingConn(false);
          saveUserInfo(ethBalance, account, chainId);
        }
        setIsLoadingConn(false);
      }
        setIsLoadingConn(false);
    } catch (err) {
      notify("info","Please reload and try connect wallet!", GUIDE);
      setIsLoadingConn(false);
    }
  };

  const onDisconnect = () => {
    setUserInfo({});
    setRbal(0.0);
    setAccounts(null);
    setIsConnected(false);
    notify("info","Disconnected! To know about tips & tricks ", TIPS);
  };

  const saveUserInfo = (ethBalance, account, chainId) => {
    const userAccount = {
      address: account,
      balance: ethBalance,
      connectionid: chainId,
    };
    const userData = JSON.parse(JSON.stringify(userAccount));
    setUserInfo(userData);
    setIsConnected(true);
  };
  /*  MM Connect - ends */

   /* call ct */
   const setRbalance = async (accounts) => {
    try {

      
      if (accounts) {
 
        const instance = new web3.eth.Contract(
          SimpleStorageContract.abi,
          CONTADDRESS
        );

        if (!instance) {
        }
        else {
          // logic starts
          
         await instance.methods.getBalance(accounts).call(
            function (err, res) {
              if (err) {
              }else {
              
              setRbal(Web3.utils.fromWei(res, 'ether'));
              
              }
            }
          );

        }
      }

    } catch (error) {
      notify("info", "Please try after sometime! ", GUIDE);
    }
  }
  /* call ct */

  return (
    <div className={styles.pageCol}>
      <Head>
        <title>Rabbit Eggs DeFi</title>
        <meta name="description" content="Rabbit Eggs DeFi - Mint 2 Earn Platform" /> 
        <link rel="icon"  href={faviconpath} />
      </Head>
    
        <main className={styles.main}>
        <p className={styles.alerttext}>Project is in Upgradation.</p>
        <p className={styles.alerttext}>All user's MATIC are send to their Respective MetaMask</p>
        <br></br>
          <div className={styles.menuline}>
          <button><Image src="/rxscoin.png" alt="rabbit eggs defi" width={15} height={15} /></button>
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(PAPERS);
                                  }}
          >Papers</button> 
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(GUIDE);
                                  }}
          >Guide</button> 
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(BSCTESTNET);
                                  }}
          >Testnet</button>
          </div>
        { !pizzadice && (<h3>Rabbit Eggs NFT Platform</h3>)}

        {(!pizzaflappy) && (
          <div className={styles.blockOut}>

            <Main products={products} onAdd={onAdd}
            isConnected={isConnected}
            web3={web3}
            accounts={accounts}
            rbal={rbal}
            setRbalance={setRbalance}
            ></Main>

            {cartItems.length != 0 && (
              <span>
                <Basket
                  cartItems={cartItems}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  isConnected={isConnected}
                  web3={web3}
                  accounts={accounts}
                ></Basket>
              </span>
            )}

            <div className={styles.blockC}><center>
              {!isConnected && (<button className={styles.stbutton} onClick={onConnect} disabled={isLoadingConn}
              >{isLoadingConn && <span className={styles.loaderMint}></span>}Connect Wallet</button>)}
              {isConnected && (<button className={styles.stbutton} onClick={onDisconnect}>{userInfo.address.substr(0, 5)}...{userInfo.address.substr(userInfo.address.length - 4, userInfo.address.length - 1)}</button>)}
            </center>
            </div>

          </div>)}
          <p className={styles.alerttext}>Upgrade version released soon.</p>
          <p  className={styles.alerttext}>Please keep in touch with us vai Twitter</p>
      </main>

      <footer className={styles.footer}>

        <div className={styles.menulinef} >
        <button
                         onClick={(e) => {
                          e.preventDefault();
                          gotouri(TOKENCT);
                        }}
          >Buy Contract</button> 
          <button
                         onClick={(e) => {
                          e.preventDefault();
                          gotouri(DSTATECT);
                        }}
          >Withdraw Contract</button> 
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(TWITTER);
                                  }}
          >Twitter</button> 
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(TIKTOK);
                                  }}
          >Discord</button> 
          <button
                                   onClick={(e) => {
                                    e.preventDefault();
                                    gotouri(YOUTUBE);
                                  }}
          >Youtube</button>
      </div>
      </footer>
    </div>
  )
}
