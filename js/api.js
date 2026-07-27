import { supabase } from "./supabase.js";

export async function getDashboardStats() {

    try {

        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total Users
        const { count: totalUsers } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        // Active Users
        const { count: activeUsers } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("last_activity", twoMinutesAgo);

        // Sessions Today
        const { count: sessionsToday } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .gte("started_at", today.toISOString());
        console.log("Sessions:", sessionsToday);
        // Events Today
        const { count: eventsToday } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());
        console.log("Events:", eventsToday);
        // Errors Today
        const { count: errorsToday } = await supabase
            .from("errors")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());
        console.log("Errors:", errorsToday);
        return {

            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            sessionsToday: sessionsToday || 0,
            eventsToday: eventsToday || 0,
            errorsToday: errorsToday || 0

        };

    } catch (err) {

        console.error(err);

        return null;

    }

}
export async function getRecentActivity() {

    const aliasMap = await getAliasMap();

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {

        console.error(error);

        return [];

    }

    const userMap = await getUserMap();

data.forEach(event => {

    const user = userMap[event.anonymous_id];

    event.alias = user?.alias ?? "-";
    event.browser = user?.browser ?? "-";
    event.platform = user?.platform ?? "-";

});

    return data;

}
async function getAliasMap() {

    const { data, error } = await supabase
        .from("users")
        .select("anonymous_id, alias");

    if (error) {

        console.error(error);

        return {};

    }

    return Object.fromEntries(

        data.map(user => [

            user.anonymous_id,

            user.alias

        ])

    );

}

export async function getUsers(page = 1, pageSize = 20, search = "") {

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("users")
        .select("*", { count: "exact" });

    const searchText = search.trim();

    if (searchText !== "") {

        query = query.or(
            [
                `alias.ilike.%${searchText}%`,
                `browser.ilike.%${searchText}%`,
                `platform.ilike.%${searchText}%`,
                `version.ilike.%${searchText}%`
            ].join(",")
        );

    }

    const { data, error, count } = await query
        .order("last_seen", { ascending: false })
        .range(from, to);

    if (error) {

        console.error("getUsers error:", error);

        return {
            data: [],
            total: 0
        };

    }

    return {
        data: data ?? [],
        total: count ?? 0
    };

}
async function getUserMap() {

    const { data, error } = await supabase
        .from("users")
        .select("anonymous_id, alias, browser, platform");

    if (error) {

        console.error(error);

        return {};

    }

    return Object.fromEntries(

        data.map(user => [

            user.anonymous_id,

            {
                alias: user.alias,
                browser: user.browser,
                platform: user.platform
            }

        ])

    );

}
export async function getEvents(page = 1, pageSize = 25, search = "") {

    const aliasMap = await getAliasMap();

    let query = supabase
        .from("events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    if (search.trim() !== "") {

        query = query.ilike("event", `%${search}%`);

    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(event => {

        event.alias = aliasMap[event.anonymous_id] ?? "-";

    });

    return {

        data,
        total: count

    };

}
export async function getSessions(page = 1, pageSize = 25) {

    const aliasMap = await getAliasMap();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("sessions")
        .select("*", { count: "exact" })
        .order("started_at", { ascending: false })
        .range(from, to);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(session => {

        session.alias = aliasMap[session.anonymous_id] ?? "-";

    });

    return {

        data,
        total: count

    };

}

export async function getErrors(page = 1, pageSize = 25) {

    const userMap = await getUserMap();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("errors")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(error => {

        const user = userMap[error.anonymous_id];

        error.alias = user?.alias ?? "-";

    });

    return {

        data,
        total: count

    };

}
export async function getEventsPerDay(days = 7) {

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from("events")
        .select("created_at")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: true });

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    for (let i = 0; i < days; i++) {

        const d = new Date(start);

        d.setDate(start.getDate() + i);

        const key = d.toISOString().split("T")[0];

        counts[key] = 0;

    }

    data.forEach(event => {

        const key = event.created_at.split("T")[0];

        if (counts[key] !== undefined) {

            counts[key]++;

        }

    });

    return Object.entries(counts).map(([date, count]) => ({

        date,

        count

    }));

}

export async function getBrowserStats() {

    const { data, error } = await supabase
        .from("users")
        .select("browser");

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(user => {

        const browser = user.browser || "Unknown";

        counts[browser] = (counts[browser] || 0) + 1;

    });

    return Object.entries(counts).map(([browser, count]) => ({

        browser,

        count

    }));

}
export async function getTopUsers(limit = 5) {

    const userMap = await getUserMap();

    const { data, error } = await supabase
        .from("events")
        .select("anonymous_id");

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(event => {

        counts[event.anonymous_id] =
            (counts[event.anonymous_id] || 0) + 1;

    });

    return Object.entries(counts)
        .map(([id, count]) => ({

            alias: userMap[id]?.alias || "Unknown",

            count

        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

}

export async function getTopEvents(limit = 8) {

    const { data, error } = await supabase
        .from("events")
        .select("event");

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(e => {

        counts[e.event] = (counts[e.event] || 0) + 1;

    });

    return Object.entries(counts)
        .map(([event, count]) => ({

            event,

            count

        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

}

