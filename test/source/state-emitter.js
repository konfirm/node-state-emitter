/* global source, describe, it, expect */

const StateEmitter = source('state-emitter');

function prepare(val) {
	return {
		val,
		one: new StateEmitter(val.slice(0, -1)),
		two: new StateEmitter(val.slice(1)),
	};
}

describe('StateEmitter', () => {
	const strings = [ 'foo', 'bar', 'baz' ];
	const symbols = strings.map((value) => Symbol(value));
	const spec = { strings, symbols, mixed: [ strings[0], symbols[1], strings[2] ] };

	describe('constructs', () => {
		it('expects strings and/or symbols', (next) => {
			expect(new StateEmitter([ 'foo', 'bar' ])).to.be.instanceof(StateEmitter);
			expect(new StateEmitter([ Symbol('foo'), Symbol('bar') ])).to.be.instanceof(StateEmitter);
			expect(new StateEmitter([ 'foo', Symbol('bar') ])).to.be.instanceof(StateEmitter);

			next();
		});

		it('throws on non-array and empty arrays', (next) => {
			expect(() => new StateEmitter())
				.to.throw(Error, 'Expected states array, got undefined');

			expect(() => new StateEmitter(null))
				.to.throw(Error, 'Expected states array, got null');

			expect(() => new StateEmitter(1))
				.to.throw(Error, 'Expected states array, got 1');

			expect(() => new StateEmitter('foo'))
				.to.throw(Error, 'Expected states array, got "foo"');

			expect(() => new StateEmitter(true))
				.to.throw(Error, 'Expected states array, got true');

			expect(() => new StateEmitter(false))
				.to.throw(Error, 'Expected states array, got false');

			expect(() => new StateEmitter([]))
				.to.throw(Error, 'Expected states array, got []');

			expect(() => new StateEmitter({}))
				.to.throw(Error, 'Expected states array, got {}');

			expect(() => new StateEmitter({ 0: 'foo', 1: 'bar' }))
				.to.throw(Error, 'Expected states array, got {"0":"foo","1":"bar"}');


			next();
		});


		it('throws on non-string/-symbol values', (next) => {
			expect(() => new StateEmitter([ 1, 2 ]))
				.to.throw(Error, /^Expected states array to consist of/);

			expect(() => new StateEmitter([ 'one', 2 ]))
				.to.throw(Error, /^Expected states array to consist of/);

			expect(() => new StateEmitter([ 1, 'two' ]))
				.to.throw(Error, /^Expected states array to consist of/);

			next();
		});
	});

	describe('implements index', () => {
		Object.keys(spec)
			.forEach((key) => it(key, (next) => {
				const { val, one, two } = prepare(spec[key]);

				expect(one.index(val[0])).to.equal(0);
				expect(one.index(val[1])).to.equal(1);
				expect(one.index(val[2])).to.be.undefined();

				expect(two.index(val[0])).to.be.undefined();
				expect(two.index(val[1])).to.equal(0);
				expect(two.index(val[2])).to.equal(1);

				next();
			}));
	});

	describe('implements state', () => {
		Object.keys(spec)
			.forEach((key) => it(key, (next) => {
				const { val, one, two } = prepare(spec[key]);

				expect(one.state(0)).to.equal(val[0]);
				expect(one.state(1)).to.equal(val[1]);
				expect(one.state(2)).to.be.undefined();

				expect(two.state(0)).to.equal(val[1]);
				expect(two.state(1)).to.equal(val[2]);
				expect(two.state(2)).to.be.undefined();

				next();
			}));
	});

	describe('implements normalize', () => {
		Object.keys(spec)
			.forEach((key) => it(key, (next) => {
				const { val, one, two } = prepare(spec[key]);

				expect(one.normalize(0)).to.equal(val[0]);
				expect(one.normalize(val[0])).to.equal(val[0]);
				expect(one.normalize(1)).to.equal(val[1]);
				expect(one.normalize(val[1])).to.equal(val[1]);
				expect(() => one.normalize(2)).to.throw(Error, /^Unknown state/);
				expect(() => one.normalize(val[2])).to.throw(Error, /^Unknown state/);

				expect(two.normalize(0)).to.equal(val[1]);
				expect(two.normalize(val[1])).to.equal(val[1]);
				expect(two.normalize(1)).to.equal(val[2]);
				expect(two.normalize(val[2])).to.equal(val[2]);
				expect(() => two.normalize(2)).to.throw(Error, /^Unknown state/);
				expect(() => two.normalize(val[0])).to.throw(Error, /^Unknown state/);

				next();
			}));
	});

	describe('EventEmitter inherited methods', () => Object.keys(spec)
		.forEach((key) => it(key, (next) => {
			const { val, one, two } = prepare(spec[key]);
			const collect = [];
			const listeners = [];

			expect(one.listeners(0)).to.equal([]);
			expect(one.listeners(val[0])).to.equal([]);

			one.addListener(0, () => collect.push('one.addListener.0'));
			one.addListener(val[0], () => collect.push('one.addListener.val[0]'));
			expect(one.listeners(0)).to.be.length(2);
			expect(one.listeners(val[0])).to.be.length(2);
			expect(one.listeners(0)).to.equal(one.listeners(val[0]));

			one.on(0, () => collect.push('one.on.0'));
			one.on(val[0], () => collect.push('one.on.val[0]'));
			expect(one.listeners(0)).to.be.length(4);
			expect(one.listeners(val[0])).to.be.length(4);
			expect(one.listeners(0)).to.equal(one.listeners(val[0]));

			expect(one.emit(0)).to.be.true();
			expect(collect).to.equal([
				'one.addListener.0',
				'one.addListener.val[0]',
				'one.on.0',
				'one.on.val[0]',
			]);
			expect(one.emit(val[0])).to.be.true();
			expect(collect).to.equal([
				'one.addListener.0',
				'one.addListener.val[0]',
				'one.on.0',
				'one.on.val[0]',
				'one.addListener.0',
				'one.addListener.val[0]',
				'one.on.0',
				'one.on.val[0]',
			]);
			expect(one.emit(1)).to.be.false();
			expect(one.emit(val[1])).to.be.false();

			listeners.push(...one.listeners(0));

			one.removeListener(val[0], listeners.pop());
			expect(one.listeners(0)).to.be.length(3);
			one.removeListener(0, listeners.pop());
			expect(one.listeners(val[0])).to.be.length(2);
			one.off(val[0], listeners.pop());
			expect(one.listeners(0)).to.be.length(1);
			one.off(0, listeners.pop());
			expect(one.listeners(val[0])).to.be.length(0);

			collect.length = 0;
			listeners.length = 0;

			expect(two.listeners(0)).to.equal([]);
			expect(two.listeners(val[1])).to.equal([]);

			two.once(0, () => collect.push('two.once.0'));
			two.once(val[1], () => collect.push('two.once.val[1]'));
			expect(two.listeners(0)).to.be.length(2);
			expect(two.listeners(1)).to.be.length(0);
			expect(two.listeners(val[1])).to.be.length(2);
			expect(two.listeners(val[2])).to.be.length(0);
			expect(two.listeners(0)).to.equal(two.listeners(val[1]));

			two.prependListener(0, (...args) => collect.push(...[ 'two.prependListener.0' ].concat(args)));
			two.prependOnceListener(val[1], () => collect.push('two.prependOnceListener.val[1]'));

			expect(two.listeners(0)).to.be.length(4);
			expect(two.listeners(1)).to.be.length(0);
			expect(two.listeners(val[1])).to.be.length(4);
			expect(two.listeners(val[2])).to.be.length(0);
			expect(two.listeners(0)).to.equal(two.listeners(val[1]));

			two.emit(val[1], 'two.emit.arg.1', 'two.emit.arg.2');
			expect(collect).to.equal([
				'two.prependOnceListener.val[1]',
				'two.prependListener.0',
				'two.emit.arg.1',
				'two.emit.arg.2',
				'two.once.0',
				'two.once.val[1]',
			]);

			two.emit(val[1], 'two.emit.arg.3', 'two.emit.arg.4');
			expect(collect).to.equal([
				'two.prependOnceListener.val[1]',
				'two.prependListener.0',
				'two.emit.arg.1',
				'two.emit.arg.2',
				'two.once.0',
				'two.once.val[1]',
				'two.prependListener.0',
				'two.emit.arg.3',
				'two.emit.arg.4',
			]);

			two.once(1, () => { });
			expect(two.listeners(0)).to.be.length(1);
			expect(two.listeners(1)).to.be.length(1);
			expect(two.listeners(val[1])).to.be.length(1);
			expect(two.listeners(val[2])).to.be.length(1);
			expect(two.listeners(0)).to.equal(two.listeners(val[1]));
			expect(two.listeners(1)).to.equal(two.listeners(val[2]));

			two.removeAllListeners(val[2]);

			expect(two.listeners(0)).to.be.length(1);
			expect(two.listeners(1)).to.be.length(0);
			expect(two.listeners(val[1])).to.be.length(1);
			expect(two.listeners(val[2])).to.be.length(0);
			expect(two.listeners(0)).to.equal(two.listeners(val[1]));
			expect(two.listeners(1)).to.equal(two.listeners(val[2]));

			two.removeAllListeners();

			expect(two.listeners(0)).to.be.length(0);
			expect(two.listeners(1)).to.be.length(0);
			expect(two.listeners(val[1])).to.be.length(0);
			expect(two.listeners(val[2])).to.be.length(0);
			expect(two.listeners(0)).to.equal(two.listeners(val[1]));
			expect(two.listeners(1)).to.equal(two.listeners(val[2]));

			next();
		})));
});
