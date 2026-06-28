<script>
    import { clawPosition } from '$lib/stores/mqttStore';
    import { publishMessage } from '$lib/mqtt/mqtt';
    import { TOPICS } from '$lib/constants/topics';

    const handleClawChange = () => {
        publishMessage(TOPICS.CLAW, $clawPosition);
    };
</script>

<div>
    <div class="flex justify-between items-center mb-2">
        <h3 class="text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400">Claw</h3>
        <span class="text-emerald-400 font-mono text-xs bg-black/40 px-2 py-0.5 rounded border border-emerald-500/20">{$clawPosition}°</span>
    </div>
    <input
        type="range" min="0" max="180"
        bind:value={$clawPosition} oninput={handleClawChange}
        class="w-full h-1.5 bg-slate-700/60 rounded-full appearance-none cursor-pointer accent-emerald-400"
    />
</div>