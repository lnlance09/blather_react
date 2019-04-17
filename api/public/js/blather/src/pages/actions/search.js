import * as constants from "../constants"

export const setValue = ({ value }) => dispatch => {
	dispatch({
		type: constants.SET_SEARCH_VALUE,
		value
	})
}
