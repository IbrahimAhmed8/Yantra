---
title: What Overfitting Means
tags: teaching, overfitting, generalization, evaluation
---

# What Overfitting Means

Overfitting happens when a model learns the training data too specifically and performs poorly on new unseen examples. The model appears strong during training but fails to generalize.

A simple intuition:

- good learning captures real patterns
- overfitting captures noise, quirks, and accidental details

Common signs of overfitting:

- training accuracy keeps improving
- validation or test accuracy gets worse or stops improving
- the model behaves confidently on familiar examples but badly on fresh ones

Why it happens:

- too little data
- too much model capacity for the task
- weak regularization
- training too long without monitoring validation results

Common ways to reduce overfitting:

- collect more data
- use data augmentation when appropriate
- simplify the model
- add regularization
- use early stopping
- evaluate on a clean validation set

Yantra should frame overfitting as one of the central ideas in machine learning. A model is not useful just because it memorized the training set. Real learning means performing well on examples it has not already seen.

This topic connects naturally to:

- training vs testing
- bias and variance
- model selection
- regularization
