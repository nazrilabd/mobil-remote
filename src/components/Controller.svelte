<script>
    import { publishMessage } from '$lib/mqtt/mqtt';
    import { TOPICS } from '$lib/constants/topics';

    const RADIUS = 70;       // radius area gerak stick (px)
    const DEADZONE = 14;     // px, area tengah dianggap netral

    let baseEl;
    let dragging = $state(false);
    let stickX = $state(0);
    let stickY = $state(0);
    let activeDirection = $state(null); // 'forward' | 'backward' | 'left' | 'right' | null

    const sendCommand = (direction) => {
        if (direction === activeDirection) return;
        activeDirection = direction;
        publishMessage(TOPICS.CONTROL, direction || 'stop');
    };

    const resolveDirection = (x, y) => {
        const dist = Math.hypot(x, y);
        if (dist < DEADZONE) return null;

        // dominant axis -> mapping ke 4 arah (sesuai protokol existing)
        if (Math.abs(x) > Math.abs(y)) {
            return x > 0 ? 'right' : 'left';
        } else {
            return y > 0 ? 'backward' : 'forward';
        }
    };

    const updateFromPointer = (clientX, clientY) => {
        const rect = baseEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist > RADIUS) {
            const ratio = RADIUS / dist;
            dx *= ratio;
            dy *= ratio;
        }

        stickX = dx;
        stickY = dy;
        sendCommand(resolveDirection(dx, dy));
    };

    const handlePointerDown = (e) => {
        dragging = true;
        e.target.setPointerCapture?.(e.pointerId);
        updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerMove = (e) => {
        if (!dragging) return;
        updateFromPointer(e.clientX, e.clientY);
    };

    const releaseStick = () => {
        if (!dragging) return;
        dragging = false;
        stickX = 0;
        stickY = 0;
        sendCommand(null);
    };

    let stickAngle = $derived(Math.atan2(stickY, stickX) * (180 / Math.PI));
    let stickDist = $derived(Math.min(Math.hypot(stickX, stickY), RADIUS));
</script>

<svelte:window
    onpointermove={handlePointerMove}
    onpointerup={releaseStick}
    onpointercancel={releaseStick}
/>

<div class="flex flex-col items-center gap-2 select-none">

    <!-- BASE JOYSTICK -->
    <div
        bind:this={baseEl}
        class="relative w-44 h-44 md:w-52 md:h-52 rounded-full bg-black/40 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_25px_rgba(34,211,238,0.08)] touch-none"
        onpointerdown={handlePointerDown}
    >
        <!-- ring panduan -->
        <div class="absolute inset-3 rounded-full border border-cyan-500/15"></div>
        <div class="absolute inset-[28%] rounded-full border border-cyan-500/10"></div>

        <!-- crosshair -->
        <div class="absolute top-1/2 left-0 w-full h-px bg-cyan-500/10"></div>
        <div class="absolute left-1/2 top-0 w-px h-full bg-cyan-500/10"></div>

        <!-- label arah samar -->
        <span class="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-500/40 tracking-widest">FWD</span>
        <span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-500/40 tracking-widest">BWD</span>
        <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-500/40 tracking-widest">L</span>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-500/40 tracking-widest">R</span>

        <!-- indikator arah aktif (highlight quadrant) -->
        {#if activeDirection}
            <div class="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                 style="background: radial-gradient(circle at {50 + (stickX / RADIUS) * 35}% {50 + (stickY / RADIUS) * 35}%, rgba(34,211,238,0.18), transparent 60%)">
            </div>
        {/if}

        <!-- STICK (handle yang digeser) -->
        <div
            class="absolute top-1/2 left-1/2 w-16 h-16 rounded-full flex items-center justify-center
                   bg-gradient-to-b from-slate-700 to-slate-900 border-2 transition-shadow
                   {dragging ? 'border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.5)]' : 'border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'}"
            style="transform: translate(-50%, -50%) translate({stickX}px, {stickY}px); cursor: {dragging ? 'grabbing' : 'grab'};"
            onpointerdown={handlePointerDown}
        >
            <div class="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>
    </div>

    <!-- READOUT + STOP -->
    <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
        <span class="text-slate-500">DIR</span>
        <span class="text-cyan-300 w-14 text-center">{activeDirection ?? '—'}</span>
        <button
            onclick={() => { stickX = 0; stickY = 0; dragging = false; sendCommand(null); }}
            class="px-3 py-1 rounded-full bg-red-500/90 hover:bg-red-500 active:scale-95 text-white text-[10px] font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
        >STOP</button>
    </div>
</div>