const csv=require('csvtojson')
      json2csv = require('json2csv')
      _ = require('lodash')
      NeuroNetwork = require('./Network.js');
      fs = require('fs');

const TRAINING_SET_PATH = './data/train.csv'
      TEST_SET_PATH = './data/test.csv'
      GENDER_SUB_PATH = './data/gender_submission.csv'
      OUTPUT_PATH = './output/output.csv'

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

const getRawTrainingSet = () => {
  return getJsonFromCsv(TRAINING_SET_PATH)
}

const getTestDataSet = () => {
  return getJsonFromCsv(TEST_SET_PATH)
}

const getSubmssionData = () => {
  return getJsonFromCsv(GENDER_SUB_PATH)
}

const toCsvTable = (dataSet, fieldMap) => {
  const mappedData = dataSet.map((originalEntry) => {
    return Object.keys(fieldMap).reduce((mappedObject, key) => {
      mappedObject[key] = originalEntry[fieldMap[key]]
      return mappedObject
    }, {})
  })
  const fields = Object.keys(fieldMap)
  return json2csv({ data: mappedData, fields: fields })
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
  const extractTitle = entry => entry.Name.split(', ')[1].split('.')[0]
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
    isMr:     extractTitle(entry) === "Mr" ? 1 : 0,
    isMrs:    extractTitle(entry) === "Mrs" ? 1 : 0,
    isMiss:   extractTitle(entry) === "Miss" ? 1 : 0,
    isMaster: extractTitle(entry) === "Master" ? 1 : 0,
    isDon:    extractTitle(entry) === "Don" ? 1 : 0,
    isRev:    extractTitle(entry) === "Rev" ? 1 : 0,
    isDr:     extractTitle(entry) === "Dr" ? 1 : 0,
    isMme:    extractTitle(entry) === "Mme" ? 1 : 0,
    isMs:     extractTitle(entry) === "Ms" ? 1 : 0,
    isMajor:  extractTitle(entry) === "Major" ? 1 : 0,
    isLady:   extractTitle(entry) === "Lady" ? 1 : 0,
    isSir:    extractTitle(entry) === "Sir" ? 1 : 0,
    isMlle:   extractTitle(entry) === "Mlle" ? 1 : 0,
    isCol:    extractTitle(entry) === "Col" ? 1 : 0,
    isCapt:   extractTitle(entry) === "Capt" ? 1 : 0,
    isTheCountess: extractTitle(entry) === "the Countess" ? 1 : 0,
    isJonkheer: extractTitle(entry) === "Jonkheer" ? 1 : 0,
    familySize: entry.SibSp*1 + entry.Parch*1,
    farePerPerson: entry.Fare*1 / (entry.SibSp*1 + entry.Parch*1 + 1),
  }))
}

const toInputVector = preparedDataEntry => ([
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
  preparedDataEntry.familySize,
  // preparedDataEntry.farePerPerson,
  // preparedDataEntry.isMr,
  // preparedDataEntry.isMrs,
  // preparedDataEntry.isMiss,
  // preparedDataEntry.isMaster,
  // preparedDataEntry.isDon,
  // preparedDataEntry.isRev,
  // preparedDataEntry.isDr,
  // preparedDataEntry.isMme,
  // preparedDataEntry.isMs,
  // preparedDataEntry.isMajor,
  // preparedDataEntry.isLady,
  // preparedDataEntry.isSir,
  // preparedDataEntry.isMlle,
  // preparedDataEntry.isCol,
  // preparedDataEntry.isCapt,
  // preparedDataEntry.isTheCountess,
  // preparedDataEntry.isJonkheer,
])

trainThenTest()

function trainThenTest(){
  getRawTrainingSet()
    .then(data => {
      const sanitizedSet = sanitize(data)
      const preparedSet = prepare(sanitizedSet)
      const trainingSet = preparedSet.map(entry => ({
        output: [entry.Survived],
        input: toInputVector(entry),
      }))

      const network = new NeuroNetwork.Network(17, [3, 3], 1);
      const trainer = new NeuroNetwork.Trainer(network);

      console.log("TRAINING BEGINS!!!");
      const ITERATIONS = 200000
      const LEARNING_RATE = 0.1
      trainer.train(trainingSet, {
        rate: LEARNING_RATE,
        iterations: ITERATIONS,
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
            input: toInputVector(entry),
            PassengerId: entry.PassengerId*1
          }))

          const testResult = testingSet.map(testDataEntry => {
            const activationResult = network.activate(testDataEntry.input)
            const prediction = (activationResult >= 0.5 ? 1 : 0)
            return {
              activationResult: activationResult,
              expected: testDataEntry.expected,
              prediction: prediction,
              isCorrect: testDataEntry.expected === prediction,
              PassengerId: testDataEntry.PassengerId,
            }
          })
          console.log(testResult.map(resultEntry  => ({
            survived    : resultEntry.expected,
            prediction  : resultEntry.prediction,
            isCorrect   : resultEntry.isCorrect,
          })));
          console.log('======= SUMMARY =======');
          const accuracy = testResult.filter(entry => entry.isCorrect).length / testResult.length
          console.log('Accuracy: ', accuracy);
          const csvOutput = toCsvTable(testResult, {
            'PassengerId': 'PassengerId',
            'Survived': 'prediction',
          })
          fs.writeFileSync(OUTPUT_PATH, csvOutput, 'utf8')
        })
        .catch(err => console.log(err))
    })
}
