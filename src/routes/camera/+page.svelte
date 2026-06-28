<script>
    import { onMount } from 'svelte';
    import Peer from 'peerjs';

    let targetPeerId = $state('');
    let statusText = $state('Menunggu input ID...');
    let isConnected = $state(false);
    let videoElement = $state();
    let isCameraOn = $state(true);

    // ---- scan QR ----
    let scanning = $state(false);
    let scanSupported = $state(true);
    let scanLoopId;

    let peer;
    let localStream;

    onMount(async () => {
        peer = new Peer();
        await startCamera();

        if (!('BarcodeDetector' in window)) {
            scanSupported = false;
        }
    });

    async function startCamera() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            if (videoElement) videoElement.srcObject = localStream;
            statusText = 'Kamera siap, silakan masukkan ID Dashboard.';
        } catch (err) {
            statusText = 'Gagal akses kamera: ' + err.message;
        }
    }

    function toggleCamera() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            isCameraOn = videoTrack.enabled;
        }
    }

    function startStream() {
        if (!targetPeerId) return alert('Masukkan ID Dashboard!');

        statusText = 'Menghubungkan...';

        const call = peer.call(targetPeerId, localStream);

        if (call) {
            isConnected = true;
            statusText = 'Berhasil terhubung ke Dashboard!';
        } else {
            statusText = 'Gagal terhubung.';
        }

        call.on('error', (err) => {
            isConnected = false;
            statusText = 'Error: ' + err.message;
        });
    }

    // Arahkan kamera ke QR Dashboard, otomatis isi targetPeerId begitu terdeteksi
    function startScan() {
        if (!scanSupported) {
            statusText = 'Perangkat ini tidak mendukung scan otomatis, isi ID secara manual.';
            return;
        }
        if (!videoElement) return;

        scanning = true;
        statusText = 'Arahkan kamera ke QR Dashboard...';

        const detector = new BarcodeDetector({ formats: ['qr_code'] });

        const loop = async () => {
            if (!scanning) return;
            try {
                const codes = await detector.detect(videoElement);
                if (codes.length > 0) {
                    targetPeerId = codes[0].rawValue;
                    statusText = `ID terdeteksi: ${targetPeerId}`;
                    stopScan();
                    return;
                }
            } catch (e) { /* frame belum siap, lanjut */ }
            scanLoopId = requestAnimationFrame(loop);
        };
        loop();
    }

    function stopScan() {
        scanning = false;
        if (scanLoopId) cancelAnimationFrame(scanLoopId);
    }
</script>

<div class="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center gap-6">

    <!-- Status Bar -->
    <div class="w-full max-w-sm flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Status</span>
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full {isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
            <span class="text-sm font-semibold">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
    </div>

    <div class="w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden border-2 {isConnected ? 'border-green-500' : scanning ? 'border-cyan-400' : 'border-slate-700'} relative transition-colors">
        <video bind:this={videoElement} autoplay playsinline muted class="w-full h-full object-cover"></video>

        {#if scanning}
            <!-- bingkai pemandu scan di atas video -->
            <div class="absolute inset-8 border-2 border-cyan-400/70 rounded-lg pointer-events-none animate-pulse"></div>
            <div class="absolute bottom-2 left-0 w-full text-center text-[10px] font-mono uppercase tracking-widest text-cyan-300 bg-black/40 py-1">
                Mencari QR...
            </div>
        {/if}
    </div>

    <p class="text-center text-xs text-slate-400">{statusText}</p>

    <div class="w-full max-w-sm flex gap-2">
        <button
            onclick={toggleCamera}
            class="flex-1 {isCameraOn ? 'bg-red-600' : 'bg-green-600'} font-bold py-3 rounded-lg transition-colors"
        >
            {isCameraOn ? 'Matikan Kamera' : 'Hidupkan Kamera'}
        </button>
    </div>

    <div class="w-full max-w-sm flex gap-2">
        <input
            type="text"
            bind:value={targetPeerId}
            placeholder="Masukkan Peer ID Dashboard"
            class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center outline-none focus:border-blue-500"
        />
        {#if !scanning}
            <button
                onclick={startScan}
                disabled={isConnected}
                class="px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 font-bold text-xs uppercase tracking-wide transition-colors"
            >
                Scan QR
            </button>
        {:else}
            <button
                onclick={stopScan}
                class="px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase tracking-wide transition-colors"
            >
                Batal
            </button>
        {/if}
    </div>

    <button
        onclick={startStream}
        disabled={isConnected}
        class="w-full max-w-sm {isConnected ? 'bg-slate-600' : 'bg-blue-600'} font-bold py-3 rounded-lg transition-colors"
    >
        {isConnected ? 'Sedang Streaming' : 'Mulai Transmisi'}
    </button>
</div>