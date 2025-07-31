const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

let inMemoryToken = null;

function setAccessToken(token) {
    inMemoryToken = token;
}

function getInMemoryAccessToken() {
    return inMemoryToken;
}

async function getAccessToken() {
    try {
        console.log("BASE_URL:", process.env.ONEMAP_BASE_URL);
console.log("EMAIL:", process.env.ONEMAP_API_EMAIL);
console.log("PASSWORD:", process.env.ONEMAP_API_PASSWORD);

        const response = await axios.post(
            `${process.env.ONEMAP_BASE_URL}/api/auth/post/getToken`,
            {
                email: process.env.ONEMAP_API_EMAIL,
                password: process.env.ONEMAP_API_PASSWORD,
            }
        );

        const accessToken = response.data.access_token;
        setAccessToken(accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw new Error("Unable to refresh token");
    }
}

async function geocode(address) {
    try {
        let accessToken = getInMemoryAccessToken();
        if (!accessToken) {
            accessToken = await getAccessToken();
        }

        const response = await axios.get(
            "https://www.onemap.gov.sg/api/common/elastic/search",
            {
                params: {
                    searchVal: address,
                    returnGeom: "Y",
                    getAddrDetails: "Y",
                    pageNum: 1,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data = response.data;

        if (data.found > 0 && data.results && data.results.length > 0) {
            return {
                lat: data.results[0].LATITUDE,
                lng: data.results[0].LONGITUDE,
            };
        } else {
            throw new Error("Address not found");
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        throw new Error("Geocoding failed");
    }
}

module.exports = {
    geocode,
    getAccessToken,
    setAccessToken,
    getInMemoryAccessToken,
};