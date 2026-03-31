---
title: What Backpropagation Is
tags: teaching, backpropagation, deep-learning, gradients
---

# What Backpropagation Is

Backpropagation is the method neural networks use to figure out how each weight contributed to the final error. Once the network knows that, it can update the weights in the direction that should reduce the error next time.

A useful mental model is this:

- the network makes a prediction
- we compare that prediction to the correct answer
- we measure the mistake with a loss function
- backpropagation sends blame information backward through the network

That backward flow uses the chain rule from calculus. The chain rule lets us compute how a small change in one earlier weight would affect the final loss.

Simple step-by-step view:

1. do a forward pass to get the prediction
2. compute the loss
3. compute gradients of the loss with respect to each parameter
4. send those gradients backward layer by layer
5. update the parameters with gradient descent

Why this matters:

- without backpropagation, the network would not know what to change
- with backpropagation, learning becomes targeted instead of random

Common misconception:

- backpropagation is not the same as gradient descent

Backpropagation computes the gradients. Gradient descent uses those gradients to update the weights.

When Yantra explains backpropagation to beginners, it should start with the idea of assigning credit or blame for an error. For more advanced learners, it can introduce derivatives, partial derivatives, and the chain rule.
