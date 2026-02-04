// App.tsx
import { createSignal } from 'solid-js';
import { Blinker } from './components/Blinker';
import { EncodingType } from './utils/encoder';

const App = () => {
  const [message, setMessage] = createSignal('TEST123');
  const [hz, setHz] = createSignal(15);
  const [encoding, setEncoding] = createSignal<EncodingType>('Manchester');
  const [isActive, setIsActive] = createSignal(false);

  return (
    <div class="min-h-screen bg-black text-white font-sans p-4 flex flex-col items-center justify-center">
      <main class="w-full max-w-sm border border-zinc-800 p-6 space-y-8 bg-zinc-950">
        <section>
          <h1 class="text-sm font-bold tracking-tighter uppercase mb-1">VLC Prototype</h1>
          <p class="text-zinc-500 text-xs">Binary Data via Visible Light</p>
        </section>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] uppercase text-zinc-400 mb-1">Data String</label>
            <input
              type="text"
              value={message()}
              onInput={(e) => setMessage(e.currentTarget.value)}
              class="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2 text-sm focus:border-white outline-none transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase text-zinc-400 mb-1">Mode</label>
              <select
                value={encoding()}
                onChange={(e) => setEncoding(e.currentTarget.value as EncodingType)}
                class="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-2 text-sm outline-none"
              >
                <option value="Manchester">Manchester</option>
                <option value="Raw Binary">Raw</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] uppercase text-zinc-400 mb-1">Frequency</label>
              <div class="flex items-center bg-zinc-900 border border-zinc-800 px-3 py-2">
                <input
                  type="number"
                  value={hz()}
                  onInput={(e) => setHz(Number(e.currentTarget.value))}
                  class="bg-transparent w-full text-sm outline-none"
                />
                <span class="text-[10px] text-zinc-500">HZ</span>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <button
              onClick={() => setIsActive(true)}
              class="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Start Stream
            </button>
          </div>
        </div>

        <footer class="text-[9px] text-zinc-600 text-center uppercase tracking-widest">
          Sync: 10101011 | Refresh: 60Hz Base
        </footer>
      </main>

      <Blinker
        active={isActive()}
        message={message()}
        hz={hz()}
        encoding={encoding()}
        onClose={() => setIsActive(false)}
      />
    </div>
  );
};

export default App;