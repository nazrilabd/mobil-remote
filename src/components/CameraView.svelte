<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import Peer from 'peerjs';

    let myPeerId = $state(null);
    let streams = $state({});      // { peerId: MediaStream }
    let activePeerId = $state(null);
    let peer;

    // ---- panel ID (show/hide) ----
    let showIdPanel = $state(false);
    let copied = $state(false);

    onMount(() => {
        if (browser) myPeerId = localStorage.getItem('dashboardPeerId');
        peer = new Peer(myPeerId || undefined);

        peer.on('open', (id) => {
            myPeerId = id;
            if (browser) localStorage.setItem('dashboardPeerId', id);
        });

        peer.on('call', (call) => {
            call.answer();
            call.on('stream', (remoteStream) => {
                streams[call.peer] = remoteStream;
                if (!activePeerId) activePeerId = call.peer;
            });

            call.on('close', () => {
                delete streams[call.peer];
                if (activePeerId === call.peer) {
                    activePeerId = Object.keys(streams)[0] || null;
                }
            });
        });

        return () => { if (peer) peer.destroy(); };
    });

    function swapCamera(id) {
        activePeerId = id;
    }

    function copyPeerId() {
        if (!myPeerId || !browser) return;
        navigator.clipboard.writeText(myPeerId).then(() => {
            copied = true;
            setTimeout(() => (copied = false), 1500);
        });
    }

    function qrUrl(data, size = 180) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&qzone=1&color=22-211-238&bgcolor=0-0-0&data=${encodeURIComponent(data)}`;
    }
</script>

<div class="fixed inset-0 w-full h-full bg-black">

    <!-- LAYAR UTAMA (FULL SCREEN) -->
    {#if activePeerId && streams[activePeerId]}
        <video
            srcObject={streams[activePeerId]}
            autoplay playsinline muted
            class="w-full h-full object-cover"
        ></video>
    {:else}
        <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono">
            <div class="w-2 h-2 rounded-full bg-cyan-500 animate-ping mb-4"></div>
            <p class="text-xs uppercase tracking-[0.3em] text-cyan-500/70">Menunggu Sinyal Kamera</p>
        </div>
    {/if}

    <!-- PREVIEW GRID (KAMERA LAIN) -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {#each Object.keys(streams) as id, i}
            {#if id !== activePeerId}
                <button
                    onclick={() => swapCamera(id)}
                    class="relative w-28 h-[70px] md:w-32 md:h-20 bg-slate-900 rounded-md overflow-hidden border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)] group"
                >
                    <video
                        srcObject={streams[id]}
                        autoplay muted playsinline
                        class="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                    ></video>
                    <span class="absolute top-1 left-1.5 text-[8px] font-mono uppercase tracking-widest text-cyan-300 bg-black/50 px-1 rounded-sm">
                        CAM {i + 1}
                    </span>
                    <span class="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </button>
            {/if}
        {/each}
    </div>

    <!-- ============ TOMBOL TOGGLE ID ============ -->
    <div class="absolute top-20 right-4 z-40 pointer-events-auto">
        <button
            onclick={() => (showIdPanel = !showIdPanel)}
            class="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-lg border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400 transition-colors"
        >
            {showIdPanel ? 'Sembunyikan ID' : 'Tampilkan ID'}
        </button>
    </div>

    <!-- ============ MODAL PEER ID + QR (full-screen, selalu di atas, tidak akan ketiban elemen lain) ============ -->
    {#if showIdPanel}
        <div
            class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
            onclick={() => (showIdPanel = false)}
        >
            <div
                class="w-56 bg-slate-900/95 border border-cyan-500/25 rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                onclick={(e) => e.stopPropagation()}
            >
                <div class="w-full flex justify-between items-center">
                    <p class="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-mono">Dashboard Peer ID</p>
                    <button onclick={() => (showIdPanel = false)} class="text-slate-500 hover:text-white text-xs leading-none">✕</button>
                </div>

                {#if myPeerId}
                    <img src={qrUrl(myPeerId)} alt="QR Peer ID" class="w-32 h-32 rounded-md border border-cyan-500/20" />
                    <p class="text-[11px] text-cyan-300 select-text cursor-text font-mono break-all text-center">{myPeerId}</p>
                    <button
                        onclick={copyPeerId}
                        class="w-full text-[10px] font-mono uppercase tracking-widest py-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
                    >
                        {copied ? 'Tersalin ✓' : 'Salin ID'}
                    </button>
                {:else}
                    <p class="text-[10px] text-slate-500">Menyiapkan ID...</p>
                {/if}
            </div>
        </div>
    {/if}
</div>