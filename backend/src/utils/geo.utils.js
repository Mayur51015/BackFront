/**
 * Haversine Formula Utility
 * 
 * Why Haversine? 
 * It calculates the shortest distance between two points on a sphere (Earth).
 * Euclidean distance is for flat planes and becomes inaccurate over long 
 * distances or near poles. For GPS-based geo-fencing, Haversine is the standard.
 * 
 * Time Complexity: O(1) - Constant time calculations.
 */

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * 
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters
    return distance;
};

module.exports = { calculateDistance };
