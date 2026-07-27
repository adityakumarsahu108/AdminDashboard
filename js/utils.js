let autoRefreshInterval = null;

export function startAutoRefresh(callback) {

    stopAutoRefresh();

    autoRefreshInterval = setInterval(callback, 30000);

}

export function stopAutoRefresh() {

    if (autoRefreshInterval) {

        clearInterval(autoRefreshInterval);

        autoRefreshInterval = null;

    }

}