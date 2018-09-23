import * as constants from "../constants";

const initial = () => ({});

const about = (state = initial(), action) => {
    const payload = action.payload;
    switch (action.type) {
        case constants.RESET_CONTACT_FORM:
            return {
                messageSent: false
            };

        case constants.SEND_CONTACT_MSG:
            return {
                ...state,
                messageSent: payload.error ? false : true
            };

        default:
            return state;
    }
};

export default about;