// src/lib/apiThrottler.ts

const REQUEST_INTERVAL_MS = 200; // 5 requests per second
let lastRequestTime = 0;
const requestQueue: (() => void)[] = [];
let isProcessing = false;

function processQueue() {
    if (requestQueue.length === 0) {
        isProcessing = false;
        return;
    }

    isProcessing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest >= REQUEST_INTERVAL_MS) {
        lastRequestTime = now;
        const nextRequest = requestQueue.shift();
        if (nextRequest) {
            nextRequest();
        }
        processQueue();
    } else {
        setTimeout(processQueue, REQUEST_INTERVAL_MS - timeSinceLastRequest);
    }
}

export function throttledFetch(url: string, options?: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
        const executeFetch = async () => {
            try {
                const response = await fetch(url, options);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        };

        requestQueue.push(executeFetch);
        if (!isProcessing) {
            processQueue();
        }
    });
}
