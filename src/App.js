import "./App.css";
import Car from './Car';
import Web3 from 'web3';

import { useEffect, useState } from 'react';
import CarConfig from './Car.json';

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [carContract, setCarContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  const [carName, setCarName] = useState("");
  const [cars, setCars] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockchainData();
  }, [])
  
  async function loadBlockchainData() {
    let web3;
    const { web3: _web3, ethereum } = window;

    // load web3
    if (typeof ethereum !== "undefined") {
      await ethereum.enable();
      web3 = new Web3(ethereum);
    } else if (typeof _web3 !== "undefined") {
      web3 = new Web3(_web3.currentProvider);
    } else {
      web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }

    if (web3) {
      setWeb3(web3);
      // load user's address
      web3.eth.getAccounts((err, accounts) => setUserAddress(accounts[0]));
      // get network id to detect address from build json file
      const networkId = await web3.eth.net.getId();

      // load contract
      const contract = new web3.eth.Contract(
        CarConfig.abi,
        CarConfig.address
      );
      //get all car from owner
      getOwnerCars(contract);
      // set contract to state
      setCarContract(contract);
      
    } else {
      alert("Cannot detect web3");
    }
  }

  function createdCar() {
    return carContract.getPastEvents("CreatedCar", {}, (err, result) => {
      const { returnValues } = result[0];
      setCars([...cars, returnValues]);
    })
  }

  //handle onclick new car
  function createRandomCar() {
    if (carName) {
      return carContract.methods
        .createRandomCar(carName)
        .send( {from: userAddress})
        .on("receipt", (data) => {
          setCarName("");
          createdCar();
        })
        .on("error", (error) => alert("Error"));
    }
  }

  const getOwnerCars = async (contract) => {
    console.log("active");
    try {
      const carArr = await contract.methods
        .getOwnerCar()
        .call({ from: userAddress });
      
      let cars = [];
      if (carArr && carArr.length > 0) {
        for (let id of carArr) {
          const _bike = await contract.methods.cars(id).call();
          cars = [...cars, _bike];
        }
      }
      await setCars(cars);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <div style={{marginLeft: "45%"}}>
          <div>
            <input
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              type="text"
              placeholder="Enter name of car which you want"
            />
          </div>
          <button onClick={() => createRandomCar()}>Enter</button>
        </div>
        <div style={{width: '100%'}}> 
          {loading 
          ? (<h3>Loading data from contract...</h3>) 
          : (cars.length > 0 && (
            <>
              <div className="list-cars">
                  {
                    cars.map((car, index) => (
                      <Car key={index} car={car} />
                    ))
                  }
              </div>
            </>
          ))}
        </div>
    </div>
  );
}

export default App;
