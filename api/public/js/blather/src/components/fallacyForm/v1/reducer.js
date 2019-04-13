import * as constants from "./constants"

const initial = () => ({
	fallacy: {
		contradiction: {
			endTime: "0",
			startTime: "0"
		}
	},
	modalOpen: false
})

const fallacyForm = (state = initial(), action) => {
	switch (action.type) {
		case constants.ASSIGN_FALLACY:
			if (action.payload.error) {
				return {
					...state,
					fallacyFormError: true,
					fallacyFormErrorCode: action.payload.code,
					fallacyFormErrorMsg: action.payload.error,
					loading: false
				}
			}

			const fallacy = action.payload.fallacy
			return {
				...state,
				fallacyFormError: false,
				fallacyFormErrorCode: 0,
				fallacyFormErrorMsg: "",
				fallacy: {
					assignedBy: parseInt(fallacy.assigned_by, 10),
					contradiction: fallacy.contradiction,
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
							endTime: 0,
							error: true,
							errorMsg: action.payload.error,
							mediaId: null,
							network: "",
							pageId: "",
							startTime: 0,
							type: "",
							username: ""
						}
					}
				}
			}

			const data = action.payload.data
			data.currentTime = action.payload.startTime

			let pageInfo = state.pageInfo
			if (action.payload.type === "tweet" && action.postType === "video") {
				pageInfo = {
					id: action.payload.pageId,
					name: data.user.name,
					type: "twitter",
					username: action.payload.username
				}
			}

			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						...state.fallacy.contradiction,
						commentId: action.payload.commentId,
						data,
						error: false,
						errorMsg: "",
						mediaId: action.payload.mediaId,
						network: action.payload.network,
						pageId: action.payload.pageId,
						type: action.payload.type,
						username: action.payload.username
					}
				},
				pageInfo
			}

		case constants.SELECT_ASSIGNEE:
			return {
				...state,
				pageInfo: action.payload.page
			}

		case constants.SET_CONTRADICTION_BEGIN_TIME:
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						...state.fallacy.contradiction,
						startTime: action.payload.value.value
					}
				}
			}

		case constants.SET_CONTRADICTION_END_TIME:
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						...state.fallacy.contradiction,
						endTime: action.payload.value.value
					}
				}
			}

		case constants.SET_CONTRADICTION_HIGHLIGHT:
			return {
				...state,
				fallacy: {
					...state.fallacy,
					contradiction: {
						...state.fallacy.contradiction,
						data: {
							...state.fallacy.contradiction.data
						},
						highlightedText: action.text.text
					}
				}
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

		case constants.TOGGLE_MODAL:
			return {
				...state,
				modalOpen: !state.modalOpen
			}

		default:
			return state
	}
}

export default fallacyForm
