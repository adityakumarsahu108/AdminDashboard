let autoRefreshInterval = null;
let refreshCallback = null;
let refreshIntervalMs = 30000;

/**
 * Starts polling `callback` on an interval.
 *
 * UX/perf improvement: automatically pauses polling while the browser tab
 * is hidden (no point hammering the API when nobody's looking), and does
 * an immediate refresh + resumes polling as soon as the tab is visible
 * again, so the data is never stale when the user comes back.
 */
export function startAutoRefresh(callback, intervalMs = 30000) {

    stopAutoRefresh();

    refreshCallback = callback;
    refreshIntervalMs = intervalMs;

    autoRefreshInterval = setInterval(refreshCallback, refreshIntervalMs);

    document.addEventListener("visibilitychange", handleVisibilityChange);

}

export function stopAutoRefresh() {

    if (autoRefreshInterval) {

        clearInterval(autoRefreshInterval);

        autoRefreshInterval = null;

    }

    document.removeEventListener("visibilitychange", handleVisibilityChange);

    refreshCallback = null;

}

function handleVisibilityChange() {

    if (!refreshCallback) return;

    if (document.hidden) {

        // Tab is backgrounded — stop polling to save requests/battery.
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }

    } else {

        // Tab is visible again — refresh right away, then resume polling.
        refreshCallback();
        autoRefreshInterval = setInterval(refreshCallback, refreshIntervalMs);

    }

}