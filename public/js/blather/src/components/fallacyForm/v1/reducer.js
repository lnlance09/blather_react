import * as constants from "./constants"

const initial = () => ({})

const fallacyForm = (state = initial(), action) => {
	switch (action.type) {
		case constants.ASSIGN_FALLACY:
			if (action.payload.error) {
				return {
					...state,
					assigned: false,
					fallacyFormError: true,
					fallacyFormErrorCode: action.payload.code,
					fallacyFormErrorMsg: action.payload.error,
					loading: false
				}
			}

			const fallacy = action.payload.fallacy
			return {
				...state,
				assigned: true,
				fallacyFormError: false,
				fallacyFormErrorCode: 0,
				fallacyFormErrorMsg: "",
				fallacy: {
					assignedBy: parseInt(fallacy.assigned_by, 10),
					contradiction: null,
					explanation: fallacy.explanation,
					fallacyId: parseInt(fallacy.fallacy_id, 10),
					id: parseInt(fallacy.id, 10),
					title: fallacy.title
				},
				pageId: fallacy.page_id,
				objectId: fallacy.tweet_id
			}

		case constants.CLEAR_CONTRADICTION:
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {}
				}
			}

		case constants.PARSE_CONTRADICTION:
			if (action.payload.error) {
				return {
					...state,
					fallacy: {
						...state.fallacy,
						contradiction: {
							commentId: "",
							data: null,
							error: true,
							errorMsg: action.payload.error,
							mediaId: null,
							network: "",
							pageId: "",
							startTime: "",
							type: "",
							username: ""
						}
					}
				}
			}

			const data = action.payload.data
			data.currentTime = action.payload.startTime
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						commentId: action.payload.commentId,
						data: data,
						error: false,
						errorMsg: "",
						mediaId: action.payload.mediaId,
						network: action.payload.network,
						pageId: action.payload.pageId,
						startTime: action.payload.startTime,
						type: action.payload.type,
						username: action.payload.username
					}
				}
			}

		case constants.SELECT_ASSIGNEE:
			return {
				...state,
				pageInfo: action.payload.page
			}

		case constants.SET_CONTRADICTION_VIDEO_TIME:
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						...state.fallacy.contradiction,
						data: {
							...state.fallacy.contradiction.data,
							currentTime: Math.floor(action.payload.time)
						}
					}
				}
			}

		default:
			return state
	}
}

export default fallacyForm
