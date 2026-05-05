const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

async function seed() {
    const properties = [
        { name: "Property 1", location: "Eastleigh, UK", full_property_price: 200, room1_price: 60, room2_price: 60, room3_price: null, room4_price: null },
        { name: "Property 2", location: "Southampton, UK", full_property_price: 150, room1_price: 50, room2_price: 50, room3_price: null, room4_price: null },
        { name: "Property 3", location: "Winchester, UK", full_property_price: 250, room1_price: 70, room2_price: 70, room3_price: 70, room4_price: null },
        { name: "Property 4", location: "London, UK", full_property_price: 300, room1_price: 100, room2_price: null, room3_price: null, room4_price: null }
    ];

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(properties)
        });

        if (res.ok) {
            console.log("Properties added successfully!");
        } else {
            const err = await res.text();
            console.error("Failed to add properties:", err);
        }
    } catch(e) {
        console.error("Fetch Error:", e.message);
    }
}

seed();
