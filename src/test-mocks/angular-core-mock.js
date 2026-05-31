// Minimal mock for @angular/core used in unit tests
function Injectable(meta) {
  return function (target) {
    return target;
  };
}

function signal(initial) {
  const fn = function () {
    return fn._v;
  };
  fn._v = initial;
  fn.set = function (v) {
    fn._v = v;
  };
  fn.update = function (updater) {
    fn._v = updater(fn._v);
  };
  return fn;
}

function computed(fn) {
  const c = function () {
    return fn();
  };
  return c;
}

function effect(fn) {
  // simple immediate run; no cleanup handling
  try {
    fn();
  } catch (e) {
    // swallow errors in test mock
  }
  return function () {};
}

module.exports = { Injectable, signal, computed, effect };
