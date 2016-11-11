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
      throw new Error("CoreProtocol error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("CoreProtocol error: contract binary not set. Can't deploy new instance.");
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

      throw new Error("CoreProtocol contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of CoreProtocol: " + unlinked_libraries);
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
      throw new Error("Invalid address passed to CoreProtocol.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: CoreProtocol not deployed or address not set.");
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
    "unlinked_binary": "0x6060604052670de0b6b3a764000060055560ac80601c6000396000f360606040523615604e5760e060020a60003504622e1316811460525780630deff91e14605e5780638726972914606a578063a442414f146076578063e6e8a327146082578063f4d6f82814608e575b6002565b34600257609a60045481565b34600257609a60035481565b34600257609a60055481565b34600257609a60005481565b34600257609a60015481565b34600257609a60025481565b60408051918252519081900360200190f3",
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
    "updated_at": 1478732205931,
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
    "unlinked_binary": "0x6060604052670de0b6b3a764000060055560ac80601c6000396000f360606040523615604e5760e060020a60003504622e1316811460525780630deff91e14605e5780638726972914606a578063a442414f146076578063e6e8a327146082578063f4d6f82814608e575b6002565b34600257609a60045481565b34600257609a60035481565b34600257609a60055481565b34600257609a60005481565b34600257609a60015481565b34600257609a60025481565b60408051918252519081900360200190f3",
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
    "updated_at": 1478730045304,
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

  Contract.contract_name   = Contract.prototype.contract_name   = "CoreProtocol";
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
    window.CoreProtocol = Contract;
  }
})();
