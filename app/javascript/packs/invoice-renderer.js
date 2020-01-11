
const $ = require('jquery');
import Vue from 'vue';

var ethUrlParser = require('eth-url-parser')

var QRCode = require('qrcode')

const ContractInterface = require('./contract-interface')

var invoiceData;
var payInvoiceInput;

var ethereumHelper;
var invoiceUUID;

var approveTokensInput;


export default class InvoiceRenderer {



    init( ethHelper, params )
    {
      ethereumHelper = ethHelper;
      this.params = params;

      invoiceUUID = params.uuid;
      //initEthContainer()


    }

    update()
    {

    }

    async onWeb3Connected() //from eth helper callback
    {
      console.log(' on web3 !!')

      var self = this;



        this.initInvoiceDataTable()

        Vue.set(payInvoiceInput, 'web3connected', true)

        await this.loadInvoiceData( self )

        setInterval(function(){  self.loadInvoiceData(self)  }, 10000);


    }

    async initInvoiceDataTable()
    {
      var self = this;

      var web3 = ethereumHelper.getWeb3Instance();

      var env = ethereumHelper.getEnvironmentName();

      var paySpecContract = ContractInterface.getPaySpecContract(web3,env)


      invoiceData = new Vue({
          el: '#invoice-data',
          data: {
             invoiceUUID: invoiceUUID,
             invoiceExists: false,
             description: '',
             referenceNumber: '',
             recipientAddress: '',
             tokenAddress: '',
             tokenAmount: '',
             paidStatus: false,
          },
          methods: {
                keyUp: function (event) {
                   //Vue.set(createInvoiceInput, 'showAvailability', false)
                },
                inputChange: function (event) {
                  console.log('input change',  this.inputName, event)

                //  self.checkNameAvailability( this.inputName );
                },
                updated() {
                  console.log('on update')

                },
                onSubmitNewInvoice: function (event){
                  console.log('pay invoice ', this.invoiceUUID)
                  //self.claimName( this.inputName )



                  self.payInvoice( this.invoiceUUID )
                }
            }
        })


          approveTokensInput = new Vue({
              el: '#approve-tokens-input',
              data: {
                 contractAddress: paySpecContract.address,
                 tokenAddress: '',
                 amount: 0,
                 paidStatus: false,
              },
              methods: {
                    keyUp: function (event) {
                       //Vue.set(createInvoiceInput, 'showAvailability', false)
                    },
                    inputChange: function (event) {
                      console.log('input change',  this.inputName, event)

                    //  self.checkNameAvailability( this.inputName );
                    },
                    onSubmit: function (event){
                      console.log('pay invoice ', this.invoiceUUID)
                      //self.claimName( this.inputName )

                      self.approveTokens(  this.tokenAddress ,this.contractAddress, this.amount  )
                    }
                }
            })


                payInvoiceInput = new Vue({
                    el: '#pay-invoice-input',
                    data: {
                       invoiceUUID: invoiceUUID,
                       paidStatus: false,

                       web3connected: false
                    },
                    methods: {
                          keyUp: function (event) {
                             //Vue.set(createInvoiceInput, 'showAvailability', false)
                          },
                          inputChange: function (event) {
                            console.log('input change',  this.inputName, event)

                          //  self.checkNameAvailability( this.inputName );
                          },
                          onSubmitNewInvoice: function (event){
                            console.log('pay invoice ', this.invoiceUUID)
                            //self.claimName( this.inputName )



                            self.payInvoice( this.invoiceUUID )
                          }
                      }
                  })

    }

    async loadInvoiceData( self )
    {

      var web3 = ethereumHelper.getWeb3Instance();

      var env = ethereumHelper.getEnvironmentName();



      var paySpecContract = ContractInterface.getPaySpecContract(web3,env)

      console.log('load invoice data')
      console.log(invoiceUUID)
      console.log( paySpecContract )

  //    console.log( paySpecContract.getDescription(invoiceUUID).call()  )


  let invoiceExists = await new Promise(resolve => {
    paySpecContract.invoiceExists(invoiceUUID,  function(error,response){
        console.log('res', response )
        console.log('error', error)
       resolve( response  );
       })
  });

    console.log('invoice exists??')
    Vue.set(invoiceData, 'invoiceExists', invoiceExists )



      let amountDue = await new Promise(resolve => {
        paySpecContract.getAmountDue(invoiceUUID,  function(error,response){
            console.log('res', response )
            console.log('error', error)
           resolve( response.toNumber() );
           })
      });
        Vue.set(invoiceData, 'tokenAmount', amountDue )

        let tokenAddress = await new Promise(resolve => {
          paySpecContract.getTokenAddress(invoiceUUID,  function(error,response){
              console.log('res', response )
              console.log('error', error)
             resolve( response );
             })
        });

        Vue.set(invoiceData, 'tokenAddress', tokenAddress )
        Vue.set(approveTokensInput, 'tokenAddress', tokenAddress )



        let recipientAddress = await new Promise(resolve => {
          paySpecContract.getRecipientAddress(invoiceUUID,  function(error,response){
              console.log('res', response )
              console.log('error', error)
             resolve( response );
             })
        });

        Vue.set(invoiceData, 'recipientAddress', recipientAddress )


      let descrip = await new Promise(resolve => {
        paySpecContract.getDescription(invoiceUUID,  function(error,response){
            console.log('res', response )
            console.log('error', error)
           resolve( response );
           })
      });

      Vue.set(invoiceData, 'description', descrip )

      let refNumber = await new Promise(resolve => {
        paySpecContract.getRefNumber(invoiceUUID,  function(error,response){
            console.log('res', response )
            console.log('error', error)
           resolve( response.toNumber() );
           })
      });
        Vue.set(invoiceData, 'referenceNumber', refNumber )

        let wasPaid = await new Promise(resolve => {
          paySpecContract.invoiceWasPaid(invoiceUUID,  function(error,response){
              console.log('res', response )
              console.log('error', error)
             resolve( response  );
             })
        });
          Vue.set(invoiceData, 'paidStatus', wasPaid )

          Vue.set(payInvoiceInput, 'paidStatus', wasPaid )
          Vue.set(approveTokensInput, 'paidStatus', wasPaid )



          Vue.nextTick(function () {
              // do something cool
              console.log('vue next tick ')

              self.generateQRCode()
            })


    }

    async generateQRCode() //from eth helper callback
    {


      var web3 = ethereumHelper.getWeb3Instance();

      var env = ethereumHelper.getEnvironmentName()


      var paySpecContract = ContractInterface.getPaySpecContract(web3,env)



      var paySpecContractAddress = paySpecContract.address;
  //    var invoiceUUID = this.params.uuid;



      //https://github.com/soldair/node-qrcode
      var options = {
        scale: 8
      }

      //ethereum:<contract_address>/approve?address=<spender>&uint256=<amount>

     //https://ethereum-magicians.org/t/tools-for-implementing-eip-681-and-eip-831/1320


      //example erc20 transfer ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1

      //http://localhost:8080/invoice.html?uuid=0x0
      var invoiceuuid = 0x0;


      var ethUrlBuildData = {
        scheme: 'ethereum',
        prefix: 'call', //? Is this correct for EIP618 ?
        target_address: paySpecContractAddress,
        function_name:  'payInvoice',
        parameters: { 'bytes32' : invoiceUUID}
      }

      var encodedData = ethUrlParser.build(ethUrlBuildData )


      console.log( ' creating QR code with: ', encodedData)
      //encodeddata = 'ethereum:0xb6ed7644c69416d67b522e20bc294a9a9b405b31/approve?address=0xb6ed7644c69416d67b522e20bc294a9a9b405b31&uint256=100'

      var qrcodecanvas = document.getElementById('qr-code-canvas')


      QRCode.toCanvas(qrcodecanvas, encodedData, options, function (error) {
        if (error) console.error(error)
        console.log('success!');
      })

    }



        async payInvoice(  invoiceUUID )
        {

          console.log('pay invoice ', invoiceUUID)



          var web3 = ethereumHelper.getWeb3Instance();

          var env = ethereumHelper.getEnvironmentName()

          console.log('env ',env)

          var connectedAddress = ethereumHelper.getConnectedAccountAddress()

          var paySpecContract = ContractInterface.getPaySpecContract(web3,env)


          //web3.eth.defaultAccount = web3.eth.accounts[0]
           //personal.unlockAccount(web3.eth.defaultAccount)


          // await web3.eth.enable();

          var response =  await new Promise(function (result,error) {
             paySpecContract.payInvoice.sendTransaction(invoiceUUID, function(err,res){
                if(err){ return error(err)}

                result(res);
             })
           });


        }

        async approveTokens( tokenAddress, contractAddress , amount  )
        {



          var web3 = ethereumHelper.getWeb3Instance();

          var env = ethereumHelper.getEnvironmentName()

          console.log('env ',env)

          var connectedAddress = ethereumHelper.getConnectedAccountAddress()

          // paySpecContract = ContractInterface.getPaySpecContract(web3,env)
          var tokenContract = ContractInterface.getTokenContract(web3,env, tokenAddress);

          //web3.eth.defaultAccount = web3.eth.accounts[0]
           //personal.unlockAccount(web3.eth.defaultAccount)


          // await web3.eth.enable();

          var response =  await new Promise(function (result,error) {
             tokenContract.approve.sendTransaction(contractAddress,amount, function(err,res){
                if(err){ return error(err)}

                result(res);
             })
           });


        }


}
