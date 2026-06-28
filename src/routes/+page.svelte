<script>
    import { onMount, onDestroy } from 'svelte';
    import { initMqtt } from '$lib/mqtt/mqtt';
    import { mqttStatusText, batteryLevel, esp32Status } from '../lib/stores/mqttStore';

    import Controller from '../components/Controller.svelte';
    import SpeedSlider from '../components/SpeedSlider.svelte';
    import ClawSlider from '../components/ClawSlider.svelte';
    import CameraView from '../components/CameraView.svelte';

    let now = new Date();
    let timer;

    onMount(() => {
        initMqtt();
        timer = setInterval(() => { now = new Date(); }, 1000);
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });

    const pad = (n) => n.toString().padStart(2, '0');
    const timeString = () => `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

   let isConnected = $derived($mqttStatusText && $mqttStatusText.toLowerCase().includes('connect'));
</script>

<main class="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none">

    <!-- ================= PORTRAIT WARNING ================= -->
    <div class="landscape-warning fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center gap-4 text-slate-300">
        <div class="text-5xl animate-[spin_2.5s_linear_infinite]">📱</div>
        <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Putar Perangkat</p>
        <p class="text-slate-500 text-xs">Mode landscape diperlukan untuk kontrol penuh</p>
    </div>

    <!-- ================= LAYER KAMERA ================= -->
    <div class="absolute inset-0 z-0 pointer-events-auto">
        <CameraView />
    </div>

    <!-- ================= OVERLAY: VIGNETTE + GRID + FRAME ================= -->
    <div class="absolute inset-0 z-[5] pointer-events-none">

        <!-- vignette agar HUD lebih terbaca di atas video -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/55"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25"></div>

        <!-- scanline halus -->
        <div class="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:100%_3px]"></div>

        <!-- corner brackets -->
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M3,9 L3,3 L9,3" fill="none" stroke="#22d3ee" stroke-width="0.35" opacity="0.8" />
            <path d="M91,3 L97,3 L97,9" fill="none" stroke="#22d3ee" stroke-width="0.35" opacity="0.8" />
            <path d="M97,91 L97,97 L91,97" fill="none" stroke="#22d3ee" stroke-width="0.35" opacity="0.8" />
            <path d="M9,97 L3,97 L3,91" fill="none" stroke="#22d3ee" stroke-width="0.35" opacity="0.8" />
        </svg>

        <!-- center reticle / crosshair kecil di tengah frame, ciri khas kamera FPV -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
            <svg width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r="9" fill="none" stroke="#22d3ee" stroke-width="0.7" />
                <line x1="17" y1="0" x2="17" y2="9" stroke="#22d3ee" stroke-width="0.7" />
                <line x1="17" y1="25" x2="17" y2="34" stroke="#22d3ee" stroke-width="0.7" />
                <line x1="0" y1="17" x2="9" y2="17" stroke="#22d3ee" stroke-width="0.7" />
                <line x1="25" y1="17" x2="34" y2="17" stroke="#22d3ee" stroke-width="0.7" />
            </svg>
        </div>
    </div>

    <!-- ================= HUD LAYER ================= -->
    <div class="relative z-10 w-full h-full p-3 md:p-4 flex flex-col justify-between pointer-events-none font-mono">

        <!-- TOP HUD -->
        <header class="flex justify-between items-start pointer-events-auto">

            <!-- kiri atas: status koneksi -->
            <div class="flex gap-2">
                <div class="flex items-center gap-1.5 bg-black/55 backdrop-blur-lg px-3 py-1.5 rounded-md border border-white/10 text-[10px] md:text-xs uppercase tracking-widest">
                    <span class="w-1.5 h-1.5 rounded-full {isConnected ? 'bg-emerald-400' : 'bg-red-500'} {isConnected ? '' : 'animate-pulse'}"></span>
                    <span class="text-slate-500">LINK</span>
                    <span class={isConnected ? 'text-emerald-400' : 'text-red-400'}>{$mqttStatusText}</span>
                </div>
                <div class="flex items-center gap-1.5 bg-black/55 backdrop-blur-lg px-3 py-1.5 rounded-md border border-white/10 text-[10px] md:text-xs uppercase tracking-widest">
                    <span class="text-slate-500">UNIT</span>
                    <span class="text-cyan-300">{$esp32Status}</span>
                </div>
            </div>

            <!-- tengah atas: REC + timestamp, kesan rekaman live -->
            <div class="flex items-center gap-2 bg-black/55 backdrop-blur-lg px-3 py-1.5 rounded-md border border-white/10 text-[10px] md:text-xs">
                <span class="flex items-center gap-1 text-red-500">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    REC
                </span>
                <span class="text-slate-400 tracking-widest">{timeString()}</span>
            </div>

            <!-- kanan atas: baterai -->
            <div class="flex items-center gap-2 bg-black/55 backdrop-blur-lg px-3 py-1.5 rounded-md border border-white/10 text-[10px] md:text-xs uppercase tracking-widest">
                <span class="text-slate-500">PWR</span>
                <div class="flex items-center gap-1.5">
                    <div class="relative w-7 h-3 border border-slate-500 rounded-[2px]">
                        <div
                            class="absolute inset-0.5 rounded-[1px] transition-all {$batteryLevel > 50 ? 'bg-emerald-400' : $batteryLevel > 20 ? 'bg-amber-400' : 'bg-red-500'}"
                            style="width: {Math.max($batteryLevel, 4)}%"
                        ></div>
                        <div class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-slate-500 rounded-r-[1px]"></div>
                    </div>
                    <span class={$batteryLevel > 20 ? 'text-amber-300' : 'text-red-400 animate-pulse'}>{$batteryLevel}%</span>
                </div>
            </div>
        </header>

        <!-- BOTTOM HUD -->
        <div class="flex justify-between items-end pointer-events-auto pb-1">

            <!-- kiri bawah: D-pad + label -->
            <div class="flex flex-col items-center gap-1">
                <div class="origin-bottom-left scale-[0.85] md:scale-100">
                    <Controller />
                </div>
                <span class="text-[9px] text-cyan-500/60 tracking-[0.25em] -mt-1">MANUAL DRIVE</span>
            </div>

            <!-- kanan bawah: panel slider -->
            <div class="bg-black/50 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/20 w-36 md:w-56 shadow-[0_0_30px_rgba(34,211,238,0.10)]">
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <span class="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Telemetry</span>
                    <span class="text-[9px] text-emerald-400 uppercase tracking-[0.2em]">Live</span>
                </div>
                <div class="space-y-4">
                    <SpeedSlider />
                    <ClawSlider />
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    main {
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }

    .landscape-warning {
        display: none;
    }

    @media (orientation: portrait) and (max-width: 768px) {
        .landscape-warning {
            display: flex;
        }
    }
</style>