import {
    getEventsPerDay,
    getBrowserStats,
    getTopUsers,
    getTopEvents
} from "./api.js";

let eventsChart = null;
let browserChart = null;

export async function renderEventsChart(canvasId) {

    const loading = document.getElementById("eventsChartLoading");

    const stats = await getEventsPerDay();

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    // Create chart only once
    if (!eventsChart) {

        if (loading) loading.style.display = "flex";

        eventsChart = new Chart(ctx, {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    label: "Events",

                    data: [],

                    tension: 0.35,

                    fill: true,

                    borderWidth: 3

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

        if (loading) loading.style.display = "none";
    }

    // Update chart instead of recreating it
    eventsChart.data.labels = stats.map(x =>
        new Date(x.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        })
    );

    eventsChart.data.datasets[0].data =
        stats.map(x => x.count);

    eventsChart.update();

}
export async function renderBrowserChart(canvasId) {

    const loading = document.getElementById("browserChartLoading");

    const stats = await getBrowserStats();

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    // Create chart only once
    if (!browserChart) {

        if (loading) loading.style.display = "flex";

        browserChart = new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: [],

               datasets: [{

    data: [],

backgroundColor: [
    "#94A3B8", // Slate
    "#CBD5E1", // Light Slate
    "#64748B", // Dark Slate
    "#E2E8F0", // Very Light Slate
    "#475569", // Deep Slate
    "#F1F5F9", // Almost White
    "#7DD3FC", // Soft Sky Blue
    "#38BDF8"  // Sky Blue
],

borderColor: "#1E293B",

    borderWidth: 2,

    hoverOffset: 8

}]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

    legend: {

        position: "bottom",

        labels: {

            color: "#E5E7EB",

            padding: 20,

            usePointStyle: true,

            pointStyle: "circle"

        }

    }

}

            }

        });

        if (loading) loading.style.display = "none";

    }

    // Update existing chart
    browserChart.data.labels =
        stats.map(x => x.browser);

    browserChart.data.datasets[0].data =
        stats.map(x => x.count);

    browserChart.update();

}
let topUsersChart = null;

export async function renderTopUsersChart(canvasId) {

    const loading = document.getElementById("topUsersLoading");

    const stats = await getTopUsers();

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    if (!topUsersChart) {

        if (loading) loading.style.display = "flex";

        topUsersChart = new Chart(ctx, {

            type: "bar",

            data: {

                labels: [],

                datasets: [{

                    label: "Events",

                    data: [],

                    borderWidth: 1

                }]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

        if (loading) loading.style.display = "none";

    }

    topUsersChart.data.labels =
        stats.map(x => x.alias);

    topUsersChart.data.datasets[0].data =
        stats.map(x => x.count);

    topUsersChart.update();

}

let topEventsChart = null;

export async function renderTopEventsChart(canvasId) {

    const loading = document.getElementById("topEventsLoading");

    const stats = await getTopEvents();

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    if (!topEventsChart) {

        if (loading) loading.style.display = "flex";

        topEventsChart = new Chart(ctx, {

            type: "bar",

            data: {

                labels: [],

                datasets: [{

                    data: [],

                    borderWidth: 1

                }]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

        if (loading) loading.style.display = "none";

    }

    topEventsChart.data.labels =
        stats.map(x =>
            x.event
                .replaceAll("_", " ")
                .replace(/\b\w/g, c => c.toUpperCase())
        );

    topEventsChart.data.datasets[0].data =
        stats.map(x => x.count);

    topEventsChart.update();

}