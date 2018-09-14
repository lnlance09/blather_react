import * as constants from './constants';

/**
 * @return {object} - the initial state
 */
const initial = () => ({})

/**
 * Change the state of this widget
 *
 * @param {object} state
 * @param {object} action
 * @return {object}
 */
const test = (state = initial(), action) => {
    switch (action.type) {
        case constants.GET_DISCUSSIONS:
            const results = action.payload.page > 0 ? [...state.results, ...action.payload.discussions] : action.payload.discussions
            return {
                ...state,
                count: action.payload.count,
                hasMore: action.payload.hasMore,
                loadingMore: false,
                page: action.payload.page,
                pages: action.payload.pages,
                results: results
            }

        case constants.GET_TAGS:
            return {
                ...state,
                options: action.payload.tags
            }
    
        default:
            return state;
    }
};

export default test;
