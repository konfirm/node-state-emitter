const EventEmitter = require('events');
const Type = require('@konfirm/is-type');

const storage = new WeakMap();

/**
 *  Associate state names and their indices, providing interchangable use
 *
 *  @class    StateEmitter
 *  @extends  {EventEmitter}
 */
class StateEmitter extends EventEmitter {
	/**
	 *  Creates an instance of StateEmitter
	 *
	 *  @param     {array}  states
	 *  @memberof  StateEmitter
	 */
	constructor(states) {
		super();

		if (!Type.isArray(states) || !states.length) {
			throw new Error(`Expected states array, got ${ JSON.stringify(states) }`);
		}

		const invalid = states
			.filter((value) => !(Type.isString(value) || Type.isSymbol(value)));

		if (invalid.length) {
			throw new Error(`Expected states array to consist of strings or symbols, got ${ JSON.stringify(invalid) }`);
		}

		storage.set(this, { states });
	}

	/**
	 *  Obtain the index of a state name
	 *
	 *  @param     {string}            name
	 *  @return    {number|undefined}  index
	 *  @memberof  StateEmitter
	 */
	index(name) {
		const { states } = storage.get(this);
		const index = states.indexOf(name);

		//  eslint-disable-next-line no-undefined
		return index >= 0 ? index : undefined;
	}

	/**
	 *  Obtain the state at the given index
	 *
	 *  @param     {number}                   index
	 *  @return    {string|symbol|undefined}  state
	 *  @memberof  StateEmitter
	 */
	state(index) {
		const { states } = storage.get(this);

		return states[index];
	}

	/**
	 *  Normalize the state
	 *
	 *  @param     {string|symbol|number}     state
	 *  @return    {string|symbol|undefined}  name
	 *  @memberof  StateEmitter
	 */
	normalize(state) {
		const normal = Type.isNumber(state) ? this.state(state) : state;

		//  verify whether the normal value is a string and recognized as state
		if (!((Type.isString(normal) || Type.isSymbol(normal)) && Type.isNumber(this.index(normal)))) {
			throw new Error(`Unknown state "${ JSON.stringify(state) }`);
		}

		return normal;
	}

	/**
	 *  Add a state listener
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {StateEmitter}          emitter
	 *  @memberof  StateEmitter
	 */
	addListener(state, listener) {
		return super.addListener(this.normalize(state), listener);
	}

	/**
	 *  Emit a state event
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {any}                    ...args
	 *  @return    {boolean}                emitted
	 *  @memberof  StateEmitter
	 */
	emit(state, ...args) {
		return super.emit(this.normalize(state), ...args);
	}

	/**
	 *  Returns a copy of the array of listeners for given state
	 *
	 *  @param     {string|symbol|number}  state
	 *  @return    {array}                 listeners
	 *  @memberof  StateEmitter
	 */
	listeners(state) {
		return super.listeners(this.normalize(state));
	}

	/**
	 *  Remove a state listener
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {any}                   ...args
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	off(state, listener) {
		return super.removeListener(this.normalize(state), listener);
	}

	/**
	 *  Register a state listener
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	on(state, listener) {
		return super.on(this.normalize(state), listener);
	}

	/**
	 *  Register a state listener which is removed after one emission
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	once(state, listener) {
		return super.once(this.normalize(state), listener);
	}

	/**
	 *  Register a state listener to be emited first
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	prependListener(state, listener) {
		return super.prependListener(this.normalize(state), listener);
	}

	/**
	 *  Register a state listener to be emited first and be removed after
	 *  one emission
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	prependOnceListener(state, listener) {
		return super.prependOnceListener(this.normalize(state), listener);
	}

	/**
	 *  Remove all state listeners for given state
	 *
	 *  @param     {string|symbol|number}  state
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	removeAllListeners(state) {
		const args = [].concat(Type.isUndefined(state) ? [] : this.normalize(state));

		return super.removeAllListeners.apply(this, args);
	}

	/**
	 *  Remove a state listener
	 *
	 *  @param     {string|symbol|number}  state
	 *  @param     {function}              listener
	 *  @return    {boolean}               emitted
	 *  @memberof  StateEmitter
	 */
	removeListener(state, listener) {
		return super.removeListener(this.normalize(state), listener);
	}
}

module.exports = StateEmitter;
