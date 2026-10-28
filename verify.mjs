import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = fs.readFileSync(path.join(HERE, 'client.js'), 'utf8');
const KEY = 'dsh.sound-notify.settings.v1';

const oscLog = [];
const played = [];

class FakeOscillator {
	constructor() {
		this.frequency = { setValueAtTime: (v) => { this.freq = v; } };
		this.type = 'sine';
	}
	connect() {}
	start() { oscLog.push({ freq: this.freq, type: this.type }); }
	stop() {}
}

class FakeGain {
	constructor() {
		this.gain = { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
	}
	connect() {}
	disconnect() {}
}

class FakeAudioContext {
	constructor() {
		this.state = 'running';
		this.currentTime = 0;
		this.destination = {};
	}
	createOscillator() { return new FakeOscillator(); }
	createGain() { return new FakeGain(); }
	resume() { this.state = 'running'; return Promise.resolve(); }
}

class FakeAudioElement {
	constructor(src) {
		this.src = src;
		this.volume = 1;
		played.push(src);
	}
	addEventListener() {}
	play() { return Promise.resolve(); }
	pause() {}
}

const ReactStub = {
	createElement: (type, props, ...children) => ({ type, props, children }),
	useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
	useEffect: () => {},
	useRef: (init) => ({ current: init }),
	useCallback: (fn) => fn
};

const requireStub = (name) => {
	if (name === 'react') return ReactStub;
	throw new Error('unexpected require ' + name);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

globalThis.Audio = FakeAudioElement;

function createInstance(preload) {
	const storage = new Map();
	if (preload !== undefined) storage.set(KEY, JSON.stringify(preload));

	const windowStub = {
		AudioContext: FakeAudioContext,
		Audio: FakeAudioElement,
		localStorage: {
			getItem: (k) => (storage.has(k) ? storage.get(k) : null),
			setItem: (k, v) => storage.set(k, v)
		},
		setTimeout: (fn, ms) => setTimeout(fn, ms),
		clearTimeout: (id) => clearTimeout(id),
		addEventListener() {},
		removeEventListener() {},
		__ModuleLoader__: { load: (def) => { windowStub.__def = def; } }
	};

	new Function('window', 'require', SOURCE)(windowStub, requireStub);
	const mod = windowStub.__def.factory(requireStub);

	const rows = {};
	const subs = new Set();
	const faces = new Map();

	const list = {
		getSnapshot: () => {
			const ids = Object.keys(rows);
			const byId = {};
			for (const id of ids) byId[id] = rows[id];
			return { ids, byId, phase: 'ready', projectionsBySession: {} };
		},
		subscribe: (fn) => {
			subs.add(fn);
			return () => subs.delete(fn);
		}
	};

	const notifyList = () => subs.forEach((fn) => fn());

	const makeFace = (id) => {
		const state = { running: false, lastAgentError: null };
		const face = {
			getSnapshot: () => ({ sessionId: id, running: state.running, lastAgentError: state.lastAgentError }),
			subscribe: (fn) => {
				if (!faces.has(id)) faces.set(id, { state, face, listeners: new Set() });
				faces.get(id).listeners.add(fn);
				return () => faces.get(id).listeners.delete(fn);
			}
		};
		faces.set(id, { state, face, listeners: new Set() });
		return faces.get(id);
	};

	const sessions = {
		list,
		binding: (id) => (faces.has(id) ? { sessionId: id, session: faces.get(id).face } : undefined)
	};

	const registrations = [];
	const effects = [];

	const ctx = {
		get: (key) => {
			if (key === 'sessions') return sessions;
			if (key === 'locale') return null;
			return undefined;
		},
		effect: (fn, label) => {
			const dispose = fn();
			effects.push({ label, dispose });
			return () => {};
		},
		slots: {
			inject: (key, cb) => cb(),
			register: (options, component) => {
				registrations.push({ options, component });
				return () => {};
			}
		}
	};

	mod.apply(ctx);

	return {
		rows,
		notifyList,
		makeFace,
		registrations,
		effects,
		storage,
		notifyFace: (id) => (faces.get(id)?.listeners || new Set()).forEach((fn) => fn())
	};
}

function report(label, ok, detail) {
	console.log((ok ? 'PASS ' : 'FAIL ') + label + (detail === undefined ? '' : ' :: ' + detail));
	if (!ok) process.exitCode = 1;
}

const instance = createInstance();
console.log('module exports:', Object.keys(instance).length > 0 ? 'loaded' : 'missing');
console.log('slot registrations:', instance.registrations.map((r) => r.options.id + '@' + r.options.name));
console.log('effects:', instance.effects.map((e) => e.label));

async function finish(inst, id, error) {
	const face = inst.makeFace(id);
	inst.rows[id] = { id, running: true, displayTitle: id };
	face.state.running = true;
	inst.notifyList();
	await sleep(20);
	face.state.running = false;
	face.state.lastAgentError = error;
	inst.rows[id] = { id, running: false, displayTitle: id };
	inst.notifyList();
	inst.notifyFace(id);
	await sleep(900);
}

oscLog.length = 0;
await finish(instance, 's1', null);
report('complete plays chime (880)', oscLog[0]?.freq === 880, JSON.stringify(oscLog.map((o) => o.freq)));

oscLog.length = 0;
await finish(instance, 's2', 'boom');
report('failure plays fall (783.99)', oscLog[0]?.freq === 783.99, JSON.stringify(oscLog.map((o) => o.freq)));

oscLog.length = 0;
instance.rows.s3 = { id: 's3', running: false, displayTitle: 's3' };
instance.notifyList();
await sleep(900);
report('already-finished session stays silent', oscLog.length === 0, JSON.stringify(oscLog.map((o) => o.freq)));

oscLog.length = 0;
const sub = instance.makeFace('s4');
instance.rows.s4 = { id: 's4', running: true, displayTitle: 's4', origin: 'subagent', parentId: 's1' };
sub.state.running = true;
instance.notifyList();
await sleep(20);
sub.state.running = false;
instance.rows.s4 = { id: 's4', running: false, displayTitle: 's4', origin: 'subagent', parentId: 's1' };
instance.notifyList();
await sleep(900);
report('subagent transition stays silent', oscLog.length === 0, JSON.stringify(oscLog.map((o) => o.freq)));

oscLog.length = 0;
const idle = instance.makeFace('s5');
instance.rows.s5 = { id: 's5', running: false, displayTitle: 's5' };
instance.notifyList();
await sleep(1700);
idle.state.lastAgentError = 'network down';
instance.notifyFace('s5');
await sleep(900);
report('standalone error plays beep (1174.66)', oscLog[0]?.freq === 1174.66, JSON.stringify(oscLog.map((o) => o.freq)));

const customInstance = createInstance({
	enabled: true,
	volume: 0.5,
	includeSubagents: false,
	events: { complete: 'mine', failure: 'fall', error: 'beep' },
	custom: [{ id: 'mine', name: 'Mine', dataUrl: 'data:audio/wav;base64,QUJD' }]
});

played.length = 0;
oscLog.length = 0;
await finish(customInstance, 'c1', null);
report('custom sound used for complete', played[0] === 'data:audio/wav;base64,QUJD' && oscLog.length === 0, JSON.stringify(played));

function countNodes(node) {
	if (node === null || node === undefined) return 0;
	if (Array.isArray(node)) return node.reduce((total, child) => total + countNodes(child), 0);
	if (typeof node !== 'object') return 0;
	let total = 1;
	if (Array.isArray(node.children)) {
		for (const child of node.children) total += countNodes(child);
	}
	return total;
}

function expand(node) {
	if (node === null || node === undefined) return node;
	if (Array.isArray(node)) return node.map(expand);
	if (typeof node !== 'object') return node;
	if (typeof node.type === 'function') return expand(node.type(node.props || {}));
	return { ...node, children: (node.children || []).map(expand) };
}

const counts = {};
const rendered = {};
for (const [label, inst] of [['default', instance], ['with custom', customInstance]]) {
	rendered[label] = expand(inst.registrations[0].component({ close: () => {} }));
	counts[label] = countNodes(rendered[label]);
	report('settings page renders (' + label + ')', counts[label] > 5, 'nodes=' + counts[label]);
}
report('custom row adds nodes', counts['with custom'] > counts.default, counts.default + ' -> ' + counts['with custom']);

function collect(node, predicate, out) {
	if (node === null || node === undefined) return out;
	if (Array.isArray(node)) {
		for (const child of node) collect(child, predicate, out);
		return out;
	}
	if (typeof node !== 'object') return out;
	if (predicate(node)) out.push(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) collect(child, predicate, out);
	}
	return out;
}

const switches = collect(rendered.default, (n) => n.props && n.props.role === 'switch', []);
report('page renders switches', switches.length >= 2, 'count=' + switches.length);

const offSwitch = switches.find((s) => s.props['aria-checked'] === 'false');
const onSwitch = switches.find((s) => s.props['aria-checked'] === 'true');
report('has both on and off switches', Boolean(offSwitch) && Boolean(onSwitch));

if (offSwitch) {
	const bg = offSwitch.props.style.background;
	const knob = offSwitch.children[0];
	report('off track is a visible gray', /rgba\(120, 120, 128, 0\.26\)/.test(bg), bg);
	report('off track has a visible border', /rgba\(120, 120, 128, 0\.42\)/.test(offSwitch.props.style.border), offSwitch.props.style.border);
	report('knob has border and shadow', /rgba\(0, 0, 0, 0\.12\)/.test(knob.props.style.border) && Boolean(knob.props.style.boxShadow), knob.props.style.border);
}

if (onSwitch) {
	report('on track uses brand color', /brand-primary/.test(onSwitch.props.style.background), onSwitch.props.style.background);
}

instance.effects.forEach((e) => { if (typeof e.dispose === 'function') e.dispose(); });
customInstance.effects.forEach((e) => { if (typeof e.dispose === 'function') e.dispose(); });
console.log('disposed cleanly');
