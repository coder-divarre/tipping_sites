import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Card, Input, Button, Radio } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";


function App() {
  // const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");

  const getBasicInfo = async () => {
    const unisat = (window as any).unisat;
    const [address] = await unisat.getAccounts();
    setAddress(address);

    const publicKey = await unisat.getPublicKey();
    setPublicKey(publicKey);

    const balance = await unisat.getBalance();
    setBalance(balance);

    const network = await unisat.getNetwork();
    setNetwork(network);
  };

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: [],
  });
  const self = selfRef.current;
  const handleAccountsChanged = (_accounts: string[]) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network: string) => {
    setNetwork(network);
    getBasicInfo();
  };

  useEffect(() => {
    const unisat = (window as any).unisat;
    if (unisat) {
      // setUnisatInstalled(true);
    } else {
      return;
    }
    unisat.getAccounts().then((accounts: string[]) => {
      handleAccountsChanged(accounts);
    });

    unisat.on("accountsChanged", handleAccountsChanged);
    unisat.on("networkChanged", handleNetworkChanged);

    return () => {
      unisat.removeListener("accountsChanged", handleAccountsChanged);
      unisat.removeListener("networkChanged", handleNetworkChanged);
    };
  }, []);

  const unisat = (window as any).unisat;
  return (
    <div className="App">
      <header className="App-header">
        <p>中本聪赛博祠堂</p>

        {connected ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Card
              size="small"
              title="Basic Info"
              style={{ width: 300, margin: 10 }}
            >
              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>announcement:</div>
                <div >这里是中本聪祠堂，你可以选择上香或者给祖师爷磕个头，磕完头你能够将你的心愿刻录进铭文进，希望祖师爷保佑各位！阿门</div>
              </div>
              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>Address:</div>
                <div style={{ wordWrap: "break-word" }}>{address}</div>
              </div>

              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>你的善业点数:</div>
                <div > 0 功德</div>
              </div>

              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>Balance:</div>
                <div style={{ wordWrap: "break-word" }}>{balance.total}</div>
              </div>
            </Card>

            <SendBitcoin />
            
            {/* <SignMessageCard /> */}
          </div>
        ) : (
          <div>
            <Button
              onClick={async () => {
                const result = await unisat.requestAccounts();
                handleAccountsChanged(result);
              }}
            >
              Connect Unisat Wallet
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}


// function SignMessageCard() {
//   const [message, setMessage] = useState("给我钱");
//   const [signature, setSignature] = useState("");
//   return (
//     <Card size="small" title="许愿" style={{ width: 300, margin: 10 }}>
//       <div style={{ textAlign: "left", marginTop: 10 }}>
//         <div style={{ fontWeight: "bold" }}>Message:</div>
//         <Input
//           defaultValue={message}
//           onChange={(e) => {
//             setMessage(e.target.value);
//           }}
//         ></Input>
//       </div>
//       <div style={{ textAlign: "left", marginTop: 10 }}>
//         <div style={{ fontWeight: "bold" }}>许愿:</div>
//         <div style={{ wordWrap: "break-word" }}>{signature}</div>
//       </div>
//       <Button
//         style={{ marginTop: 10 }}
//         onClick={async () => {
//           const signature = await (window as any).unisat.signMessage(message);
//           setSignature(signature);
//         }}
//       >
// 许愿      </Button>
//     </Card>
//   );
// }


// bc1qkcxyjn0cgum92p4t4sr6h38pqpda0v2gvva9yp
function SendBitcoin() {
  const [toAddress, setToAddress] = useState(
    "tb1qmfla5j7cpdvmswtruldgvjvk87yrflrfsf6hh0"
  );
  const [selectedOption, setSelectedOption] = useState<number | string>(1000);
  const [txid, setTxid] = useState("");

  const handleOptionChange = (e: RadioChangeEvent) => {
    setSelectedOption(e.target.value);
  };

  const handleSendBitcoin = async () => {
    try {
      const txid = await (window as any).unisat.sendBitcoin(
        toAddress,
        selectedOption
      );
      setTxid(txid);
    } catch (e) {
      setTxid((e as any).message);
    }
  };

  return (
    <Card size="small" title="上香" style={{ width: 300, margin: 10 }}>


      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Type:</div>
        <Radio.Group onChange={handleOptionChange} value={selectedOption}>
          <Radio.Button value={1000}>大香</Radio.Button>
          <Radio.Button value={2000}>小香</Radio.Button>
          <Radio.Button value={1}>磕头</Radio.Button>
        </Radio.Group>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Result:</div>
        <div style={{ wordWrap: "break-word" }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={handleSendBitcoin}
      >
上香      </Button>
    </Card>
  );
}


export default App;