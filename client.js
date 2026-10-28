window.__ModuleLoader__.load({
	id: '@zhihui6/dsh-sound-notify',
	factory(require) {
		const React = require('react');
		const h = React.createElement;
		const useState = React.useState;
		const useEffect = React.useEffect;
		const useRef = React.useRef;
		const useCallback = React.useCallback;

		const NS = 'dsh-sound-notify';
		const STORAGE_KEY = 'dsh.sound-notify.settings.v1';
		const MAX_CUSTOM_BYTES = 1500000;
		const DEBOUNCE_MS = 650;
		const ERROR_WINDOW_MS = 1500;

		const EN = {
			title: 'Sound notifications',
			desc: 'Play a sound when a task completes, fails, or reports an error.',
			enable: 'Enable sound notifications',
			enableHint: 'Sounds play in this browser, including while the window is in the background.',
			volume: 'Volume',
			events: 'Event sounds',
			eventsHint: 'Pick the tone for each event. Preview it before you commit.',
			complete: 'Task completed',
			failure: 'Task failed',
			error: 'Error prompt',
			subagents: 'Include sub-agent sessions',
			subagentsHint: 'Off means only your own conversations trigger a sound.',
			custom: 'Custom sounds',
			customHint: 'Add audio files from this computer, up to 1.5 MB each. They appear in every sound menu.',
			customEmpty: 'No custom sounds yet.',
			addFile: 'Add audio file',
			remove: 'Remove',
			tooLarge: 'That file is larger than 1.5 MB.',
			readFailed: 'That file could not be read.',
			saveFailed: 'Could not save: browser storage is full. Remove a custom sound and try again.',
			preview: 'Preview',
			test: 'Play test sound',
			reset: 'Restore defaults',
			customTag: 'Custom',
			'sound.chime': 'Chime',
			'sound.marimba': 'Marimba',
			'sound.soft': 'Soft pad',
			'sound.beep': 'Beep',
			'sound.ding': 'Ding',
			'sound.deep': 'Deep tone',
			'sound.rise': 'Rising',
			'sound.fall': 'Falling',
			'sound.alarm': 'Alarm'
		};

		const ZH = {
			title: '声音提示',
			desc: '任务完成、任务失败或出现错误提示时播放声音。',
			enable: '启用声音提示',
			enableHint: '在本浏览器中播放，窗口处于后台时同样生效。',
			volume: '音量',
			events: '事件音效',
			eventsHint: '为每种事件选择音效，可先试听确认。',
			complete: '任务完成',
			failure: '任务失败',
			error: '错误提示',
			subagents: '包含子代理会话',
			subagentsHint: '关闭后只有你本人的会话会触发声音。',
			custom: '自定义音效',
			customHint: '从本机添加音频文件，单个不超过 1.5 MB，会出现在所有音效菜单中。',
			customEmpty: '还没有自定义音效。',
			addFile: '添加音频文件',
			remove: '删除',
			tooLarge: '该文件超过 1.5 MB。',
			readFailed: '该文件无法读取。',
			saveFailed: '保存失败：浏览器存储已满。请删除一个自定义音效后重试。',
			preview: '试听',
			test: '播放测试音',
			reset: '恢复默认',
			customTag: '自定义',
			'sound.chime': '清脆铃声',
			'sound.marimba': '木琴',
			'sound.soft': '柔和长音',
			'sound.beep': '电子哔声',
			'sound.ding': '叮',
			'sound.deep': '低沉音',
			'sound.rise': '上扬',
			'sound.fall': '下降',
			'sound.alarm': '警报'
		};

		const BUILTIN = [
			{ id: 'chime', voices: [
				{ freq: 880, type: 'sine', start: 0, attack: 0.008, decay: 0.55, gain: 0.32 },
				{ freq: 1318.5, type: 'sine', start: 0.075, attack: 0.008, decay: 0.6, gain: 0.2 }
			] },
			{ id: 'marimba', voices: [
				{ freq: 587.33, type: 'triangle', start: 0, attack: 0.005, decay: 0.3, gain: 0.45 },
				{ freq: 880, type: 'triangle', start: 0.085, attack: 0.005, decay: 0.34, gain: 0.3 }
			] },
			{ id: 'soft', voices: [
				{ freq: 523.25, type: 'sine', start: 0, attack: 0.06, decay: 0.85, gain: 0.28 },
				{ freq: 783.99, type: 'sine', start: 0.04, attack: 0.08, decay: 0.75, gain: 0.16 }
			] },
			{ id: 'beep', voices: [
				{ freq: 1174.66, type: 'square', start: 0, attack: 0.004, decay: 0.1, gain: 0.14 },
				{ freq: 1174.66, type: 'square', start: 0.14, attack: 0.004, decay: 0.1, gain: 0.14 }
			] },
			{ id: 'ding', voices: [
				{ freq: 1046.5, type: 'sine', start: 0, attack: 0.004, decay: 0.5, gain: 0.3 },
				{ freq: 2093, type: 'sine', start: 0, attack: 0.004, decay: 0.3, gain: 0.09 }
			] },
			{ id: 'deep', voices: [
				{ freq: 196, type: 'sine', start: 0, attack: 0.02, decay: 0.95, gain: 0.4 },
				{ freq: 146.83, type: 'sine', start: 0.05, attack: 0.02, decay: 1.05, gain: 0.22 }
			] },
			{ id: 'rise', voices: [
				{ freq: 523.25, type: 'triangle', start: 0, attack: 0.006, decay: 0.2, gain: 0.28 },
				{ freq: 659.25, type: 'triangle', start: 0.085, attack: 0.006, decay: 0.2, gain: 0.28 },
				{ freq: 783.99, type: 'triangle', start: 0.17, attack: 0.006, decay: 0.32, gain: 0.28 }
			] },
			{ id: 'fall', voices: [
				{ freq: 783.99, type: 'triangle', start: 0, attack: 0.006, decay: 0.22, gain: 0.26 },
				{ freq: 587.33, type: 'triangle', start: 0.1, attack: 0.006, decay: 0.24, gain: 0.26 },
				{ freq: 392, type: 'triangle', start: 0.2, attack: 0.006, decay: 0.38, gain: 0.26 }
			] },
			{ id: 'alarm', voices: [
				{ freq: 880, type: 'sawtooth', start: 0, attack: 0.01, decay: 0.16, gain: 0.16 },
				{ freq: 660, type: 'sawtooth', start: 0.18, attack: 0.01, decay: 0.16, gain: 0.16 },
				{ freq: 880, type: 'sawtooth', start: 0.36, attack: 0.01, decay: 0.22, gain: 0.16 }
			] }
		];

		const BUILTIN_BY_ID = {};
		for (let i = 0; i < BUILTIN.length; i += 1) BUILTIN_BY_ID[BUILTIN[i].id] = BUILTIN[i];

		function defaults() {
			return {
				enabled: true,
				volume: 0.6,
				includeSubagents: false,
				events: { complete: 'chime', failure: 'fall', error: 'beep' },
				custom: []
			};
		}

		function clamp01(value) {
			const number = typeof value === 'number' && isFinite(value) ? value : 0.6;
			return Math.min(1, Math.max(0, number));
		}

		function normalize(raw) {
			const base = defaults();
			if (!raw || typeof raw !== 'object') return base;
			const events = raw.events && typeof raw.events === 'object' ? raw.events : {};
			const custom = Array.isArray(raw.custom)
				? raw.custom
					.filter((item) => item && typeof item.id === 'string' && typeof item.dataUrl === 'string')
					.map((item) => ({
						id: item.id,
						name: typeof item.name === 'string' && item.name !== '' ? item.name : 'audio',
						dataUrl: item.dataUrl
					}))
				: [];
			return {
				enabled: raw.enabled !== false,
				volume: clamp01(raw.volume),
				includeSubagents: raw.includeSubagents === true,
				events: {
					complete: typeof events.complete === 'string' ? events.complete : base.events.complete,
					failure: typeof events.failure === 'string' ? events.failure : base.events.failure,
					error: typeof events.error === 'string' ? events.error : base.events.error
				},
				custom
			};
		}

		let settingsCache = null;
		const settingsListeners = new Set();

		function loadSettings() {
			if (settingsCache !== null) return settingsCache;
			let raw = null;
			try {
				const text = window.localStorage.getItem(STORAGE_KEY);
				if (text !== null) raw = JSON.parse(text);
			} catch (error) {
				raw = null;
			}
			settingsCache = normalize(raw);
			return settingsCache;
		}

		function saveSettings(next) {
			const normalized = normalize(next);
			settingsCache = normalized;
			let ok = true;
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
			} catch (error) {
				ok = false;
			}
			settingsListeners.forEach((listener) => {
				try {
					listener(normalized, !ok);
				} catch (inner) {}
			});
			return ok;
		}

		function subscribeSettings(listener) {
			settingsListeners.add(listener);
			return () => {
				settingsListeners.delete(listener);
			};
		}

		let audioContext = null;

		function getAudioContext() {
			if (audioContext !== null && audioContext.state !== 'closed') return audioContext;
			const Ctor = window.AudioContext || window.webkitAudioContext;
			if (!Ctor) return null;
			try {
				audioContext = new Ctor();
			} catch (error) {
				audioContext = null;
			}
			return audioContext;
		}

		function unlockAudio() {
			const context = getAudioContext();
			if (context === null) return;
			if (context.state === 'suspended') {
				try {
					const promise = context.resume();
					if (promise && typeof promise.catch === 'function') promise.catch(() => {});
				} catch (error) {}
			}
		}

		function playVoices(voices, volume) {
			const context = getAudioContext();
			if (context === null) return;
			unlockAudio();
			let master = null;
			try {
				master = context.createGain();
				master.gain.value = clamp01(volume);
				master.connect(context.destination);
			} catch (error) {
				return;
			}
			const base = context.currentTime + 0.02;
			let span = 0.2;
			for (let i = 0; i < voices.length; i += 1) {
				const voice = voices[i];
				const attack = typeof voice.attack === 'number' ? voice.attack : 0.008;
				const decay = typeof voice.decay === 'number' ? voice.decay : 0.4;
				const start = base + (voice.start || 0);
				span = Math.max(span, (voice.start || 0) + attack + decay + 0.1);
				try {
					const oscillator = context.createOscillator();
					oscillator.type = voice.type || 'sine';
					oscillator.frequency.setValueAtTime(voice.freq, start);
					const envelope = context.createGain();
					envelope.gain.setValueAtTime(0.0001, start);
					envelope.gain.exponentialRampToValueAtTime(Math.max(voice.gain || 0.3, 0.0002), start + attack);
					envelope.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
					oscillator.connect(envelope);
					envelope.connect(master);
					oscillator.start(start);
					oscillator.stop(start + attack + decay + 0.05);
				} catch (error) {}
			}
			window.setTimeout(() => {
				try {
					master.disconnect();
				} catch (error) {}
			}, Math.ceil((span + 1) * 1000));
		}

		const activeAudio = new Set();

		function playCustomAudio(dataUrl, volume) {
			try {
				const element = new Audio(dataUrl);
				element.volume = clamp01(volume);
				activeAudio.add(element);
				const release = () => {
					activeAudio.delete(element);
					try {
						element.pause();
					} catch (error) {}
				};
				element.addEventListener('ended', release);
				element.addEventListener('error', release);
				const promise = element.play();
				if (promise && typeof promise.catch === 'function') promise.catch(() => release());
				window.setTimeout(release, 30000);
			} catch (error) {}
		}

		function resolveSound(settings, id) {
			if (typeof id !== 'string' || id.length === 0) return null;
			for (let i = 0; i < settings.custom.length; i += 1) {
				if (settings.custom[i].id === id) return { kind: 'custom', dataUrl: settings.custom[i].dataUrl };
			}
			const builtin = BUILTIN_BY_ID[id];
			if (builtin !== undefined) return { kind: 'builtin', voices: builtin.voices };
			return null;
		}

		function playSoundById(settings, id) {
			const sound = resolveSound(settings, id);
			if (sound === null) return;
			if (sound.kind === 'custom') playCustomAudio(sound.dataUrl, settings.volume);
			else playVoices(sound.voices, settings.volume);
		}

		function playEvent(settings, key) {
			if (!settings.enabled) return;
			const id = settings.events[key] || defaults().events[key];
			playSoundById(settings, id);
		}

		let translate = (key, fallback) => (fallback !== undefined ? fallback : key);

		function installLocale(ctx) {
			const locale = ctx.get('locale');
			if (!locale) return false;
			try {
				locale.register(NS, 'en', EN);
			} catch (error) {}
			try {
				locale.register(NS, 'zh', ZH);
			} catch (error) {}
			try {
				const bound = locale.bind(NS);
				translate = (key, fallback) => {
					let value = key;
					try {
						value = bound(key);
					} catch (error) {
						value = key;
					}
					if (typeof value === 'string' && value !== key) return value;
					return fallback !== undefined ? fallback : key;
				};
			} catch (error) {}
			return true;
		}

		function useLocaleTick(ctx) {
			const pair = useState(0);
			const setTick = pair[1];
			useEffect(() => {
				const locale = ctx.get('locale');
				if (!locale || typeof locale.subscribe !== 'function') return undefined;
				try {
					return locale.subscribe(() => {
						setTick((value) => value + 1);
					});
				} catch (error) {
					return undefined;
				}
			}, []);
		}

		function useSettings() {
			const pair = useState(() => loadSettings());
			const setSettings = pair[1];
			const failurePair = useState('');
			const setFailure = failurePair[1];
			useEffect(() => {
				return subscribeSettings((next, failed) => {
					setSettings(next);
					setFailure(failed ? translate('saveFailed', EN.saveFailed) : '');
				});
			}, []);
			const update = useCallback((mutator) => {
				const current = loadSettings();
				const draft = JSON.parse(JSON.stringify(current));
				mutator(draft);
				return saveSettings(draft);
			}, []);
			return { settings: pair[0], update, failure: failurePair[0] };
		}

		const STYLE = {
			page: {
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
				padding: '2px 2px 28px',
				color: 'var(--dsw-alias-label-primary)',
				fontSize: '14px',
				lineHeight: 1.5
			},
			header: { display: 'flex', flexDirection: 'column', gap: '6px' },
			h1: { margin: 0, fontSize: '16px', fontWeight: 600 },
			desc: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: '13px' },
			card: {
				border: '1px solid var(--dsw-alias-border-l1)',
				borderRadius: '10px',
				background: 'var(--dsw-alias-bg-layer-1)',
				padding: '14px 16px',
				display: 'flex',
				flexDirection: 'column',
				gap: '12px'
			},
			row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
			rowStack: { display: 'flex', flexDirection: 'column', gap: '2px' },
			label: { fontSize: '13px', fontWeight: 500 },
			hint: { color: 'var(--dsw-alias-label-secondary)', fontSize: '12px' },
			select: {
				height: '30px',
				minWidth: '170px',
				borderRadius: '8px',
				border: '1px solid var(--dsw-alias-border-l2)',
				background: 'var(--dsw-alias-bg-layer-2)',
				color: 'var(--dsw-alias-label-primary)',
				fontSize: '13px',
				padding: '0 8px',
				outline: 'none'
			},
			button: {
				height: '30px',
				padding: '0 12px',
				borderRadius: '8px',
				border: '1px solid var(--dsw-alias-border-l2)',
				background: 'var(--dsw-alias-bg-layer-2)',
				color: 'var(--dsw-alias-label-primary)',
				fontSize: '13px',
				cursor: 'pointer',
				whiteSpace: 'nowrap',
				boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
			},
			buttonPrimary: {
				height: '30px',
				padding: '0 14px',
				borderRadius: '8px',
				border: '1px solid var(--dsw-alias-brand-primary)',
				background: 'var(--dsw-alias-brand-primary)',
				color: '#fff',
				fontSize: '13px',
				cursor: 'pointer',
				whiteSpace: 'nowrap'
			},
			buttonDanger: {
				height: '26px',
				padding: '0 10px',
				borderRadius: '7px',
				border: '1px solid var(--dsw-alias-border-l2)',
				background: 'transparent',
				color: 'var(--dsw-alias-state-error-primary)',
				fontSize: '12px',
				cursor: 'pointer',
				whiteSpace: 'nowrap'
			},
			range: { width: '190px', accentColor: 'var(--dsw-alias-brand-primary)' },
			controls: { display: 'flex', alignItems: 'center', gap: '8px' },
			customRow: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: '12px',
				padding: '8px 10px',
				borderRadius: '8px',
				background: 'var(--dsw-alias-bg-layer-2)'
			},
			customName: { fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
			tag: {
				fontSize: '11px',
				padding: '1px 6px',
				borderRadius: '999px',
				border: '1px solid var(--dsw-alias-border-l2)',
				color: 'var(--dsw-alias-label-secondary)'
			},
			error: { color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' },
			footer: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
			toggle: (on) => ({
				position: 'relative',
				boxSizing: 'border-box',
				flexShrink: 0,
				width: '42px',
				height: '24px',
				borderRadius: '999px',
				border: '1px solid ' + (on ? 'transparent' : 'rgba(120, 120, 128, 0.42)'),
				background: on ? 'var(--dsw-alias-brand-primary)' : 'rgba(120, 120, 128, 0.26)',
				cursor: 'pointer',
				padding: 0,
				transition: 'background 140ms ease, border-color 140ms ease'
			}),
			knob: (on) => ({
				position: 'absolute',
				boxSizing: 'border-box',
				top: '3px',
				left: on ? '21px' : '3px',
				width: '16px',
				height: '16px',
				borderRadius: '999px',
				background: '#fff',
				border: '1px solid rgba(0, 0, 0, 0.12)',
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.32)',
				transition: 'left 140ms ease'
			})
		};

		function Toggle(props) {
			return h(
				'button',
				{
					type: 'button',
					role: 'switch',
					'aria-checked': props.checked ? 'true' : 'false',
					style: STYLE.toggle(props.checked),
					onClick: () => props.onChange(!props.checked)
				},
				h('span', { style: STYLE.knob(props.checked) })
			);
		}

		function SoundPicker(props) {
			const settings = props.settings;
			const options = [];
			for (let i = 0; i < BUILTIN.length; i += 1) {
				options.push(
					h('option', { key: BUILTIN[i].id, value: BUILTIN[i].id }, translate('sound.' + BUILTIN[i].id, BUILTIN[i].id))
				);
			}
			for (let i = 0; i < settings.custom.length; i += 1) {
				options.push(h('option', { key: settings.custom[i].id, value: settings.custom[i].id }, settings.custom[i].name));
			}
			return h(
				'div',
				{ style: STYLE.controls },
				h('select', {
					style: STYLE.select,
					value: props.value,
					onChange: (event) => props.onChange(event.target.value)
				}, options),
				h('button', {
					type: 'button',
					style: STYLE.button,
					onClick: () => {
						unlockAudio();
						playSoundById(loadSettings(), props.value);
					}
				}, translate('preview', EN.preview))
			);
		}

		function createSettingsPage(ctx) {
			return function SettingsPage() {
				useLocaleTick(ctx);
				const state = useSettings();
				const settings = state.settings;
				const update = state.update;
				const fileInputRef = useRef(null);
				const messagePair = useState('');
				const message = messagePair[0];
				const setMessage = messagePair[1];

				const changeEvent = (key) => (value) => {
					update((draft) => {
						draft.events[key] = value;
					});
				};

				const onFiles = (event) => {
					const files = event.target.files;
					if (!files || files.length === 0) return;
					setMessage('');
					const list = [];
					for (let i = 0; i < files.length; i += 1) list.push(files[i]);
					const accepted = [];
					let pending = list.length;
					let problem = '';
					const settle = () => {
						pending -= 1;
						if (pending > 0) return;
						if (accepted.length > 0) {
							update((draft) => {
								for (let i = 0; i < accepted.length; i += 1) draft.custom.push(accepted[i]);
							});
						}
						if (problem !== '') setMessage(problem);
					};
					list.forEach((file, index) => {
						if (file.size > MAX_CUSTOM_BYTES) {
							problem = translate('tooLarge', EN.tooLarge);
							settle();
							return;
						}
						const reader = new FileReader();
						reader.onload = () => {
							if (typeof reader.result === 'string') {
								accepted.push({
									id: 'custom-' + Date.now().toString(36) + '-' + index + '-' + Math.random().toString(36).slice(2, 8),
									name: file.name,
									dataUrl: reader.result
								});
							} else {
								problem = translate('readFailed', EN.readFailed);
							}
							settle();
						};
						reader.onerror = () => {
							problem = translate('readFailed', EN.readFailed);
							settle();
						};
						try {
							reader.readAsDataURL(file);
						} catch (error) {
							problem = translate('readFailed', EN.readFailed);
							settle();
						}
					});
					event.target.value = '';
				};

				const removeCustom = (id) => {
					update((draft) => {
						draft.custom = draft.custom.filter((item) => item.id !== id);
						const keys = ['complete', 'failure', 'error'];
						for (let i = 0; i < keys.length; i += 1) {
							if (draft.events[keys[i]] === id) draft.events[keys[i]] = defaults().events[keys[i]];
						}
					});
				};

				const customRows = settings.custom.length === 0
					? [h('div', { key: 'empty', style: STYLE.hint }, translate('customEmpty', EN.customEmpty))]
					: settings.custom.map((item) =>
						h(
							'div',
							{ key: item.id, style: STYLE.customRow },
							h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
								h('span', { style: STYLE.tag }, translate('customTag', 'Custom')),
								h('span', { style: STYLE.customName, title: item.name }, item.name)
							),
							h('div', { style: STYLE.controls },
								h('button', {
									type: 'button',
									style: STYLE.button,
									onClick: () => {
										unlockAudio();
										playSoundById(loadSettings(), item.id);
									}
								}, translate('preview', EN.preview)),
								h('button', {
									type: 'button',
									style: STYLE.buttonDanger,
									onClick: () => removeCustom(item.id)
								}, translate('remove', EN.remove))
							)
						)
					);

				return h(
					'div',
					{ style: STYLE.page },
					h(
						'div',
						{ style: STYLE.header },
						h('h1', { style: STYLE.h1 }, translate('title', EN.title)),
						h('p', { style: STYLE.desc }, translate('desc', EN.desc))
					),
					h(
						'div',
						{ style: STYLE.card },
						h(
							'div',
							{ style: STYLE.row },
							h('div', { style: STYLE.rowStack },
								h('span', { style: STYLE.label }, translate('enable', EN.enable)),
								h('span', { style: STYLE.hint }, translate('enableHint', EN.enableHint))
							),
							h(Toggle, {
								checked: settings.enabled,
								onChange: (value) => update((draft) => {
									draft.enabled = value;
								})
							})
						),
						h(
							'div',
							{ style: STYLE.row },
							h('span', { style: STYLE.label }, translate('volume', EN.volume)),
							h(
								'div',
								{ style: STYLE.controls },
								h('input', {
									type: 'range',
									min: 0,
									max: 1,
									step: 0.05,
									value: settings.volume,
									style: STYLE.range,
									onChange: (event) => update((draft) => {
										draft.volume = Number(event.target.value);
									}),
									onMouseUp: () => {
										unlockAudio();
										playEvent(loadSettings(), 'complete');
									}
								}),
								h('span', { style: { ...STYLE.hint, minWidth: '38px', textAlign: 'right' } }, Math.round(settings.volume * 100) + '%')
							)
						),
						h(
							'div',
							{ style: STYLE.row },
							h('div', { style: STYLE.rowStack },
								h('span', { style: STYLE.label }, translate('subagents', EN.subagents)),
								h('span', { style: STYLE.hint }, translate('subagentsHint', EN.subagentsHint))
							),
							h(Toggle, {
								checked: settings.includeSubagents,
								onChange: (value) => update((draft) => {
									draft.includeSubagents = value;
								})
							})
						)
					),
					h(
						'div',
						{ style: STYLE.card },
						h('div', { style: STYLE.rowStack },
							h('span', { style: STYLE.label }, translate('events', EN.events)),
							h('span', { style: STYLE.hint }, translate('eventsHint', EN.eventsHint))
						),
						h('div', { style: STYLE.row },
							h('span', { style: STYLE.label }, translate('complete', EN.complete)),
							h(SoundPicker, { settings, value: settings.events.complete, onChange: changeEvent('complete') })
						),
						h('div', { style: STYLE.row },
							h('span', { style: STYLE.label }, translate('failure', EN.failure)),
							h(SoundPicker, { settings, value: settings.events.failure, onChange: changeEvent('failure') })
						),
						h('div', { style: STYLE.row },
							h('span', { style: STYLE.label }, translate('error', EN.error)),
							h(SoundPicker, { settings, value: settings.events.error, onChange: changeEvent('error') })
						)
					),
					h(
						'div',
						{ style: STYLE.card },
						h('div', { style: STYLE.rowStack },
							h('span', { style: STYLE.label }, translate('custom', EN.custom)),
							h('span', { style: STYLE.hint }, translate('customHint', EN.customHint))
						),
						h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, customRows),
						h(
							'div',
							{ style: STYLE.footer },
							h('input', {
								type: 'file',
								accept: 'audio/*',
								multiple: true,
								ref: fileInputRef,
								style: { display: 'none' },
								onChange: onFiles
							}),
							h('button', {
								type: 'button',
								style: STYLE.button,
								onClick: () => {
									if (fileInputRef.current) fileInputRef.current.click();
								}
							}, translate('addFile', EN.addFile)),
							message !== '' ? h('span', { style: STYLE.error }, message) : null,
							state.failure !== '' ? h('span', { style: STYLE.error }, state.failure) : null
						)
					),
					h(
						'div',
						{ style: STYLE.footer },
						h('button', {
							type: 'button',
							style: STYLE.buttonPrimary,
							onClick: () => {
								unlockAudio();
								playEvent(loadSettings(), 'complete');
							}
						}, translate('test', EN.test)),
						h('button', {
							type: 'button',
							style: STYLE.button,
							onClick: () => {
								update((draft) => {
									const base = defaults();
									draft.enabled = base.enabled;
									draft.volume = base.volume;
									draft.includeSubagents = base.includeSubagents;
									draft.events = { complete: base.events.complete, failure: base.events.failure, error: base.events.error };
								});
							}
						}, translate('reset', EN.reset))
					)
				);
			};
		}

		function startWatcher(sessions, list) {
			const seen = new Set();
			const done = new Set();
			const offs = new Map();
			const finishedIds = [];
			let timer = null;
			let pendingError = false;
			let lastTransitionAt = 0;

			const isDone = (summary) => summary.running === false;

			const isSubagent = (summary) => summary.origin === 'subagent' || summary.parentId !== undefined;

			const hasAgentError = (id) => {
				try {
					const binding = sessions.binding(id);
					if (!binding || !binding.session || typeof binding.session.getSnapshot !== 'function') return false;
					const snapshot = binding.session.getSnapshot();
					return Boolean(snapshot && snapshot.lastAgentError);
				} catch (error) {
					return false;
				}
			};

			const flush = () => {
				timer = null;
				const ids = finishedIds.slice();
				finishedIds.length = 0;
				const errored = pendingError;
				pendingError = false;
				const settings = loadSettings();
				if (!settings.enabled) return;
				if (ids.length === 0 && !errored) return;
				let failed = false;
				for (let i = 0; i < ids.length; i += 1) {
					if (hasAgentError(ids[i])) {
						failed = true;
						break;
					}
				}
				if (failed) playEvent(settings, 'failure');
				else if (errored) playEvent(settings, 'error');
				else playEvent(settings, 'complete');
				lastTransitionAt = Date.now();
			};

			const schedule = () => {
				if (timer !== null) return;
				timer = window.setTimeout(flush, DEBOUNCE_MS);
			};

			const attach = (id) => {
				const key = String(id);
				if (offs.has(key)) return;
				let binding = null;
				try {
					binding = sessions.binding(id);
				} catch (error) {
					binding = null;
				}
				if (!binding || !binding.session || typeof binding.session.subscribe !== 'function') return;
				const face = binding.session;
				let previous = { running: false, error: null };
				try {
					const snapshot = face.getSnapshot();
					if (snapshot) previous = { running: snapshot.running === true, error: snapshot.lastAgentError || null };
				} catch (error) {}
				const off = face.subscribe(() => {
					let snapshot = null;
					try {
						snapshot = face.getSnapshot();
					} catch (error) {
						snapshot = null;
					}
					if (!snapshot) return;
					const running = snapshot.running === true;
					const message = snapshot.lastAgentError || null;
					const standaloneError = message !== null && message !== previous.error && !running && !previous.running;
					if (standaloneError && Date.now() - lastTransitionAt > ERROR_WINDOW_MS) {
						const settings = loadSettings();
						if (settings.enabled) {
							pendingError = true;
							schedule();
						}
					}
					previous = { running, error: message };
				});
				offs.set(key, off);
			};

			const initial = list.getSnapshot();
			if (initial && Array.isArray(initial.ids)) {
				for (let i = 0; i < initial.ids.length; i += 1) {
					const id = initial.ids[i];
					const summary = initial.byId ? initial.byId[id] : undefined;
					if (!summary) continue;
					const key = String(id);
					seen.add(key);
					if (isDone(summary)) done.add(key);
					attach(id);
				}
			}

			const offList = list.subscribe(() => {
				const snapshot = list.getSnapshot();
				if (!snapshot || !Array.isArray(snapshot.ids)) return;
				const settings = loadSettings();
				for (let i = 0; i < snapshot.ids.length; i += 1) {
					const id = snapshot.ids[i];
					const summary = snapshot.byId ? snapshot.byId[id] : undefined;
					if (!summary) continue;
					const key = String(id);
					const finished = isDone(summary);
					const fresh = !seen.has(key);
					if (fresh) seen.add(key);
					attach(id);
					if (finished && !fresh && !done.has(key)) {
						if (settings.includeSubagents || !isSubagent(summary)) {
							finishedIds.push(id);
							schedule();
						}
					}
					if (finished) done.add(key);
					else done.delete(key);
				}
			});

			return () => {
				try {
					offList();
				} catch (error) {}
				offs.forEach((off) => {
					try {
						off();
					} catch (error) {}
				});
				offs.clear();
				if (timer !== null) {
					window.clearTimeout(timer);
					timer = null;
				}
			};
		}

		function installWatcher(ctx) {
			ctx.effect(() => {
				let stopped = false;
				let retry = null;
				let dispose = null;
				const attempt = () => {
					retry = null;
					if (stopped || dispose !== null) return;
					const sessions = ctx.get('sessions');
					const list = sessions && sessions.list;
					if (!list || typeof list.getSnapshot !== 'function' || typeof list.subscribe !== 'function') {
						retry = window.setTimeout(attempt, 300);
						return;
					}
					dispose = startWatcher(sessions, list);
				};
				attempt();
				return () => {
					stopped = true;
					if (retry !== null) {
						window.clearTimeout(retry);
						retry = null;
					}
					if (dispose !== null) {
						const fn = dispose;
						dispose = null;
						fn();
					}
				};
			}, 'dsh-sound-notify: completion watcher');
		}

		function installUnlock(ctx) {
			ctx.effect(() => {
				const events = ['pointerdown', 'keydown', 'touchstart'];
				const handler = () => {
					unlockAudio();
					events.forEach((name) => window.removeEventListener(name, handler, true));
				};
				events.forEach((name) => window.addEventListener(name, handler, true));
				return () => {
					events.forEach((name) => window.removeEventListener(name, handler, true));
				};
			}, 'dsh-sound-notify: audio unlock');
		}

		function apply(ctx) {
			installLocale(ctx);
			installUnlock(ctx);
			installWatcher(ctx);

			ctx.slots.inject('settings.section', () =>
				ctx.slots.register(
					{
						name: 'settings.section',
						id: 'sound-notify',
						order: 22,
						label: () => translate('title', EN.title)
					},
					createSettingsPage(ctx)
				)
			);
		}

		return { name: 'dsh-sound-notify', inject: ['slots'], apply };
	}
});
