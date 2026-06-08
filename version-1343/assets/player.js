import { H as Hls } from "./hls-dru42stk.js";

const attachSource = (video, source) => {
    if (!video || !source) {
        return Promise.resolve();
    }

    if (video.dataset.activeSource === source) {
        return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.dataset.activeSource = source;
        return Promise.resolve();
    }

    if (Hls.isSupported()) {
        if (video.hlsInstance) {
            video.hlsInstance.destroy();
        }

        return new Promise((resolve) => {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video.hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            video.dataset.activeSource = source;
            hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        });
    }

    video.src = source;
    video.dataset.activeSource = source;
    return Promise.resolve();
};

export const initMoviePlayer = ({ source, videoSelector, coverSelector }) => {
    const video = document.querySelector(videoSelector);
    const cover = document.querySelector(coverSelector);

    if (!video || !cover) {
        return;
    }

    const startPlayback = async () => {
        await attachSource(video, source);
        cover.classList.add("is-hidden");
        video.controls = true;
        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(() => {});
        }
    };

    cover.addEventListener("click", startPlayback);
    video.addEventListener("click", () => {
        if (!video.dataset.activeSource) {
            startPlayback();
            return;
        }
        if (video.paused) {
            const playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(() => {});
            }
        }
    });
};
