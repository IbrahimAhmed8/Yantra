---
title: How Gradient Descent Works
tags: teaching, optimization, gradient-descent, loss
---

# How Gradient Descent Works

Gradient descent is the optimization method that updates model parameters to reduce error. It uses the gradient of the loss function to decide which direction should improve the model.

The core intuition is simple: if you are standing on a hill and want to reach lower ground, you move in the steepest downhill direction. In machine learning, the "height" is the loss value, and the downhill direction comes from the gradient.

Basic loop:

1. make a prediction
2. measure the loss
3. compute the gradient
4. move parameters a little in the negative gradient direction
5. repeat

The learning rate controls how big each step is:

- too small and training is very slow
- too large and the model may overshoot or become unstable

Gradient descent and backpropagation are closely related but different:

- backpropagation computes gradients efficiently
- gradient descent uses those gradients to update weights

Common variants:

- batch gradient descent
- stochastic gradient descent
- mini-batch gradient descent

Yantra should explain gradient descent with concrete metaphors first, then connect it to parameter updates in code or math depending on the learner's level.

Typical next concepts after this topic:

- learning rate
- loss functions
- local minima and optimization challenges
- training stability
