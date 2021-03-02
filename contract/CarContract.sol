pragma solidity ^0.5.0;

contract CarContract {
    struct Car {
        uint id;
        string name;
        uint color;
        uint level;
        uint ready;
    }

    mapping(uint => Car) public cars;
    
    uint public taskCount = 0;
    
    uint colorDigits = 14;
    uint colorModulus = 10 ** colorDigits;
    uint coolDownTime = 1 days;
    uint levelUpFee = 0.001 ether;
    
    mapping(uint => address) public carToOwner;
    mapping(address => uint) ownerCarCount;
    
    event CreatedCar(uint id, string name, uint color, uint level, uint ready);
    event LevelUpSuccess(uint id);
    event MergeTwoCar(uint _from, uint _to, string name);
    
    constructor() public {
        createRandomCar("Lamborghini");
    }
    
    function createCar(string memory _name, uint color) internal {
        taskCount++;
        uint _ready = uint(now + coolDownTime);
        Car memory _car = Car(taskCount, _name, color, 1, _ready);
        cars[taskCount] = _car;
        carToOwner[taskCount] = msg.sender;
        ownerCarCount[msg.sender]++;
        emit CreatedCar(taskCount, _name, color, 1, _ready);
    }
 
    function _generateRandomDna(string memory _name) private view returns(uint) {
        uint rand = uint(keccak256(abi.encodePacked(_name)));
        return rand % colorModulus;
    }
    
    //create random car using name
    function createRandomCar(string memory _name) public {
        uint color = _generateRandomDna(_name);
        createCar(_name, color);
    }
    
    //get all car of owner
    function getOwnerCar() public view returns (uint [] memory) {
        uint[] memory _cars = new uint[](ownerCarCount[msg.sender]);
        uint counter;
        for (uint i = 1; i <= taskCount; i++) {
            if (carToOwner[i] == msg.sender) {
                _cars[counter] = i;
                counter++;
            }
        }
        return _cars;
    }
    
    //level up car
    function levelUp(uint _id) public payable onlyOwnerOf(_id) {
        Car storage _car = cars[_id];
        require(msg.value >= uint(_car.level*levelUpFee), "Not enough wei to level up!");
        cars[_id].level++;
        emit LevelUpSuccess(_id);
    }
    
    //create car with already level 
    function createCarWithLevel(string memory _name, uint color, uint level) public {
        taskCount++;
        uint _ready = uint(now + coolDownTime);
        Car memory _car = Car(taskCount, _name, color, level, _ready);
        cars[taskCount] = _car;
        carToOwner[taskCount] = msg.sender;
        ownerCarCount[msg.sender]++;
        emit CreatedCar(taskCount, _name, color, level, _ready);
    }
    
    //merge two cars
    function mergeTwoCar(uint _from, uint _to, string memory _name) public onlyOwnerOf(_from) onlyOwnerOf(_to) {
        require(_from != _to, "Two car must be diffirent!");
        Car memory _fromCar = cars[_from];
        Car memory _toCar = cars[_to];
        uint newColor = (_fromCar.color + _toCar.color) / 2;
        newColor = newColor % colorModulus;
        uint level = _fromCar.level + _toCar.level;
        createCarWithLevel(_name, newColor, level);
        deleteCar(_from);
        deleteCar(_to);
        emit MergeTwoCar(_from, _to, _name);
    }
    
    //delete car
    function deleteCar(uint _id) private onlyOwnerOf(_id) {
        delete cars[_id];
        delete carToOwner[_id];
        ownerCarCount[msg.sender]--;
    }
    
    modifier onlyOwnerOf(uint _id) {
        require(msg.sender == carToOwner[_id], "Must is owner of the car");
        _;
    }
}