

const paySpecJSON = require('../../assets/contracts/PaySpec.json');
//const lavaContractJSON = require('../contracts/LavaToken.json');
const tokenContractJSON = require('../../assets/contracts/_0xBitcoinToken.json');
//const nametagContractJSON = require('../contracts/NametagToken.json');
const deployedContractInfo = require('../../assets/contracts/DeployedContractInfo.json');


module.exports = class ContractInterface  {


  //getLavaContract(web3,env).methods.signatureBurned('lalala').call()



  static getTokenContract(web3,env,tokenAddress)
  {

  //  return new web3.eth.Contract(tokenContractJSON.abi,ContractInterface.getTokenContractAddress(env))
    if (tokenAddress == null )
    {
      tokenAddress = ContractInterface.getTokenContractAddress(env);
    }

    return   web3.eth.contract(tokenContractJSON.abi).at(tokenAddress)

  }


  static getPaySpecContract(web3,env)  //not a func ?s  Why not.
    {
    //  return new web3.eth.Contract(lavaContractJSON.abi,ContractInterface.getLavaContractAddress(env))
      return   web3.eth.contract(paySpecJSON.abi).at(ContractInterface.getPaySpecAddress(env))

    }


/*  static getLavaContract(web3,env)  //not a func ?s  Why not.
  {
  //  return new web3.eth.Contract(lavaContractJSON.abi,ContractInterface.getLavaContractAddress(env))
    return   web3.eth.contract(lavaContractJSON.abi).at(ContractInterface.getLavaContractAddress(env))

  }

  static getNametagContract(web3,env)  //not a func ?s  Why not.
  {
    return   web3.eth.contract(nametagContractJSON.abi).at(ContractInterface.getNametagContractAddress(env))
  }*/


  static getTokenContractAddress(env)
  {
    if(env == 'development')
    {
      return deployedContractInfo.networks.testnet.contracts._0xbitcointoken.blockchain_address;
    }else if(env == 'staging'){
      return deployedContractInfo.networks.staging.contracts._0xbitcointoken.blockchain_address;
    }else{
      return deployedContractInfo.networks.mainnet.contracts._0xbitcointoken.blockchain_address;
    }

  }


  static getPaySpecAddress(env)
  {
    if(env == 'development')
    {
      return deployedContractInfo.networks.testnet.contracts.payspec.blockchain_address;
    }else if(env == 'staging'){
      return deployedContractInfo.networks.staging.contracts.payspec.blockchain_address;
    }else{
      return deployedContractInfo.networks.mainnet.contracts.payspec.blockchain_address;
    }

  }

  static getEtherscanBaseURL(env)
  {
    if(env == 'development')
    {
      return 'https://ropsten.etherscan.io';
    }else if(env == 'staging'){
      return 'https://etherscan.io';
    }else{
      return 'https://etherscan.io';
    }

  }


/*
  static getLavaContractAddress(env)
  {
    if(env == 'development')
    {
      return deployedContractInfo.networks.testnet.contracts.lavatoken.blockchain_address;
    }else if(env == 'staging'){
      return deployedContractInfo.networks.staging.contracts.lavatoken.blockchain_address;
    }else{
      return deployedContractInfo.networks.mainnet.contracts.lavatoken.blockchain_address;
    }

  }

  static getNametagContractAddress(env)
  {
    if(env == 'development')
    {
      return deployedContractInfo.networks.testnet.contracts.nametagtoken.blockchain_address;
    }else if(env == 'staging'){
      return deployedContractInfo.networks.staging.contracts.nametagtoken.blockchain_address;
    }else{
      return deployedContractInfo.networks.mainnet.contracts.nametagtoken.blockchain_address;
    }

  }
*/




}
