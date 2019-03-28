/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';


let mouseDown = false;

export let classHandler;

export function addClassHandler(handler){
  classHandler = handler;
}

// const classHandler = label => {
//   tf.tidy(() => {
//     const img = webcam.capture();
//     console.log("training label: ", label);
//     controller_dataset.addExample(truncatedMobileNet.predict(img), label);
//     // Draw the preview thumbnail.
//     game.drawThumb(img, label);
//   });
// };

export async function handler(label) {
  console.log("label: ", label)
  let id = label.closest("canvas").id;
  label = parseInt(id.split("_")[1], 10);
  mouseDown = true;
  const className = label
  sleep(2000)
    .then(() => mouseDown = false)
    .catch(err => console.err(err))

  while (mouseDown) {
    classHandler(label);
    await tf.nextFrame();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function drawThumb(img, label) {
    const thumbCanvas = document.getElementById(`tc_${label}_preview`);
    draw(img, thumbCanvas);
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

