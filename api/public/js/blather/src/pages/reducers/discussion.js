import * as constants from "../constants"

const initial = () => ({})

const discussion = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.GET_DISCUSSION:
			if(payload.error) {
				return {
					...state,
					error: true
				}
			}
			return {
				...state,
				acceptedBy: {
					id: payload.discussion.accepted_by
						? parseInt(payload.discussion.accepted_by, 10)
						: null,
					img: payload.discussion.accepted_by_profile_pic,
					name: payload.discussion.accepted_by_name,
					username: payload.discussion.accepted_by_username
				},
				createdBy: {
					id: parseInt(payload.discussion.discussion_created_by, 10),
					img: payload.discussion.created_by_profile_pic,
					name: payload.discussion.created_by_name,
					username: payload.discussion.created_by_username
				},
				error: false,
				id: parseInt(payload.discussion.discussion_id, 10),
				dateCreated: payload.discussion.discussion_created_at,
				description: payload.discussion.description,
				extra: payload.discussion.extra,
				status: parseInt(payload.discussion.status, 10),
				tagIds: payload.discussion.tag_ids,
				tagNames: payload.discussion.tag_names,
				title: payload.discussion.title
			}

		case constants.GET_DISCUSSION_CONVERSATION:
			return {
				...state,
				conversation: payload.conversation,
				convoLoading: false
			}

		case constants.REMOVE_DISCUSSION_TAG:
			let tagIds = state.tagIds.split(",")
			let tagNames = state.tagNames.split(",")
			tagIds = tagIds.filter(item => item !== payload.id)
			tagNames = tagNames.filter(item => item !== payload.name)

			return {
				...state,
				tagIds: tagIds.join(","),
				tagNames: tagNames.join(",")
			}

		case constants.SET_DISCUSSION_TAGS:
			return {
				...state,
				tags: [payload.tag]
			}

		case constants.SUBMIT_DISCUSSION:
		case constants.UPDATE_DISCUSSION:
			if (payload.error) {
				return {
					...state,
					error: true,
					errorMsg: payload.errorMsg,
					errorType: payload.errorType
				}
			}
			return {
				...state,
				createdBy: {
					id: parseInt(payload.discussion.discussion_created_by, 10),
					img: payload.discussion.created_by_profile_pic,
					name: payload.discussion.created_by_name,
					username: payload.discussion.created_by_username
				},
				dateCreated: payload.discussion.discussion_created_at,
				description: payload.discussion.description,
				error: false,
				extra: payload.discussion.extra,
				hasSubmitted: true,
				id: parseInt(payload.discussion.discussion_id, 10),
				lastUpdated: payload.discussion.last_updated,
				tagIds: payload.discussion.tag_ids,
				tagNames: payload.discussion.tag_names,
				title: payload.discussion.title
			}

		case constants.SUBMIT_DISCUSSION_CONVERSATION:
			if (payload.body.error) {
				return {
					...state,
					error: true,
					errorMsg: payload.body.error,
					submitted: false
				}
			}
			const convo = state.conversation
				? [...state.conversation, ...payload.body.conversation]
				: payload.discussion.conversation
			return {
				...state,
				conversation: convo,
				error: false,
				errorMsg: "",
				status: payload.status,
				submitted: true
			}

		case constants.UPDATE_DESCRIPTION:
			return {
				...state,
				description: payload.description
			}

		case constants.UPDATE_EXTRA:
			return {
				...state,
				extra: payload.extra
			}

		default:
			return state
	}
}

export default discussion
