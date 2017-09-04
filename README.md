# Neuro-Titanic

This is my attempt at solving the Titanic data set challenge from Kaggle.com, using with a feedforward neuro network implemented using Synaptic, a Javascript neuro network library.

The original challenge can be found at: https://www.kaggle.com/c/titanic

## How to run
After cloning the project, run the following commands in the project directory:

- `npm install`: installs all node.js dependencies, assuming you have node installed on your system
- `node index.js`: starts training the neural network with the training data and tests it using the testing data (all the data is stored in the `/data` directory. This is directly downloaded from https://www.kaggle.com/c/titanic/data)

When you run the project, it will load in the training data from `train.csv`, applies some transformation and extract some additional hidden information from the dataset then initializes and trains a feedforward neuro network.

Once training is complete, the program will use the trained model to test against the testing data in `test.csv` and `gender_submission.csv` and puts prints the testing results and accuracy percentage.
