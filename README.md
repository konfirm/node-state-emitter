# StateEmitter

Create an Emitter with a fixed set of states which allows to listen for and emit on either the index and/or string/Symbol value;

## Getting Started

### Installation
StateEmitter is scoped packages, which means both the installation and `require` (or `import`) need the scope along with the package name.

```
$ npm install @konfirm/state-emitter
```

### Usage
A StateEmitter instance allows for states to be either a string or a Symbol, whereas Symbols have the advantage they cannot be reproduced and are therefor gauranteed unique.

#### Example with string values

```js
const StateEmitter = require('@konfirm/state-emitter');
const emitter = new StateEmitter(['foo', 'bar', 'baz']);

//  the "states" can now be referenced by both their index or the string value
emitter.on(1, () => console.log('this is bar'));
emitter.on('bar', () => console.log('this is bar too'));

emiter.emit(1);
//  this is bar
//  this is bar too
```

#### Example with Symbols

```js
const StateEmitter = require('@konfirm/state-emitter');
const foo = Symbol('foo');
const bar = Symbol('bar');
const baz = Symbol('baz');
const emitter = new StateEmitter([foo, bar, baz]);

//  the "states" can now be referenced by both their index or the Symbol value
emitter.on(1, () => console.log('this is symbol bar'));
emitter.on(bar, () => console.log('this is symbol bar too'));

emiter.emit(1);
//  this is symbol bar
//  this is symbol bar too
```

## API

### `EventEmitter` methods
As StateEmitter extends from [the native Node.js `EventEmitter`](https://nodejs.org/api/events.html), all methods are available, with the exception of:

 - `listenerCount(emitter, eventName)` is officially deprecated, StateEmitter does not implement this so the `eventName` argument is not guaranteed to be a normalized state.
 - `rawListeners(eventName)` is a new addition (Node.js v9.4.0+), StateEmitter doen not (yet) implement this method so the `eventName` argument is not guaranteed to be a normalized state.

### Additional methods

#### `index(string|symbol state)`
Obtain the index associated with a `string` or `symbol` state

```js
const StateEmitter = require('@konfirm/state-emitter');
const baz = Symbol('baz');
const emitter = new StateEmitter(['foo', 'bar', baz]);

emitter.index('foo');   //  0
emitter.index(baz);     //  2
emitter.index('nope');  //  undefined
```

#### `state(index)`
Obtain the `string` or `symbol` state associated with the index.

```js
const StateEmitter = require('@konfirm/state-emitter');
const baz = Symbol('baz');
const emitter = new StateEmitter(['foo', 'bar', baz]);

emitter.state(0);  //  'foo'
emitter.state(2);  //  Symbol('baz')
emitter.state(3);  //  undefined
```

#### `normalize(state)`
Obtain the state from either a provided index or a known value. Throws an `Error('Unknown state "<value>"')` otherwise.

```js
const StateEmitter = require('@konfirm/state-emitter');
const baz = Symbol('baz');
const emitter = new StateEmitter(['foo', 'bar', baz]);

emitter.state(0);  //  'foo'
emitter.state(2);  //  Symbol('baz')
emitter.state(3);  //  throws Error('Error('Unknown state "3"')
```


## License

MIT License Copyright (c) 2018 Rogier Spieker (Konfirm)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
