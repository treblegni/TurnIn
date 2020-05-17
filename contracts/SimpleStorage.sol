pragma solidity >=0.4.21;

contract SimpleStorage {
	string ipfsHash;

	function set(string memory iHash) public {
		ipfsHash = iHash;
	}

	function get() public view returns (string memory) {
		return ipfsHash;
	}
}