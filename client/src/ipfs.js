const IPFS = require('ipfs-api');

const ipfsInstance = new IPFS({host: 'ipfs.infura.io',port: 5001,protocol: 'https'})

export default ipfsInstance;