<script>
    import { onMount } from 'svelte';
    import { initMqtt } from '$lib/mqtt/mqtt';
    import { mqttStatusText, batteryLevel, esp32Status } from '../lib/stores/mqttStore';
    
    import Controller from '../components/Controller.svelte';
    import SpeedSlider from '../components/SpeedSlider.svelte';
    import ClawSlider from '../components/ClawSlider.svelte';
    import CameraView from '../components/CameraView.svelte';

    onMount(() => {
        initMqtt();
    });
</script>

<main class="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
    <!-- Layer Kamera (Background) -->
    <!-- Pointer-events-auto penting agar input di CameraView bisa berinteraksi -->
    <div class="absolute inset-0 z-0 pointer-events-auto">
        <CameraView />
    </div>

    <!-- HUD Layer (UI) -->
    <div class="relative z-10 w-full h-full p-4 flex flex-col justify-between pointer-events-none">
        
        <!-- TOP HUD -->
        <header class="flex justify-between items-start pointer-events-auto">
            <div class="flex gap-2">
                <div class="bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/10 text-[10px] md:text-xs text-slate-200 uppercase tracking-widest font-mono">
                    MQTT: <span class="text-blue-400 font-bold">{$mqttStatusText}</span>
                </div>
                <div class="bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/10 text-[10px] md:text-xs text-slate-200 uppercase tracking-widest font-mono">
                    ESP32: <span class="text-green-400 font-bold">{$esp32Status}</span>
                </div>
            </div>
            <div class="bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/10 text-[10px] md:text-xs text-slate-200 uppercase tracking-widest font-mono">
                BATT: <span class="text-yellow-400 font-bold">{$batteryLevel}%</span>
            </div>
        </header>

        <!-- BOTTOM HUD -->
        <div class="flex justify-between items-end pointer-events-auto pb-2">
            <div class="origin-bottom-left scale-90">
                <Controller />
            </div>
            
            <div class="bg-black/30 backdrop-blur-xl p-4 rounded-2xl border border-white/10 w-40 md:w-56 origin-bottom-right">
                <div class="space-y-4">
                    <SpeedSlider />
                    <ClawSlider />
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    /* Menangani Notch HP */
    main {
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }
</style>