



const $ = require('jquery');

var web3utils = require('web3-utils')


var paySpecContract = require('../../assets/contracts/PaySpec.json')
//var lavaContract = require('../contracts/LavaToken.json')
//var nametagContract = require('../contracts/NametagToken.json')
var _0xBitcoinContract = require('../../assets/contracts/_0xBitcoinToken.json')
var erc20TokenContract = require('../../assets/contracts/ERC20Interface.json')




//import LavaWalletHelper from './lava-wallet-helper'

//import TokenUtils from './token-utils'

const ContractInterface = require('./contract-interface')

import Vue from 'vue'



//const relayConfig = require('../../../relay.config').config

var ethContainer;
var packetRenderer;

var onConnectedCallback;

export default class EthHelper {


    constructor( packRenderer )
    {
         packetRenderer = packRenderer;

    }


    bindOnConnected(callback)
    {
        onConnectedCallback = callback;
    }


   async init( packRenderer )
   {
     console.log('init eth helper')

     var self = this;



     ethContainer = new Vue({
      el: '#eth-container',
      data: {
              errorMessage:null,
              connected: false,
              networkMode: 'Mainnet',
              chainId: 0,
              web3address:null,
              etherscanURL:null,
              paySpecAddress: null,
              paySpecEtherscanURL:null

            }
      });



      $('.btn-action-connect-web3').off();
      $('.btn-action-connect-web3').on('click',  async function(){

            await self.connectWeb3();

      });


   }


   async connectWeb3( ){

     var self = this;
     console.log('connect web3')


     // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                // Acccounts now exposed

                console.log('meep', window.web3.currentProvider.chainId)

                await Vue.set(ethContainer, "connected" , true);
                await self.updateEthAccountInfo(web3)

              //  web3.eth.sendTransaction({/* ... */});
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
            // Acccounts always exposed
            //web3.eth.sendTransaction({/* ... */});

            await Vue.set(ethContainer, "connected" , true);
            await self.updateEthAccountInfo(web3)
        }
        // Non-dapp browsers...
        else {
            self.renderError('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }


        if(onConnectedCallback)
        {
          onConnectedCallback()
        }

   }

   getWeb3Instance()
   {
     return this.web3;
   }

   isConnected()
   {
     return  (typeof this.getWeb3Instance() != 'undefined')
   }

   getConnectedAccountAddress()
   {

     if(typeof this.getWeb3Instance() == 'undefined')
     {
       this.renderError( 'No Connected Account. Please connect to web3 first.' )
       return;
     }

     return web3utils.toChecksumAddress( this.getWeb3Instance().eth.accounts[0] );
   }

   getEnvironmentName()
   {

    // return ethContainer.networkMode;

    if(ethContainer.chainId == '0x3')
    {
      return 'development'
    }

    return 'production'
   }

   async getCurrentEthBlockNumber()
   {

     if(typeof this.getWeb3Instance() == 'undefined')
     {
       this.renderError( 'Please connect to web3 first.' )
       return;
     }

     var web3 = this.getWeb3Instance();

    return await new Promise(function (fulfilled,error) {
           web3.eth.getBlockNumber(function(err, result)
         {
           if(err){error(err);return}
           console.log('eth block number ', result )
           fulfilled(result);
           return;
         });
      });

   }

   async updateEthAccountInfo(web3)
   {
     console.log('eth account info',web3)

     this.clearError();

     this.web3 = web3;


     var chainId = web3.currentProvider.chainId;

     await Vue.set(ethContainer, "chainId" , chainId);


     var env = 'mainnet';
     if(chainId == '0x3')
     {
        env = 'development';


        await Vue.set(ethContainer, "networkMode" , 'Ropsten');
     }

      console.log('Eth Env:',env)




     var paySpecAddress = ContractInterface.getPaySpecAddress( env );
     var etherscanAddress = ContractInterface.getEtherscanBaseURL( env );


     await Vue.set(ethContainer, "paySpecAddress" , paySpecAddress);
     await Vue.set(ethContainer, "paySpecEtherscanURL" , etherscanAddress+'/address/'+paySpecAddress);


     await Vue.set(ethContainer, "web3address" , web3.eth.accounts[0]);
     await Vue.set(ethContainer, "etherscanURL" , etherscanAddress+'/address/'+web3.eth.accounts[0] + '#tokentxns');




     await packetRenderer.update()
   }

   async renderError(message)
   {
     await Vue.set(ethContainer, "errorMessage" , message);
   }

   async clearError()
   {
     await Vue.set(ethContainer, "errorMessage" , null);
   }


    getTokenContractInstance(tokenData)
  {
    console.log('get contract instance ', tokenData.symbol)

    this.clearError();

    if(typeof this.getWeb3Instance() == 'undefined')
    {
      this.renderError( 'Please connect to web3 first.' )
      return;
    }

    var tokenAddress = tokenData.address;
    var tokenType = tokenData.tokenType;

    var tokenContractABI = this.getContractABIFromType( tokenType )

    var instance = this.getWeb3ContractInstance( tokenAddress, tokenContractABI  )

    return instance;



  }

  getContractABIFromType(tokenType)
  {
    switch(tokenType) {
        case 'masterToken':
            return _0xBitcoinContract.abi;
          break;
        //case 'lavaToken':
          //  return  lavaContract.abi;
          //break;
        default:
          return;
          // code block
      }
  }


  getWeb3ContractInstance(  contract_address, contract_abi )
  {

    console.log('get contract instance ', contract_address , contract_abi)

    var web3 = this.getWeb3Instance();

    if(contract_address == null)
    {
        renderError('Internal Error: Missing contract address')
       return;
    }

    if(contract_abi == null)
    {
      renderError('Internal Error: Missing contract ABI')
     return;
    }

    var instance =  web3.eth.contract(contract_abi).at(contract_address)

    console.log('wwww',instance)

    return instance
  }



  //personal sign typed data
   async signMsg(from,data) {

     var result = await new Promise(async resolve => {

          web3.currentProvider.sendAsync({
            method: 'eth_signTypedData_v3',
            params: [from, data],  //switched in new release
            from: from,
          },
              function(err, result) {
              if (err) {
                  return console.error(err);
              }
              const signature = result.result.substring(2);
              const r = "0x" + signature.substring(0, 64);
              const s = "0x" + signature.substring(64, 128);
              const v = parseInt(signature.substring(128, 130), 16);
              // The signature is now comprised of r, s, and v.

              console.log('packet: ',data)
              console.log('got sig! ', ('0x'+signature))

                resolve( ('0x'+signature) );
              }
          );

   });
   return result;

  }




  getContractAddress()
  {
     return deployedContractInfo.networks.mainnet.contracts._0xbitcointoken.blockchain_address;
  }

  getContractABI()
  {
     return _0xBitcoinContract.abi;
  }


}
