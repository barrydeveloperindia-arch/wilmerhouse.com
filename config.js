// Test Push: 2026-05-05
const CONFIG = {
    // Primary Supabase Configuration
    SUPABASE_URL: 'https://lboxhpwqwigvezmvbdrr.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxib3hocHdxd2lndmV6bXZiZHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMDY2NzYsImV4cCI6MjA5MjY4MjY3Nn0.swU1ROukKgYLavGW_7dZdcgsuQaJXctA7v1BzGNBTXA',
    
    // Environment Detection
    getEnv: () => {
        if (typeof window === 'undefined') return 'node';
        if (window.location.hostname === 'wilmerhouse.com') return 'prod';
        if (window.location.hostname.includes('staging')) return 'staging';
        return 'dev';
    }
};

// Export for both Browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
