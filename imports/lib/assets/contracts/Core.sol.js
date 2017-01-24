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
  "3": {
    "abi": [
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
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "sell_how_much",
            "type": "uint256"
          },
          {
            "name": "sell_which_token",
            "type": "address"
          },
          {
            "name": "buy_how_much",
            "type": "uint256"
          },
          {
            "name": "buy_which_token",
            "type": "address"
          }
        ],
        "name": "offer",
        "outputs": [],
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
        "outputs": [],
        "payable": true,
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
        "inputs": [],
        "name": "calcNAV",
        "outputs": [
          {
            "name": "nav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "PRICE_OF_ETHER_RELATIVE_TO_REFERENCE_ASSET",
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
        "name": "BASE_UNIT_OF_SHARES",
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
        "constant": true,
        "inputs": [],
        "name": "calcSharePrice",
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
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "cancel",
        "outputs": [],
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
            "name": "wantedValue",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [],
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
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "buy",
        "outputs": [],
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
        "inputs": [],
        "name": "calcGAV",
        "outputs": [
          {
            "name": "gav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getRegistrarAddress",
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
        "constant": true,
        "inputs": [],
        "name": "calcDelta",
        "outputs": [
          {
            "name": "delta",
            "type": "uint256"
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
        "name": "REFERENCE_ASSET_INDEX_IN_REGISTRAR",
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
            "name": "ofManager",
            "type": "address"
          },
          {
            "name": "ofRegistrar",
            "type": "address"
          },
          {
            "name": "ofTrading",
            "type": "address"
          },
          {
            "name": "ofManagmentFee",
            "type": "address"
          },
          {
            "name": "ofPerformanceFee",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "constructor"
      },
      {
        "payable": true,
        "type": "fallback"
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
      }
    ],
    "unlinked_binary": "0x6060604052670de0b6b3a7640000600f55346100005760405160a0806116f683398101604090815281516020830151918301516060840151608090940151919390915b5b60038054600160a060020a03191633600160a060020a03161790555b60038054600160a060020a03808816600160a060020a03199283161790925560006004818155670de0b6b3a764000060055542600655600880548986169416939093179283905560408051602090810184905281517faa9239f50000000000000000000000000000000000000000000000000000000081529283018490529051939094169363aa9239f59360248084019492939192918390030190829087803b156100005760325a03f1156100005750506040515160078054600160a060020a0319908116600160a060020a0393841617909155600b80548216878416179055600980548216868416179055600a8054909116918416919091179055505b50505050505b611584806101726000396000f300606060405236156101175763ffffffff60e060020a600035041663095ea7b381146101205780630f1bd81114610150578063123c047a1461017f57806318160ddd1461018c57806323b872dd146101ab5780633327570b146101e157806335b6eeda1461020057806370a082311461021f57806381025dfe1461024a57806387269729146102695780638da5cb5b146102885780639489fa84146102b157806398590ef9146102d0578063a108785a146102ee578063a442414f14610303578063a59ac6dd14610322578063a9059cbb14610343578063b37011bf14610373578063d5ab098014610392578063dcb9690c146103bb578063dd62ed3e146103da578063e6e8a3271461040b578063ff1130f11461042a575b61011e5b5b565b005b346100005761013c600160a060020a0360043516602435610449565b604080519115158252519081900360200190f35b346100005761011e600160a060020a036004358116906024359060443581169060643590608435166104b4565b005b61011e6004356106c1565b005b34610000576101996108c9565b60408051918252519081900360200190f35b346100005761013c600160a060020a03600435811690602435166044356108cf565b604080519115158252519081900360200190f35b34610000576101996109dc565b60408051918252519081900360200190f35b34610000576101996109f4565b60408051918252519081900360200190f35b3461000057610199600160a060020a03600435166109f9565b60408051918252519081900360200190f35b3461000057610199610a18565b60408051918252519081900360200190f35b3461000057610199610a24565b60408051918252519081900360200190f35b3461000057610295610a2a565b60408051600160a060020a039092168252519081900360200190f35b3461000057610199610a39565b60408051918252519081900360200190f35b346100005761011e600160a060020a0360043516602435610a49565b005b346100005761011e600435602435610ac2565b005b3461000057610199610e4b565b60408051918252519081900360200190f35b346100005761011e600160a060020a0360043516602435604435610e51565b005b346100005761013c600160a060020a0360043516602435610f63565b604080519115158252519081900360200190f35b3461000057610199611026565b60408051918252519081900360200190f35b34610000576102956112f7565b60408051600160a060020a039092168252519081900360200190f35b3461000057610199611307565b60408051918252519081900360200190f35b3461000057610199600160a060020a036004358116906024351661136c565b60408051918252519081900360200190f35b3461000057610199611399565b60408051918252519081900360200190f35b346100005761019961139f565b60408051918252519081900360200190f35b600160a060020a03338116600081815260016020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b60035433600160a060020a039081169116146104cf57610000565b6008546040805160006020918201819052825160e360020a631a42387b028152600160a060020a038089166004830152935188958b9561054e9591169363d211c3d89360248082019492918390030190829087803b156100005760325a03f11561000057505060405151600160a060020a0384811691161490506113a4565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038a8116600483015293516105bd95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038881166004830152935161062c95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b604080516000602091820181905282517ff09ea2a6000000000000000000000000000000000000000000000000000000008152600481018a9052600160a060020a0389811660248301526044820189905287811660648301529351938b169363f09ea2a69360848084019491938390030190829087803b156100005760325a03f115610000575050505b5b50505b5050505050565b60006000600060006106d48134116113a4565b846106e08115156113a4565b6106e8610a39565b600f819055349550670de0b6b3a764000090870204935084841161083e57610712600d54856113b4565b600d5560045461072290856113b4565b600490815560075460408051600060209182015281517fd0e30db000000000000000000000000000000000000000000000000000000000815291516107a594600160a060020a039094169363d0e30db0938a93818301939092909182900301818588803b156100005761235a5a03f1156100005750506040515191506113a49050565b600160a060020a0333166000908152602081905260409020546107c890876113b4565b600160a060020a0333166000908152602081905260409020556002546107ee90876113b4565b600255600f5460408051600160a060020a03331681526020810189905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b848410156108be57604051848603935061087990600160a060020a0333169085156108fc029086906000818181858888f193505050506113a4565b60408051600160a060020a03331681526020810185905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b5050505050565b60025481565b600160a060020a03831660009081526020819052604081205482901080159061091f5750600160a060020a0380851660009081526001602090815260408083203390941683529290522054829010155b80156109445750600160a060020a038316600090815260208190526040902054828101115b156109d057600160a060020a0380841660008181526020818152604080832080548801905588851680845281842080548990039055600183528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060016109d4565b5060005b5b9392505050565b6000808080806109ea611026565b030392505b505090565b600181565b600160a060020a0381166000908152602081905260409020545b919050565b670de0b6b3a764000081565b600f5481565b600354600160a060020a031681565b6000610a43611307565b90505b90565b60035433600160a060020a03908116911614610a6457610000565b81600160a060020a03166340e58ee5826000604051602001526040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b600060006000600060006000600088610b02816000600033600160a060020a0316600160a060020a031681526020019081526020016000205410156113a4565b89610b0e8115156113a4565b610b16610a39565b600f819055670de0b6b3a7640000908c02049850898910610de857600854604080516000602091820181905282517f0132d1600000000000000000000000000000000000000000000000000000000081529251600160a060020a0390941693630132d1609360048082019493918390030190829087803b156100005760325a03f11561000057505060405151985060009750505b87871015610d30576008546040805160006020918201819052825160e060020a63aa9239f5028152600481018c90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519050955085600160a060020a03166370a08231306000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f11561000057505060405151955050841515610c9657610d24565b6002548b8602811561000057049350610d2486600160a060020a031663a9059cbb33876000604051602001526040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f1156100005750506040515190506113a4565b5b866001019650610baa565b610d3c600e548a6113b4565b600e55600454610d4c908a6113dc565b600455600160a060020a033316600090815260208190526040902054610d72908c6113dc565b600160a060020a033316600090815260208190526040902055600254610d98908c6113dc565b600255600f5460408051600160a060020a0333168152602081018e905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b89891115610e3b5760408051600160a060020a03331681528b8b036020820181905282519095507fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b50505050505050505050565b600d5481565b60035460009081908190819033600160a060020a03908116911614610e7557610000565b86600160a060020a0316634579268a876000604051608001526040518263ffffffff1660e060020a02815260040180828152602001915050608060405180830381600087803b156100005760325a03f11561000057505050604051805190602001805190602001805190602001805190509350935093509350610ef882826113f5565b86600160a060020a031663d6febde887876000604051602001526040518363ffffffff1660e060020a0281526004018083815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505050505050565b600160a060020a033316600090815260208190526040812054829010801590610fa55750600160a060020a038316600090815260208190526040902054828101115b1561101757600160a060020a0333811660008181526020818152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a35060016104ae565b5060006104ae565b5b92915050565b6000600060006000600060006000600760010160009054906101000a9004600160a060020a0316600160a060020a0316630132d1606000604051602001526040518163ffffffff1660e060020a028152600401809050602060405180830381600087803b156100005760325a03f11561000057505060405151965060009550505b858510156112ed576008546040805160006020918201819052825160e060020a63aa9239f5028152600481018a90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519050935083600160a060020a03166370a08231306000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040805180516008546000602093840181905284517f6532aad9000000000000000000000000000000000000000000000000000000008152600481018c90529451929850600160a060020a039091169450636532aad9936024808201949392918390030190829087803b156100005760325a03f11561000057505060408051805160085460006020938401819052845160e060020a63aa9239f5028152600481018c90529451929750600160a060020a0380891696506341976e099592169363aa9239f593602480850194929391928390030190829087803b156100005760325a03f11561000057505050604051805190506000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040515191506112df9050878483026113b4565b96505b8460010194506110a7565b5b50505050505090565b600854600160a060020a03165b90565b600060006113136109dc565b600454909150151561132f57670de0b6b3a76400009150611358565b80151561134657670de0b6b3a76400009150611358565b60045460055482028115610000570491505b5b60058290556004819055426006555b5090565b600160a060020a038083166000908152600160209081526040808320938516835292905220545b92915050565b600e5481565b600081565b8015156113b057610000565b5b50565b60008282016113d18482108015906113cc5750838210155b6113a4565b8091505b5092915050565b60006113ea838311156113a4565b508082035b92915050565b60035433600160a060020a0390811691161461141057610000565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038681166004830152935161147f95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b6008546040805160006020918201819052825160e360020a631a42387b028152600160a060020a03808716600483018190529451949563095ea7b39591169363d211c3d8936024808501949293928390030190829087803b156100005760325a03f1156100005750505060405180519050846000604051602001526040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505600a165627a7a72305820125d3cdf43389a73d2e30c8da8a2714d0cee3319ac0142edfd303726b94609200029",
    "events": {
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
      }
    },
    "updated_at": 1485010333214,
    "links": {}
  },
  "default": {
    "abi": [
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
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "sell_how_much",
            "type": "uint256"
          },
          {
            "name": "sell_which_token",
            "type": "address"
          },
          {
            "name": "buy_how_much",
            "type": "uint256"
          },
          {
            "name": "buy_which_token",
            "type": "address"
          }
        ],
        "name": "offer",
        "outputs": [],
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
        "outputs": [],
        "payable": true,
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
        "inputs": [],
        "name": "calcNAV",
        "outputs": [
          {
            "name": "nav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "PRICE_OF_ETHER_RELATIVE_TO_REFERENCE_ASSET",
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
        "name": "BASE_UNIT_OF_SHARES",
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
        "constant": true,
        "inputs": [],
        "name": "calcSharePrice",
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
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "cancel",
        "outputs": [],
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
            "name": "wantedValue",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [],
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
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "buy",
        "outputs": [],
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
        "inputs": [],
        "name": "calcGAV",
        "outputs": [
          {
            "name": "gav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getRegistrarAddress",
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
        "constant": true,
        "inputs": [],
        "name": "calcDelta",
        "outputs": [
          {
            "name": "delta",
            "type": "uint256"
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
        "name": "REFERENCE_ASSET_INDEX_IN_REGISTRAR",
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
            "name": "ofManager",
            "type": "address"
          },
          {
            "name": "ofRegistrar",
            "type": "address"
          },
          {
            "name": "ofTrading",
            "type": "address"
          },
          {
            "name": "ofManagmentFee",
            "type": "address"
          },
          {
            "name": "ofPerformanceFee",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "constructor"
      },
      {
        "payable": true,
        "type": "fallback"
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
      }
    ],
    "unlinked_binary": "0x6060604052670de0b6b3a7640000600f55346100005760405160a0806116f683398101604090815281516020830151918301516060840151608090940151919390915b5b60038054600160a060020a03191633600160a060020a03161790555b60038054600160a060020a03808816600160a060020a03199283161790925560006004818155670de0b6b3a764000060055542600655600880548986169416939093179283905560408051602090810184905281517faa9239f50000000000000000000000000000000000000000000000000000000081529283018490529051939094169363aa9239f59360248084019492939192918390030190829087803b156100005760325a03f1156100005750506040515160078054600160a060020a0319908116600160a060020a0393841617909155600b80548216878416179055600980548216868416179055600a8054909116918416919091179055505b50505050505b611584806101726000396000f300606060405236156101175763ffffffff60e060020a600035041663095ea7b381146101205780630f1bd81114610150578063123c047a1461017f57806318160ddd1461018c57806323b872dd146101ab5780633327570b146101e157806335b6eeda1461020057806370a082311461021f57806381025dfe1461024a57806387269729146102695780638da5cb5b146102885780639489fa84146102b157806398590ef9146102d0578063a108785a146102ee578063a442414f14610303578063a59ac6dd14610322578063a9059cbb14610343578063b37011bf14610373578063d5ab098014610392578063dcb9690c146103bb578063dd62ed3e146103da578063e6e8a3271461040b578063ff1130f11461042a575b61011e5b5b565b005b346100005761013c600160a060020a0360043516602435610449565b604080519115158252519081900360200190f35b346100005761011e600160a060020a036004358116906024359060443581169060643590608435166104b4565b005b61011e6004356106c1565b005b34610000576101996108c9565b60408051918252519081900360200190f35b346100005761013c600160a060020a03600435811690602435166044356108cf565b604080519115158252519081900360200190f35b34610000576101996109dc565b60408051918252519081900360200190f35b34610000576101996109f4565b60408051918252519081900360200190f35b3461000057610199600160a060020a03600435166109f9565b60408051918252519081900360200190f35b3461000057610199610a18565b60408051918252519081900360200190f35b3461000057610199610a24565b60408051918252519081900360200190f35b3461000057610295610a2a565b60408051600160a060020a039092168252519081900360200190f35b3461000057610199610a39565b60408051918252519081900360200190f35b346100005761011e600160a060020a0360043516602435610a49565b005b346100005761011e600435602435610ac2565b005b3461000057610199610e4b565b60408051918252519081900360200190f35b346100005761011e600160a060020a0360043516602435604435610e51565b005b346100005761013c600160a060020a0360043516602435610f63565b604080519115158252519081900360200190f35b3461000057610199611026565b60408051918252519081900360200190f35b34610000576102956112f7565b60408051600160a060020a039092168252519081900360200190f35b3461000057610199611307565b60408051918252519081900360200190f35b3461000057610199600160a060020a036004358116906024351661136c565b60408051918252519081900360200190f35b3461000057610199611399565b60408051918252519081900360200190f35b346100005761019961139f565b60408051918252519081900360200190f35b600160a060020a03338116600081815260016020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b60035433600160a060020a039081169116146104cf57610000565b6008546040805160006020918201819052825160e360020a631a42387b028152600160a060020a038089166004830152935188958b9561054e9591169363d211c3d89360248082019492918390030190829087803b156100005760325a03f11561000057505060405151600160a060020a0384811691161490506113a4565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038a8116600483015293516105bd95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038881166004830152935161062c95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b604080516000602091820181905282517ff09ea2a6000000000000000000000000000000000000000000000000000000008152600481018a9052600160a060020a0389811660248301526044820189905287811660648301529351938b169363f09ea2a69360848084019491938390030190829087803b156100005760325a03f115610000575050505b5b50505b5050505050565b60006000600060006106d48134116113a4565b846106e08115156113a4565b6106e8610a39565b600f819055349550670de0b6b3a764000090870204935084841161083e57610712600d54856113b4565b600d5560045461072290856113b4565b600490815560075460408051600060209182015281517fd0e30db000000000000000000000000000000000000000000000000000000000815291516107a594600160a060020a039094169363d0e30db0938a93818301939092909182900301818588803b156100005761235a5a03f1156100005750506040515191506113a49050565b600160a060020a0333166000908152602081905260409020546107c890876113b4565b600160a060020a0333166000908152602081905260409020556002546107ee90876113b4565b600255600f5460408051600160a060020a03331681526020810189905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b848410156108be57604051848603935061087990600160a060020a0333169085156108fc029086906000818181858888f193505050506113a4565b60408051600160a060020a03331681526020810185905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b5050505050565b60025481565b600160a060020a03831660009081526020819052604081205482901080159061091f5750600160a060020a0380851660009081526001602090815260408083203390941683529290522054829010155b80156109445750600160a060020a038316600090815260208190526040902054828101115b156109d057600160a060020a0380841660008181526020818152604080832080548801905588851680845281842080548990039055600183528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060016109d4565b5060005b5b9392505050565b6000808080806109ea611026565b030392505b505090565b600181565b600160a060020a0381166000908152602081905260409020545b919050565b670de0b6b3a764000081565b600f5481565b600354600160a060020a031681565b6000610a43611307565b90505b90565b60035433600160a060020a03908116911614610a6457610000565b81600160a060020a03166340e58ee5826000604051602001526040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b600060006000600060006000600088610b02816000600033600160a060020a0316600160a060020a031681526020019081526020016000205410156113a4565b89610b0e8115156113a4565b610b16610a39565b600f819055670de0b6b3a7640000908c02049850898910610de857600854604080516000602091820181905282517f0132d1600000000000000000000000000000000000000000000000000000000081529251600160a060020a0390941693630132d1609360048082019493918390030190829087803b156100005760325a03f11561000057505060405151985060009750505b87871015610d30576008546040805160006020918201819052825160e060020a63aa9239f5028152600481018c90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519050955085600160a060020a03166370a08231306000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f11561000057505060405151955050841515610c9657610d24565b6002548b8602811561000057049350610d2486600160a060020a031663a9059cbb33876000604051602001526040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f1156100005750506040515190506113a4565b5b866001019650610baa565b610d3c600e548a6113b4565b600e55600454610d4c908a6113dc565b600455600160a060020a033316600090815260208190526040902054610d72908c6113dc565b600160a060020a033316600090815260208190526040902055600254610d98908c6113dc565b600255600f5460408051600160a060020a0333168152602081018e905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b89891115610e3b5760408051600160a060020a03331681528b8b036020820181905282519095507fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b50505050505050505050565b600d5481565b60035460009081908190819033600160a060020a03908116911614610e7557610000565b86600160a060020a0316634579268a876000604051608001526040518263ffffffff1660e060020a02815260040180828152602001915050608060405180830381600087803b156100005760325a03f11561000057505050604051805190602001805190602001805190602001805190509350935093509350610ef882826113f5565b86600160a060020a031663d6febde887876000604051602001526040518363ffffffff1660e060020a0281526004018083815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505050505050565b600160a060020a033316600090815260208190526040812054829010801590610fa55750600160a060020a038316600090815260208190526040902054828101115b1561101757600160a060020a0333811660008181526020818152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a35060016104ae565b5060006104ae565b5b92915050565b6000600060006000600060006000600760010160009054906101000a9004600160a060020a0316600160a060020a0316630132d1606000604051602001526040518163ffffffff1660e060020a028152600401809050602060405180830381600087803b156100005760325a03f11561000057505060405151965060009550505b858510156112ed576008546040805160006020918201819052825160e060020a63aa9239f5028152600481018a90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519050935083600160a060020a03166370a08231306000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040805180516008546000602093840181905284517f6532aad9000000000000000000000000000000000000000000000000000000008152600481018c90529451929850600160a060020a039091169450636532aad9936024808201949392918390030190829087803b156100005760325a03f11561000057505060408051805160085460006020938401819052845160e060020a63aa9239f5028152600481018c90529451929750600160a060020a0380891696506341976e099592169363aa9239f593602480850194929391928390030190829087803b156100005760325a03f11561000057505050604051805190506000604051602001526040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040515191506112df9050878483026113b4565b96505b8460010194506110a7565b5b50505050505090565b600854600160a060020a03165b90565b600060006113136109dc565b600454909150151561132f57670de0b6b3a76400009150611358565b80151561134657670de0b6b3a76400009150611358565b60045460055482028115610000570491505b5b60058290556004819055426006555b5090565b600160a060020a038083166000908152600160209081526040808320938516835292905220545b92915050565b600e5481565b600081565b8015156113b057610000565b5b50565b60008282016113d18482108015906113cc5750838210155b6113a4565b8091505b5092915050565b60006113ea838311156113a4565b508082035b92915050565b60035433600160a060020a0390811691161461141057610000565b6008546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038681166004830152935161147f95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f1156100005750506040515190506113a4565b6008546040805160006020918201819052825160e360020a631a42387b028152600160a060020a03808716600483018190529451949563095ea7b39591169363d211c3d8936024808501949293928390030190829087803b156100005760325a03f1156100005750505060405180519050846000604051602001526040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505600a165627a7a72305820125d3cdf43389a73d2e30c8da8a2714d0cee3319ac0142edfd303726b94609200029",
    "events": {
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
      }
    },
    "updated_at": 1485010036367
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
