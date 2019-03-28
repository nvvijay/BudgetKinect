import {Webcam} from "./webcam";
import {ControllerDataset} from "./controller_dataset";
import * as handlers from "./handlers";
import * as gameInterface from "./gameInterface";
import * as tf from "@tensorflow/tfjs";

let NUM_CLASSES = 0;
let GAME;
const webcam = new Webcam(document.querySelector("video"));; 
const controller_dataset = new ControllerDataset(NUM_CLASSES);
let truncatedMobileNet;
// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadTruncatedMobileNet() {
  let model_url = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json';
  const mobilenet = await tf.loadLayersModel(model_url);

  // Return a model that outputs an internal activation.
  let last_layer = 'conv_pw_13_relu';
  const layer = mobilenet.getLayer(last_layer);
  return tf.model({
    inputs: mobilenet.inputs, 
    outputs: layer.output
  });
}

let model;
/**
 * Sets up and trains the classifier.
 */
async function train() {
  if (controller_dataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten(
          {inputShape: truncatedMobileNet.outputs[0].shape.slice(1)}),
      // Layer 1.
      tf.layers.dense({
        // units: ui.getDenseUnits(),
        units: 100,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(0.0001);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(controller_dataset.xs.shape[0] * 0.4);
  if (!(batchSize > 0)) {
    throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controller_dataset.xs, controller_dataset.ys, {
    batchSize,
    // epochs: ui.getEpochs(),
    epochs: 20,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        // ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
        console.log("loss: ", logs.loss);
      }
    }
  });
}


let isPredicting = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function predict() {
  // ui.isPredicting();
  while (isPredicting) {
    const predictedClass = tf.tidy(() => {
      // Capture the frame from the webcam.
      const img = webcam.capture();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model, i.e., "embeddings" of the input images.
      const embeddings = truncatedMobileNet.predict(img);

      // Make a prediction through our newly-trained model using the embeddings
      // from mobilenet as input.
      const predictions = model.predict(embeddings);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax();
    });

    const classId = (await predictedClass.data())[0];
    predictedClass.dispose();
    console.log("predicted class is  :", classId);
    jQuery("#predict")[0].innerHTML = classId;

    if(classId != 0){
      // snake.takeAction(dir);
      GAME.takeAction(classId);
      await sleep(250);
    }
    
    // ui.predictClass(classId);
    await tf.nextFrame();
  }
  // ui.donePredicting();
}

handlers.addClassHandler(label => {
  tf.tidy(() => {
    const img = webcam.capture();
    console.log("training label: ", label);
    controller_dataset.addExample(truncatedMobileNet.predict(img), label);
    // Draw the preview thumbnail.
    handlers.drawThumb(img, label);
  });
});

async function init() {
  // TODO: make game dynamic
  // new snake.Snake("viewport").init();

  try {
    await webcam.setup();
    webcam.adjustVideoSize(224,224);
    webcam.setToggleButton(jQuery("#cameraTrigger"));
  } catch (e) {
    console.error(e);
    document.getElementById('no-webcam').style.display = 'block';
  }
  truncatedMobileNet = await loadTruncatedMobileNet();

  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
  tf.tidy(() => truncatedMobileNet.predict(webcam.capture()));

  jQuery("#trainBtn").on("click", ()=>train());
  jQuery("#predictBtn").on("click", ()=>{
    isPredicting = !isPredicting;
    predict();
  });

  jQuery("#addClass").on("click", function(e) {
    // Hide the info div when num classes > 0
    jQuery("#actionInfo").hide();

    // Add a train Class
    let clone = jQuery("#clonerDiv").children().clone(true, true);
    NUM_CLASSES += 1;
    const btnId = `tc_${NUM_CLASSES}`;
    const previewBtnId = `tc_${NUM_CLASSES}_preview`;
    clone.find("#tc_i")[0].innerHTML = "Class "+NUM_CLASSES;
    clone.find("#tc_i").attr("id", btnId);
    clone.find("#tc_i_preview").attr("id", previewBtnId);
    jQuery("#actionsList").append(clone);

    var canvas = document.getElementById("tc_"+NUM_CLASSES+"_preview");
    var ctx = canvas.getContext("2d");
    ctx.rect(0, 0, 224, 224);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Click Me To Train This", 15, 110);
    ctx.fillText("Class!", 90, 140);

    jQuery("#addClass").attr("disabled", true); // @TODO: Disable AddClasses Button
    controller_dataset.setnumClasses(NUM_CLASSES);
    let previewBtn = document.getElementById(previewBtnId);
    previewBtn.addEventListener('mousedown', function(e) { handlers.handler(this)});
    previewBtn.addEventListener('mouseup', () => handlers.handler(this));
  });

  jQuery("#PlayTab").on("click", function() {
    console.log('games strted: ', gameInterface);
    GAME = new gameInterface.gameInterface();
    GAME.initGame('snake');
    // GAME.initGame('flyBird');
    GAME.mapLabelToAction({
      1: "UP",
      2: "RIGHT",
      3: "DOWN",
      4: "LEFT",
    });

    predict();
  });

  jQuery("#snakeGame").on("click", function(){
    jQuery("#gameMenu").hide();
    jQuery("#gameWindow").show();
  });

}

// Initialize the application.
init();