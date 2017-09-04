const synaptic = require('synaptic'); // this line is not needed in the browser
const _ = require('lodash');
const Neuron = synaptic.Neuron,
      Layer = synaptic.Layer,
      Network = synaptic.Network,
      Trainer = synaptic.Trainer,
      Architect = synaptic.Architect;

const MyNetwork = (function(){
  const NetworkFactory = function(input, hiddens, output){

    const inputLayer = new Layer(input);
    const hiddenLayers = hiddens.map( neuronCount => new Layer(neuronCount) )
    const outputLayer = new Layer(output);

    inputLayer.project(hiddenLayers[0]);
    hiddenLayers.forEach( (hiddenLayer, hiddenLayerIndex) => {
      if (hiddenLayerIndex < hiddenLayers.length-1) {
        hiddenLayer.project(hiddenLayers[hiddenLayerIndex+1])
      }
    })
    hiddenLayers[hiddenLayers.length - 1].project(outputLayer)

    this.set({
      input: inputLayer,
      hidden: hiddenLayers,
      output: outputLayer,
      squash: Neuron.squash.ReLU,
      bias: 1
    })

  }
  NetworkFactory.prototype = new Network();
  NetworkFactory.prototype.constructor = NetworkFactory;
  return NetworkFactory;
})()



module.exports = {
  Network: MyNetwork,
  Trainer: Trainer,
};
