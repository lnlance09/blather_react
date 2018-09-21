import * as constants from './constants';

const initial = () => ({})

const test = (state = initial(), action) => {
    switch (action.type) {
        case constants.CHANGE_ME:
            return {
                ...state,
                changeMe: action.changeMe
            };
    
        default:
            return state
    }
}

export default test