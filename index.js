const csv=require('csvtojson')
const _ = require('lodash')
const NeuroNetwork = require('./Network.js');

const TRAINING_SET_PATH = './data/train.csv'
const TEST_SET_PATH = './data/test.csv'
const GENDER_SUB_PATH = './data/gender_submission.csv'

const getJsonFromCsv = function(_path){
  return new Promise(function(resolve, reject) {
    const output = []
    csv()
      .fromFile(_path)
      .on('json',(jsonObj)=>{
        output.push(jsonObj)
      })
      .on('done',(error)=>{
        resolve(output)
      })
  });
}

const getRawTrainingSet = function(){
  return getJsonFromCsv(TRAINING_SET_PATH)
}

const getTestDataSet = function(){
  return getJsonFromCsv(TEST_SET_PATH)
}

const getSubmssionData = function(){
  return getJsonFromCsv(GENDER_SUB_PATH)
}

const sanitize = function(rawSet){
  return rawSet.map(entry => ({
    PassengerId: entry.PassengerId,
    Survived: entry.Survived*1,
    Pclass: entry.Pclass*1,
    Name: entry.Name,
    Sex: entry.Sex,
    Age: entry.Age*1,
    SibSp: entry.SibSp*1,
    Parch: entry.Parch*1,
    Ticket: entry.Ticket,
    Fare: entry.Fare*1,
    Cabin: entry.Cabin,
    Embarked: entry.Embarked,
  }))
}

const prepare = function(sanitizedSet){
  const maxAge = _.max(sanitizedSet.map( entry => entry.Age ));
  const maxFare = _.max(sanitizedSet.map( entry => entry.Fare ));
  const minFare = _.min(sanitizedSet.map( entry => entry.Fare ));
  return sanitizedSet.map( entry => ({
    PassengerId: entry.PassengerId,
    Survived: entry.Survived*1,
    PcClass1: entry.PcClass === 1 ? 1 : 0,
    PcClass2: entry.PcClass === 2 ? 1 : 0,
    Name: entry.Name,
    IsMale: entry.Sex === 'male' ? 1 : 0,
    Age: entry.Age / maxAge,
    IsChild: (entry.Age > 0 && entry.Age < 10) ? 1 : 0,
    SibSp: entry.SibSp,
    Parch: entry.Parch,
    Ticket: entry.Ticket,
    Fare: (entry.Fare - minFare) / (maxFare - minFare),
    Cabin: entry.Cabin,
    IsCabinA: (entry.Cabin.split('')[0] || "") === "A" ? 1 : 0,
    IsCabinB: (entry.Cabin.split('')[0] || "") === "B" ? 1 : 0,
    IsCabinC: (entry.Cabin.split('')[0] || "") === "C" ? 1 : 0,
    IsCabinD: (entry.Cabin.split('')[0] || "") === "D" ? 1 : 0,
    IsCabinE: (entry.Cabin.split('')[0] || "") === "E" ? 1 : 0,
    IsCabinF: (entry.Cabin.split('')[0] || "") === "F" ? 1 : 0,
    IsCabinG: (entry.Cabin.split('')[0] || "") === "G" ? 1 : 0,
    IsCabinT: (entry.Cabin.split('')[0] || "") === "T" ? 1 : 0,
  }))
}

const toInputMatrix = preparedDataEntry => ([
  preparedDataEntry.PcClass1,
  preparedDataEntry.PcClass2,
  preparedDataEntry.IsMale,
  preparedDataEntry.Age,
  preparedDataEntry.IsChild,
  preparedDataEntry.SibSp,
  preparedDataEntry.Parch,
  preparedDataEntry.Fare,
  preparedDataEntry.IsCabinA,
  preparedDataEntry.IsCabinB,
  preparedDataEntry.IsCabinC,
  preparedDataEntry.IsCabinD,
  preparedDataEntry.IsCabinE,
  preparedDataEntry.IsCabinF,
  preparedDataEntry.IsCabinG,
  preparedDataEntry.IsCabinT,
])

getRawTrainingSet()
  .then(data => {
    const sanitizedSet = sanitize(data)
    const preparedSet = prepare(sanitizedSet)
    const trainingSet = preparedSet.map(entry => ({
      output: [entry.Survived],
      input: toInputMatrix(entry),
    }))

    const network = new NeuroNetwork.Network(16, [3, 3], 1);
    const trainer = new NeuroNetwork.Trainer(network);

    console.log("TRAINING BEGINS!!!");
    trainer.train(trainingSet, {
      rate: 0.1,
      iterations: 200000,
      schedule: {
        every: 5000,
        do: function(data) {
          var randomIndex = Math.floor(Math.random() * 100) + 0
          var expectedResult = trainingSet[randomIndex].output;
          var actualTestResult = network.activate(trainingSet[randomIndex].input)
          console.log("---------");
          console.log("Iteration: ", data.iterations);
          console.log("Error: ", data.error);
          console.log("Test, expectpected: ", expectedResult);
          console.log("Test, activation result: ", actualTestResult);
          console.log("Test error: ", Math.sqrt(Math.pow(expectedResult[0] - actualTestResult[0], 2)));
        }
      }
    })


    var submResult
    getSubmssionData()
      .then(_submResult => {
        submResult = _submResult
        return getTestDataSet()
      })
      .then(testData => {
        const testingSet = prepare(sanitize(testData)).map( entry => ({
          expected: submResult.filter(_entry => entry.PassengerId === _entry.PassengerId)[0].Survived * 1,
          input: toInputMatrix(entry),
        }))

        const testResult = testingSet.map(testDataEntry => {
          const activationResult = network.activate(testDataEntry.input)
          const prediction = (activationResult >= 0.5 ? 1 : 0)
          return {
            activationResult: activationResult,
            expected: testDataEntry.expected,
            prediction: prediction,
            isCorrect: testDataEntry.expected === prediction
          }
        })
        console.log(testResult);
        console.log('======= SUMMARY =======');
        const accuracy = testResult.filter(entry => entry.isCorrect).length / testResult.length
        console.log('Accuracy: ', accuracy);
      })
      .catch(err => console.log(err))
  })
