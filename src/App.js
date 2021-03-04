import "./App.css";
import Car from './Car';
import SoldCar from './SoldCar';
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
  const [mergeSuccess, setMergeSucess] = useState(false);
  const [sellCar, setSellCar] = useState([]);

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
      handleSellCar(contract);
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

  // const getOwnerSoldCar = async (contract) => {
  //   try {
  //     const carSold = await contract.methods
  //       .getAllSoldCar()
  //       .call({ from: userAddress });

  //     let _carSold = [];
  //     if (carSold && carSold.length > 0) {
  //       for (let id of carSold) {
  //         const _car = await contract.methods.cars(id).call();
  //         _carSold = [..._carSold, _car];
  //       }
  //     }
  //     await setSellCar(_carSold);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

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
    const index = arr.findIndex((e) => e.id === id);
    return [...arr.slice(0, index), ...arr.slice(index + 1, arr.length)];
  }


  //handle change name
  const handleChangeName = () => {
    return carContract.getPastEvents("ChangeCarName", {}, (err, result) => {
      const { newName } = result[0].returnValues;
      let index = cars.findIndex((e) => e.id === selectedCar[0]);
      cars[index].name = newName;
      setCars([...cars]);
    })
  }
  //change name
  const changeName = async () => {
    if (selectedCar.length == 1) {
      const newName = window.prompt("Please enter new name: ");
      if (!newName) {
        return alert("Don't have new name yet!");
      }
      await carContract.methods
        .changeCarName(selectedCar[0], newName)
        .send({from: userAddress})
        .on("receipt", (result) => {
          handleChangeName();
        })
        .on("error", (error) => alert("Error!"));
    } else {
      return alert("Please select only one car to change its name")
    }
  }

  //handle merge two car
  const handleMergeTwoCar = () => {
    return carContract.getPastEvents("MergeTwoCar", {}, (err, result) => {
      const { _from, _to } = result[0].returnValues;
      console.log(result)
      let carArr;
      carArr = deleteIndexArray(_from, cars);
      carArr = deleteIndexArray(_to, carArr);
      setCars([...carArr]);
      setSelectedCar([]);
      setMergeSucess(true);
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

  //handle transfer
  const handleTransfer = () => {
    return carContract.getPastEvents("Transfer", {}, (err, result) => {
      if (!err) {
        getOwnerCars(carContract);
      }
    })
  }

  //transfer
  const transferFrom = async () => {
    if (selectedCar.length == 1) {
      const _to = window.prompt("Enter your address you want to transfer");
      const _from = userAddress;
      if (_to && _to === _from) {
        return alert("Address transfer into must be not same as user address!");
      }
      return carContract.methods
        .transferFrom(_from, _to, selectedCar[0])
        .send({from: userAddress})
        .on("receipt", (result) => {
          handleTransfer();
        })
        .on("error", (err) => {
          alert("Error!");
        })
    } else {
      alert("Choose only 1")
    }
  }
  //use effect for level up update
  useEffect(() => {
    if (mergeSuccess) createdCar();
  }, [mergeSuccess])
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

  //handle sell car 
  const handleSellCar = async (contract) => {
    const carSold = await contract.methods
        .getAllSoldCar()
        .call({ from: userAddress });
    let _carSold = [];
    if (carSold && carSold.length > 0) {
      for (let id of carSold) {
        const _car = await contract.methods.cars(id).call();
        _carSold = [..._carSold, _car];
      }
    }
    setSellCar(_carSold);
    getOwnerCars(contract)
  }
  //sell car
  const soldCar = async () => {
    alert(selectedCar.length);
    if (selectedCar.length === 1) {
      await carContract.methods
        .selledCar(selectedCar[0])
        .send({from: userAddress})
        .on("receipt", (result) => {
          setSelectedCar([]);
          handleSellCar(carContract);
        })
        .on("error", (err) => {
          alert("Can not sell car, something is happend!");
        })
    } else {  
      return alert("You can sell only one car in one transaction!");
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
          : ((cars.length > 0 || sellCar.length > 0) && (
            <>
              <div className="list-cars">
                  {
                    cars.map((car, index) => (
                      <Car key={index} car={car} sellCar={sellCar} levelUp={levelUp} handleSelectCar={handleSelectCar} selectedCar={selectedCar} soldCar={soldCar} />
                    ))
                  }
              </div>
              <div style={{paddingTop: '50px', paddingLeft: "45%"}}>
                <button onClick={() => changeName()}>Change Name</button>
                <button onClick={() => mergeTwoCars()}>Merge two car</button>
                <button onClick={() => transferFrom()}>Transfer</button>
                <button onClick={() => soldCar()}>Sell</button>
              </div>
              <hr />
              <h3 style={{paddingLeft: "45%"}}>Car Market</h3>
              <div className="list-cars">
                  {
                    sellCar.map((car, index) => (
                      <Car key={index} car={car} sellCar={sellCar} handleSelectCar={handleSelectCar} selectedCar={selectedCar} soldCar={soldCar} isSell={true}/>
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
