import * as constants from "./constants"

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
		case constants.CHANGE_ME:
			return {
				...state,
				changeMe: action.changeMe
			}

		default:
			return state
	}
}

export default test
