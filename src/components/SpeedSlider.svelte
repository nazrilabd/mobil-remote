<script>
    import { carSpeed } from '$lib/stores/mqttStore';
    import { publishMessage } from '$lib/mqtt/mqtt';
    import { TOPICS } from '$lib/constants/topics';

    const handleSpeedChange = () => {
        publishMessage(TOPICS.SPEED, $carSpeed);
    };
</script>

<div>
    <div class="flex justify-between items-center mb-2">
        <h3 class="text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400">Speed</h3>
        <span class="text-cyan-400 font-mono text-xs bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20">{$carSpeed}</span>
    </div>
    <input
        type="range" min="0" max="255"
        bind:value={$carSpeed} oninput={handleSpeedChange}
        class="w-full h-1.5 bg-slate-700/60 rounded-full appearance-none cursor-pointer accent-cyan-400"
    />
</div>