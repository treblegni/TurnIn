import React from "react";
import FileStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import IPFSInstance from './ipfs';

import "./App.css";

export default class App extends React.Component {
	state = {
		ipfsHash: null,
		web3: null,
		account: null,
		contract: null,
		buffer: null
	};

	componentWillMount = async () => {
		try {
			// Get network provider and web3 instance.
			const web3 = await getWeb3();
			this.setState({web3}, this.initiateContract);
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3.`,
			);
			console.error(error);
		}
	};
	//initiates the contract that will manage the transaction for storage
	initiateContract = () => {
		//uses truffle-contract library to create JS representation of a smart contract
		const contract = require('truffle-contract')
			,fileStorage = contract(FileStorageContract)

		fileStorage.setProvider(this.state.web3.currentProvider);

		this.state.web3.eth.getAccounts((err,accounts) => {
			if (err) {
				console.log(err);
				return;
			}
			fileStorage.deployed()
				.then(instance => {
					this.setState({contract: instance,account: accounts[0]});

					return this.state.contract.get.call(this.state.account);
				})
				.then(result => {
					this.setState({ipfsHash: result});
				})
				.catch((e)=> {
					console.log(e)
					return;
				})
		})
	}

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

	onSubmit = (event) => {
		event.preventDefault();
		
		IPFSInstance.files.add(this.state.buffer, (err,result) => {
			if (err) {
				console.log(err)
				return;
			}
			this.state.contract.set(result[0].hash, {from: this.state.account})
				.then(response => {
					return this.state.contract.get.call(this.state.account);
				})
				.then(ipfsHash => {
					this.setState({ipfsHash});
					console.log('ipfsHash',this.state.ipfsHash);
				})
				.catch(e => {
					console.log(e);
					return;
				})
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