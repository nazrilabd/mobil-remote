<script>
    import { onMount } from 'svelte';
    import { initMqtt } from '$lib/mqtt/mqtt';
    // Import store agar bisa menampilkan status real-time
    import { mqttStatusText, batteryLevel, esp32Status } from '../lib/stores/mqttStore';
    
    import Controller from '../components/Controller.svelte';
    import SpeedSlider from '../components/SpeedSlider.svelte';
    import ClawSlider from '../components/ClawSlider.svelte';
    import CameraView from '../components/CameraView.svelte';

    onMount(() => {
        initMqtt();
    });
</script>

<!-- Kamera sebagai Background Full Screen -->
<div class="fixed inset-0 z-0">
    <CameraView />
</div>

<!-- HUD Layer -->
<div class="fixed inset-0 z-10 p-4 flex flex-col justify-between pointer-events-none">
    
    <!-- Top HUD: Status Bar -->
    <header class="flex justify-between items-center pointer-events-auto">
        <!-- Status MQTT & ESP32 -->
        <div class="flex gap-2">
            <div class="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
                MQTT: <span class="text-blue-400 font-bold">{$mqttStatusText}</span>
            </div>
            <div class="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
                ESP32: <span class="text-green-400 font-bold">{$esp32Status}</span>
            </div>
        </div>

        <!-- Baterai -->
        <div class="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-200">
            BATT: <span class="text-yellow-400 font-bold">{$batteryLevel}%</span>
        </div>
    </header>

    <!-- Bottom HUD: Controller & Parameters -->
    <div class="flex justify-between items-end pointer-events-auto">
        <div class="scale-90 origin-bottom-left">
            <Controller />
        </div>
        
        <div class="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-slate-700 w-48 scale-90 origin-bottom-right">
            <SpeedSlider />
            <ClawSlider />
        </div>
    </div>
</div>