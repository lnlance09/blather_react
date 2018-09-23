import * as constants from "./constants";

const initial = () => ({});

const test = (state = initial(), action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default test;