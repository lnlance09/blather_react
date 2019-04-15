import * as constants from "./constants"

const initial = () => ({
	archives: [],
	myArchives: []
})

const video = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.CREATE_VIDEO_ARCHIVE:
			if (payload.error) {
				return {
					...state,
					archiveError: true,
					archiveErrorMsg: payload.error
				}
			}

			return {
				...state,
				archiveDescription: "",
				archiveEndTime: "",
				archiveError: false,
				archiveErrorMsg: "",
				archiveStartTime: "0:00",
				archives:
					state.archives.length > 0
						? [...state.archives, payload.archive]
						: [payload.archive],
				myArchives:
					state.myArchives.length > 0
						? [...state.myArchives, payload.archive]
						: [payload.archive]
			}

		case constants.DELETE_ARCHIVE:
			return {
				...state,
				archives: state.archives.filter(item => item.id !== payload.id),
				myArchives: state.myArchives.filter(item => item.id !== payload.id)
			}

		case constants.GET_VIDEO_ARCHIVES:
			let myArchives = payload.archives
			if (action.archiveId) {
				myArchives = [
					myArchives.find(item => item.id === action.archiveId),
					...myArchives.filter(item => item.id !== action.archiveId)
				]
			}
			return {
				...state,
				myArchives
			}

		case constants.SET_CURRENT_VIDEO_TIME:
			return {
				...state,
				info: {
					...state.info,
					currentTime: Math.floor(payload.time)
				}
			}

		case constants.SET_DURATION:
			return {
				...state,
				info: {
					...state.info,
					endTime: payload
				}
			}

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
