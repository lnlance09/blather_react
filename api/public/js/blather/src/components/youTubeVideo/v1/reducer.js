import * as constants from "./constants"

const initial = () => ({})

const video = (state = initial(), action) => {
	switch (action.type) {
		case constants.UPDATE_ARCHIVE_DESCRIPTION:
			return {
				...state,
				archiveDescription: action.val
			}
		case constants.UPDATE_ARCHIVE_END_TIME:
			return {
				...state,
				archiveEndTime: action.val
			}
		case constants.UPDATE_ARCHIVE_START_TIME:
			return {
				...state,
				archiveStartTime: action.val
			}

		default:
			return state
	}
}

export default video
