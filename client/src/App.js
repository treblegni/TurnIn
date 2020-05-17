import React from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import IPFSInstance from './ipfs';

import "./App.css";

export default class App extends React.Component {
	state = {
		ipfsHash: null,
		// web3: null,
		// contract: null,
		account: null,
		buffer: null
	};

	componentDidMount = async () => {
		try {
			const contract = require('truffle-contract')
				,fileStorage = contract(SimpleStorageContract)

			fileStorage.setProvider(this.state.web3.currentProvider);

			this.state.web3.eth.getAccounts((err,accounts) => {
				if (err) {
					console.log(err);
					return;
				}
				try {
					const instance = await fileStorage.deployed();
					this.fileStorageInstance = instance;

					this.setState({account: accounts[0]});

					const result = await this.simpleStorageInstance.get.call(accounts[0]);
					return this.setState({ipfsHash: result});
				}
				catch(e) {
					console.log(e)
				}
			})

			// Set web3, accounts, and contract to the state, and then proceed with an
			// example of interacting with the contract's methods.
			this.setState({ web3, accounts, contract: instance }, this.runExample);
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
			`Failed to load web3, accounts, or contract. Check console for details.`,
			);
			console.error(error);
		}
	};

  // runExample = async () => {
  //   const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

	getSelectedFile = (event) => {
		event.preventDefault();

		const file = event.target.files[0]
			, reader = new window.FileReader();

		reader.readAsArrayBuffer(file);
		reader.onloadend = () => {
			this.setState({buffer: Buffer(reader.result)});
			console.log("buffer", this.state.buffer);
		}
	}

	onSubmit = async (event) => {
		event.preventDefault();
		
		IPFSInstance.files.add(this.state.buffer, (err,result) => {
			if (err) {
				console.log(err)
				return;
			}
			try {
				result = await this.fileStorageInstance.set(result[0].hash, {from: this.state.account})

				const value = await this.fileStorageInstance.get.call(this.state.account)
				this.setState({ipfsHash: value})
				console.log('ipfsHash',this.state.ipfsHash)
			}
			catch(e) {
				console.log(e)
			}
		});
	}

	render() {
		if (!this.state.web3) {
			return <div>Loading Web3, accounts, and contract...</div>;
		}
		return (
			<div className="App">
				<h1>Your File:</h1>
				<div>
					<form onSubmit={this.onSubmit}>
						<input type='file' onChange={this.getSelectedFile}/>
						<button style={{height: '20px',width: '60px'}} onClick={this.onSubmit}>Submit</button>
					</form>
				</div>
			</div>
		);
	}
}