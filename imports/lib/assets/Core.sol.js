var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("Core error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Core error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("Core contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Core: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to Core.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Core not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "2": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "maxInvestment",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsSold",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "wantedShares",
            "type": "uint256"
          }
        ],
        "name": "createShares",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "offeredShares",
            "type": "uint256"
          },
          {
            "name": "wantedAmount",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumInvested",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "remaining",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumWithdrawn",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsBought",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "addrRegistrar",
            "type": "address"
          },
          {
            "name": "addrPerformanceFee",
            "type": "address"
          },
          {
            "name": "maxInvestment_",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "payable": false,
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          }
        ],
        "name": "LogString",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "LogInt",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "LogBool",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60606040819052670de0b6b3a7640000600655808061111f81395060c06040525160805160a05160008054600160a060020a0319166c0100000000000000000000000033810204179055801560545760058190555b6000600e55670de0b6b3a7640000600f5542601055601180546c01000000000000000000000000808602819004600160a060020a031992831617909255601280548584029390930492909116919091179055505050611068806100b76000396000f3606060405236156100b85760e060020a60003504622e131681146100c5578063095ea7b3146100d35780630deff91e1461014c578063123c047a1461015a57806318160ddd1461018557806323b872dd1461019357806370a08231146102a757806387269729146102da5780638da5cb5b146102e8578063a108785a146102ff578063a442414f14610339578063a9059cbb14610347578063dd62ed3e1461040b578063e6e8a32714610444578063f4d6f82814610452575b3461000257610460610002565b34610002576102c860055481565b3461000257610462600435602435600160a060020a03338116600081815260086020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b34610002576102c860045481565b3461000257610462600435600060006000600060003411158061017b575084155b1561049257610002565b34610002576102c860095481565b3461000257610462600435602435604435600160a060020a0383166000908152600760205260408120548290108015906101f45750600160a060020a0380851660009081526008602090815260408083203390941683529290522054829010155b80156102195750600160a060020a038316600090815260076020526040902054828101115b15610c4157600160a060020a03808416600081815260076020908152604080832080548801905588851680845281842080548990039055600883528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a3506001610c45565b3461000257600160a060020a03600435166000908152600760205260409020545b60408051918252519081900360200190f35b34610002576102c860065481565b3461000257610476600054600160a060020a031681565b3461000257610462600435602435600c5460009081908190819060ff161580610326575085155b8061032f575084155b15610c4c57610002565b34610002576102c860015481565b3461000257610462600435602435600160a060020a0333166000908152600760205260408120548290108015906103975750600160a060020a038316600090815260076020526040902054828101115b15610e8b57600160a060020a03338116600081815260076020908152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a3506001610146565b34610002576102c8600435602435600160a060020a03808316600090815260086020908152604080832093851683529290522054610146565b34610002576102c860025481565b34610002576102c860035481565b005b604080519115158252519081900360200190f35b60408051600160a060020a039092168252519081900360200190f35b6109175b60006000610146600060006000610e93600060006101466000600060006000600060006000600060006004600050546002600050546003600050546001600050540303019750601160005060000160009054906101000a9004600160a060020a0316600160a060020a031663a46fe83b6000604051602001526040518160e060020a028152600401809050602060405180830381600087803b156100025760325a03f11561000257505060405151975060009650505b8686101561103b576011546040805160006020918201819052825160e460020a630cf35bdd028152600481018b90529251600160a060020a039094169363cf35bdd09360248082019493918390030190829087803b156100025760325a03f1156100025750505060405180519060200150945084600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100025760325a03f1156100025750506040805180516011546000602093840181905284517fbc31c1c1000000000000000000000000000000000000000000000000000000008152600481018d90529451929950600160a060020a03909116945063bc31c1c1936024808201949392918390030190829087803b156100025760325a03f11561000257505060408051805160115460006020938401819052845160e460020a630cf35bdd028152600481018d90529451929850600160a060020a03808a1696506341976e099592169363cf35bdd093602480850194929391928390030190829087803b156100025760325a03f11561000257505050604051805190602001506000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100025760325a03f1156100025750505060405180519060200150915082600160a060020a031663d3b5dc3b6000604051602001526040518160e060020a028152600401809050602060405180830381600087803b156100025760325a03f115610002575050604080518051602082018190528282526012828401527f63616c634741563a3a707265636973696f6e0000000000000000000000000000606083015291518786029b909b019a919350600080516020611048833981519152925081900360800190a160408051602081018690528181526011818301527f63616c634741563a3a686f6c64696e6773000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a16040805160208101849052818152600e818301527f63616c634741563a3a7072696365000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051602081018a9052818152600c818301527f63616c634741563a3a6761760000000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160019095019461054c565b50670de0b6b3a76400006006556005543493501580159061094b5750600654670de0b6b3a764000090860204600560005054115b1561095557610002565b60408051602081018590528181526018818301527f637265617465207368617265733b2073656e7446756e64730000000000000000606082015290516000805160206110488339815191529181900360800190a16040805160065460208201528181526019818301527f637265617465207368617265733b207368617265507269636500000000000000606082015290516000805160206110488339815191529181900360800190a1600080516020611048833981519152670de0b6b3a76400008660066000505402811561000257604080519290910460208301528082526016828201527f637265617465207368617265733b2069662063616c63000000000000000000006060830152519081900360800190a1600654600092508390670de0b6b3a76400009087020411610b3957600160a060020a03331660009081526007602052604090208054860190556009805486019055600654670de0b6b3a764000090860260018054929091049182019055600e805482019055600c5490925060ff161515610aec57600c805460ff191660011790555b60065460408051600160a060020a03331681526020810188905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b506006546000908390670de0b6b3a7640000908702041015610c3657600654670de0b6b3a76400009086026040805192909104850360208301819052818352600d838301527f6372656174652073686172657300000000000000000000000000000000000000606084015290519092506000805160206110488339815191529181900360800190a1604051600160a060020a0333169082156108fc029083906000818181858888f193505050501515610bf157610002565b60408051600160a060020a03331681526020810183905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b506001949350505050565b5060005b9392505050565b600160a060020a03331660009081526007602052604090205486901015610c7257610002565b610c7a610496565b6006819055604080516020810192909252808252601c828201527f616e6e6968696c6174655368617265733a3a73686172655072696365000000006060830152516000805160206110488339815191529181900360800190a160066000505460001415610ce657610002565b30600160a060020a031631925082851115610d0057610002565b60065460009250670de0b6b3a7640000908702048511610ddb5733600160a060020a031660008181526007602052604080822080548a90039055600980548a9003905560065460028054670de0b6b3a7640000928c02929092049182019055600e8054829003905590519094506108fc85150291859190818181858888f193505050501515610d8e57610002565b60065460408051600160a060020a03331681526020810189905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b600654670de0b6b3a764000090870204851015610e7f5750600654604051670de0b6b3a76400009187029190910485900390600160a060020a0333169082156108fc029083906000818181858888f193505050501515610e3a57610002565b60408051600160a060020a03331681526020810183905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b50600195945050505050565b506000610146565b600e549091501515610eaf57670de0b6b3a76400009150610ed8565b801515610ec657670de0b6b3a76400009150610ed8565b600e54600f5482028115610002570491505b6040805160208101839052818152600e818301527f63616c6344656c74613b206e6176000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051600e5460208201528181526018818301527f63616c6344656c74613b20616e616c79746963732e6e61760000000000000000606082015290516000805160206110488339815191529181900360800190a160408051602081018490528181526010818301527f63616c6344656c74613b2064656c746100000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051600f546020820152818152601a818301527f63616c6344656c74613b2064656c74612e616e616c7974696373000000000000606082015290516000805160206110488339815191529181900360800190a1600f829055600e5542601055919050565b5095979650505050505050563b53f2745f01e9cc7d8317d92cca0b2e25a1e0f710c5b65c2da4002d794e399f",
    "events": {
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      "0xf8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a73736": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      "0x6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d4": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      "0xbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      "0xa95e6e2a182411e7a6f9ed114a85c3761d87f9b8f453d842c71235aa64fff99f": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          }
        ],
        "name": "LogString",
        "type": "event"
      },
      "0x3b53f2745f01e9cc7d8317d92cca0b2e25a1e0f710c5b65c2da4002d794e399f": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "LogInt",
        "type": "event"
      },
      "0x4c34c2f9a78632f29fa59aaed5514cb742fd9fbcfd7ccc2c03c85f2bbc621c47": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "LogBool",
        "type": "event"
      }
    },
    "updated_at": 1478732205887,
    "links": {}
  },
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "maxInvestment",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsSold",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "wantedShares",
            "type": "uint256"
          }
        ],
        "name": "createShares",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "offeredShares",
            "type": "uint256"
          },
          {
            "name": "wantedAmount",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumInvested",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "remaining",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumWithdrawn",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsBought",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "addrRegistrar",
            "type": "address"
          },
          {
            "name": "addrPerformanceFee",
            "type": "address"
          },
          {
            "name": "maxInvestment_",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "payable": false,
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          }
        ],
        "name": "LogString",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "LogInt",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "LogBool",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x60606040819052670de0b6b3a7640000600655808061111f81395060c06040525160805160a05160008054600160a060020a0319166c0100000000000000000000000033810204179055801560545760058190555b6000600e55670de0b6b3a7640000600f5542601055601180546c01000000000000000000000000808602819004600160a060020a031992831617909255601280548584029390930492909116919091179055505050611068806100b76000396000f3606060405236156100b85760e060020a60003504622e131681146100c5578063095ea7b3146100d35780630deff91e1461014c578063123c047a1461015a57806318160ddd1461018557806323b872dd1461019357806370a08231146102a757806387269729146102da5780638da5cb5b146102e8578063a108785a146102ff578063a442414f14610339578063a9059cbb14610347578063dd62ed3e1461040b578063e6e8a32714610444578063f4d6f82814610452575b3461000257610460610002565b34610002576102c860055481565b3461000257610462600435602435600160a060020a03338116600081815260086020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b34610002576102c860045481565b3461000257610462600435600060006000600060003411158061017b575084155b1561049257610002565b34610002576102c860095481565b3461000257610462600435602435604435600160a060020a0383166000908152600760205260408120548290108015906101f45750600160a060020a0380851660009081526008602090815260408083203390941683529290522054829010155b80156102195750600160a060020a038316600090815260076020526040902054828101115b15610c4157600160a060020a03808416600081815260076020908152604080832080548801905588851680845281842080548990039055600883528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a3506001610c45565b3461000257600160a060020a03600435166000908152600760205260409020545b60408051918252519081900360200190f35b34610002576102c860065481565b3461000257610476600054600160a060020a031681565b3461000257610462600435602435600c5460009081908190819060ff161580610326575085155b8061032f575084155b15610c4c57610002565b34610002576102c860015481565b3461000257610462600435602435600160a060020a0333166000908152600760205260408120548290108015906103975750600160a060020a038316600090815260076020526040902054828101115b15610e8b57600160a060020a03338116600081815260076020908152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a3506001610146565b34610002576102c8600435602435600160a060020a03808316600090815260086020908152604080832093851683529290522054610146565b34610002576102c860025481565b34610002576102c860035481565b005b604080519115158252519081900360200190f35b60408051600160a060020a039092168252519081900360200190f35b6109175b60006000610146600060006000610e93600060006101466000600060006000600060006000600060006004600050546002600050546003600050546001600050540303019750601160005060000160009054906101000a9004600160a060020a0316600160a060020a031663a46fe83b6000604051602001526040518160e060020a028152600401809050602060405180830381600087803b156100025760325a03f11561000257505060405151975060009650505b8686101561103b576011546040805160006020918201819052825160e460020a630cf35bdd028152600481018b90529251600160a060020a039094169363cf35bdd09360248082019493918390030190829087803b156100025760325a03f1156100025750505060405180519060200150945084600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100025760325a03f1156100025750506040805180516011546000602093840181905284517fbc31c1c1000000000000000000000000000000000000000000000000000000008152600481018d90529451929950600160a060020a03909116945063bc31c1c1936024808201949392918390030190829087803b156100025760325a03f11561000257505060408051805160115460006020938401819052845160e460020a630cf35bdd028152600481018d90529451929850600160a060020a03808a1696506341976e099592169363cf35bdd093602480850194929391928390030190829087803b156100025760325a03f11561000257505050604051805190602001506000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100025760325a03f1156100025750505060405180519060200150915082600160a060020a031663d3b5dc3b6000604051602001526040518160e060020a028152600401809050602060405180830381600087803b156100025760325a03f115610002575050604080518051602082018190528282526012828401527f63616c634741563a3a707265636973696f6e0000000000000000000000000000606083015291518786029b909b019a919350600080516020611048833981519152925081900360800190a160408051602081018690528181526011818301527f63616c634741563a3a686f6c64696e6773000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a16040805160208101849052818152600e818301527f63616c634741563a3a7072696365000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051602081018a9052818152600c818301527f63616c634741563a3a6761760000000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160019095019461054c565b50670de0b6b3a76400006006556005543493501580159061094b5750600654670de0b6b3a764000090860204600560005054115b1561095557610002565b60408051602081018590528181526018818301527f637265617465207368617265733b2073656e7446756e64730000000000000000606082015290516000805160206110488339815191529181900360800190a16040805160065460208201528181526019818301527f637265617465207368617265733b207368617265507269636500000000000000606082015290516000805160206110488339815191529181900360800190a1600080516020611048833981519152670de0b6b3a76400008660066000505402811561000257604080519290910460208301528082526016828201527f637265617465207368617265733b2069662063616c63000000000000000000006060830152519081900360800190a1600654600092508390670de0b6b3a76400009087020411610b3957600160a060020a03331660009081526007602052604090208054860190556009805486019055600654670de0b6b3a764000090860260018054929091049182019055600e805482019055600c5490925060ff161515610aec57600c805460ff191660011790555b60065460408051600160a060020a03331681526020810188905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b506006546000908390670de0b6b3a7640000908702041015610c3657600654670de0b6b3a76400009086026040805192909104850360208301819052818352600d838301527f6372656174652073686172657300000000000000000000000000000000000000606084015290519092506000805160206110488339815191529181900360800190a1604051600160a060020a0333169082156108fc029083906000818181858888f193505050501515610bf157610002565b60408051600160a060020a03331681526020810183905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b506001949350505050565b5060005b9392505050565b600160a060020a03331660009081526007602052604090205486901015610c7257610002565b610c7a610496565b6006819055604080516020810192909252808252601c828201527f616e6e6968696c6174655368617265733a3a73686172655072696365000000006060830152516000805160206110488339815191529181900360800190a160066000505460001415610ce657610002565b30600160a060020a031631925082851115610d0057610002565b60065460009250670de0b6b3a7640000908702048511610ddb5733600160a060020a031660008181526007602052604080822080548a90039055600980548a9003905560065460028054670de0b6b3a7640000928c02929092049182019055600e8054829003905590519094506108fc85150291859190818181858888f193505050501515610d8e57610002565b60065460408051600160a060020a03331681526020810189905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b600654670de0b6b3a764000090870204851015610e7f5750600654604051670de0b6b3a76400009187029190910485900390600160a060020a0333169082156108fc029083906000818181858888f193505050501515610e3a57610002565b60408051600160a060020a03331681526020810183905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b50600195945050505050565b506000610146565b600e549091501515610eaf57670de0b6b3a76400009150610ed8565b801515610ec657670de0b6b3a76400009150610ed8565b600e54600f5482028115610002570491505b6040805160208101839052818152600e818301527f63616c6344656c74613b206e6176000000000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051600e5460208201528181526018818301527f63616c6344656c74613b20616e616c79746963732e6e61760000000000000000606082015290516000805160206110488339815191529181900360800190a160408051602081018490528181526010818301527f63616c6344656c74613b2064656c746100000000000000000000000000000000606082015290516000805160206110488339815191529181900360800190a160408051600f546020820152818152601a818301527f63616c6344656c74613b2064656c74612e616e616c7974696373000000000000606082015290516000805160206110488339815191529181900360800190a1600f829055600e5542601055919050565b5095979650505050505050563b53f2745f01e9cc7d8317d92cca0b2e25a1e0f710c5b65c2da4002d794e399f",
    "events": {
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      "0xf8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a73736": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      "0x6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d4": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      "0xbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      "0xa95e6e2a182411e7a6f9ed114a85c3761d87f9b8f453d842c71235aa64fff99f": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          }
        ],
        "name": "LogString",
        "type": "event"
      },
      "0x3b53f2745f01e9cc7d8317d92cca0b2e25a1e0f710c5b65c2da4002d794e399f": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "LogInt",
        "type": "event"
      },
      "0x4c34c2f9a78632f29fa59aaed5514cb742fd9fbcfd7ccc2c03c85f2bbc621c47": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "text",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "LogBool",
        "type": "event"
      }
    },
    "updated_at": 1478730045297,
    "links": {}
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "Core";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.Core = Contract;
  }
})();
