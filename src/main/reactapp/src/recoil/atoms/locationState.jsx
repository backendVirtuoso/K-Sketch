import { atom } from "recoil";

export const locationState = atom({
    key: "locationState",
    default: { lat: null, lon: null },
});