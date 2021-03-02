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
  const [selectedCar, setSelectedCar] = useState([]);

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

  const handleSelectCar = (id) => {
    const index = selectedCar.findIndex((e) => e == id);
    if (selectedCar.length < 2) {
      if (index === -1) {
        setSelectedCar([...selectedCar, id]);
      } else {
        setSelectedCar(
          [
            ...selectedCar.slice(0, index),
            ...selectedCar.slice(index + 1, selectedCar.length),
          ]
        );
      }
    } else {
      if (index === -1) {
        setSelectedCar([
          ...selectedCar.slice(
            selectedCar.length - 1, 
            selectedCar.length
          ),
          id
        ]);
      } else {
        setSelectedCar([
          ...selectedCar.slice(0, index),
          ...selectedCar.slice(index + 1, selectedCar.length)
        ]);
      }
    }
  }

  //delete index from array
  const deleteIndexArray = (id, arr) => {
    const index = arr.includes((e) => e.id == id);
    return [...arr.slice(0, index), ...arr.slice(index + 1, arr.length)];
  }

  //handle merge two car
  const handleMergeTwoCar = () => {
    return carContract.getPastEvents("MergeTwoCar", {}, (err, result) => {
      console.log(result)
      const { from, to } = result[0].returnValues;
      let arr1 = deleteIndexArray(from, cars);
      let arr2 = deleteIndexArray(to, cars);
      setCars([
        ...arr1, arr2
      ])
      setSelectedCar([]);
    })
  }

  //merge car
  const mergeTwoCars = async () => {
    if (selectedCar.length == 2) {
      const name = window.prompt("Please enter name for your new car: ");
      if (!name) {
        return alert("Please enter name for your new car!");
      }
      await carContract.methods
        .mergeTwoCar(selectedCar[0], selectedCar[1], name)
        .send({from: userAddress})
        .on("receipt", (result) => {
          handleMergeTwoCar();
        })
        .on("error", (error) => console.log(error))
    } else {
      return alert("Please select car for merge action!");
    }
  }

  //level up success
  const upLevelSuccess = () => {
    return carContract.getPastEvents("LevelUpSuccess", {}, (err, result) => {
      if (!err) {
        const { id } = result[0].returnValues;
        let _car = cars.find((car) => (car.id === id));
        _car.level = +_car.level + 1;
        setCars([...cars])
      } else {
        console.log(err)
      }
    })
  }

  //use effect for level up update

  //handle onclick level up
  const levelUp = async (id, level) => {
    if (id && level) {
      return carContract.methods
        .levelUp(id)
        .send({ from: userAddress , value: web3.utils.toWei(String(0.001 * level), "ether") })
        .on("receipt", (err, result) => {
          upLevelSuccess();
        })
        .on("error", () => alert("Error"))
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
          <button onClick={() => mergeTwoCars()}>Merge two car</button>
        </div>
        <div style={{width: '100%'}}> 
          {loading 
          ? (<h3>Loading data from contract...</h3>) 
          : (cars.length > 0 && (
            <>
              <div className="list-cars">
                  {
                    cars.map((car, index) => (
                      <Car key={index} car={car} levelUp={levelUp} handleSelectCar={handleSelectCar} selectedCar={selectedCar} />
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
