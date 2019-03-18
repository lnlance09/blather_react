import * as constants from "../constants"

const initial = () => ({})

const fallacy = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.GET_FALLACY:
			if (payload.error) {
				return {
					...state,
					error: true
				}
			}

			const archive = payload.archive
			const contradiction_archive = payload.contradiction_archive
			const fallacy = payload.fallacy
			const similarCount = payload.similarCount
			let contradiction = null
			let tweet = null
			let video = null

			if (fallacy.network === "twitter") {
				tweet = JSON.parse(fallacy.tweet_json)
				tweet.archive = null
				if (archive) {
					tweet.archive = {
						code: archive.code,
						date_created: archive.date_created
					}
				}
			}

			if (fallacy.network === "youtube") {
				let comment = null
				if (fallacy.comment_video_id) {
					comment = {
						dateCreated: fallacy.comment_created_at,
						id: fallacy.comment_id,
						likeCount: parseInt(fallacy.comment_like_count, 10),
						message: fallacy.comment_message,
						user: {
							id: fallacy.comment_channel_id,
							img: fallacy.page_profile_pic,
							title: fallacy.page_name
						}
					}
				}
				video = {
					channel: {
						id: fallacy.video_channel_id,
						img: fallacy.video_channel_img,
						title: fallacy.video_channel_name
					},
					comment: comment,
					dateCreated: fallacy.video_created_at,
					description: fallacy.video_description,
					endTime: fallacy.end_time,
					id: fallacy.video_video_id,
					startTime: fallacy.start_time,
					stats: {
						dislikeCount: parseInt(fallacy.video_dislike_count, 10),
						likeCount: parseInt(fallacy.video_like_count, 10),
						likePct:
							(fallacy.video_like_count /
								(fallacy.video_like_count + fallacy.video_dislike_count)) *
							100,
						viewCount: parseInt(fallacy.video_view_count, 10)
					},
					title: fallacy.video_title
				}
			}

			if (payload.fallacy.contradiction_network === "twitter") {
				let contradiction_tweet = JSON.parse(fallacy.contradiction_tweet_json)
				contradiction_tweet.archive = contradiction_archive
				contradiction = {
					highlightedText:
						fallacy.contradiction_highlighted_text === ""
							? null
							: fallacy.contradiction_highlighted_text,
					tweet: contradiction_tweet,
					user: {
						img: fallacy.contradiction_page_profile_pic
					}
				}
			}

			if (payload.fallacy.contradiction_network === "youtube") {
				let contradictionComment = null
				if (fallacy.contradiction_comment_id) {
					contradictionComment = {
						dateCreated: fallacy.contradiction_comment_created_at,
						id: fallacy.contradiction_comment_id,
						likeCount: parseInt(fallacy.contradiction_comment_like_count, 10),
						message: fallacy.contradiction_comment_message,
						user: {
							id: fallacy.contradiction_comment_channel_id,
							img: fallacy.contradiction_page_profile_pic,
							title: fallacy.contradiction_page_name
						}
					}
				}
				contradiction = {
					video: {
						channel: {
							id: fallacy.contradiction_video_channel_id,
							img: fallacy.contradiction_page_profile_pic,
							title: fallacy.contradiction_page_name
						},
						comment: contradictionComment,
						dateCreated: fallacy.contradiction_video_created_at,
						description: fallacy.contradiction_video_description,
						endTime: fallacy.contradiction_end_time,
						id: fallacy.contradiction_video_video_id,
						startTime: fallacy.contradiction_start_time,
						stats: {
							dislikeCount: parseInt(fallacy.contradiction_video_dislike_count, 10),
							likeCount: parseInt(fallacy.contradiction_video_like_count, 10),
							likePct:
								(fallacy.contradiction_video_like_count /
									(fallacy.contradiction_video_like_count +
										fallacy.contradiction_video_dislike_count)) *
								100,
							viewCount: parseInt(fallacy.contradiction_video_view_count, 10)
						},
						title: fallacy.contradiction_video_video_title
					}
				}
			}

			return {
				...state,
				canRespond: fallacy.can_respond === "1",
				contradiction,
				createdAt: fallacy.date_created,
				createdBy: {
					id: parseInt(fallacy.user_id, 10),
					img: fallacy.user_img,
					name: fallacy.user_name,
					username: fallacy.user_username
				},
				error: false,
				explanation: fallacy.explanation,
				fallacyId: parseInt(fallacy.fallacy_id, 10),
				fallacyName: fallacy.fallacy_name,
				highlightedText: fallacy.highlighted_text === "" ? null : fallacy.highlighted_text,
				status: parseInt(fallacy.status, 10),
				title: fallacy.title,
				similarCount,
				startTime: fallacy.start_time,
				tag_ids: fallacy.tag_ids,
				tag_names: fallacy.tag_names,
				tweet,
				user: {
					id: fallacy.page_id,
					img: fallacy.page_profile_pic,
					name: fallacy.page_name,
					type: fallacy.page_type,
					username: fallacy.page_username
				},
				video,
				viewCount: parseInt(fallacy.view_count, 10)
			}

		case constants.EDIT_EXPLANATION:
			return {
				...state,
				explanation: payload.explanation
			}

		case constants.GET_COMMENTS:
			return {
				...state,
				comments: {
					count: payload.count,
					results: payload.comments
				}
			}

		case constants.GET_FALLACY_COMMENT_COUNT:
			return {
				...state,
				commentCount: payload.count
			}

		case constants.GET_FALLACY_CONVERSATION:
			return {
				...state,
				conversation: payload.conversation,
				convoLoading: false
			}

		case constants.POST_COMMENT:
			const comments = state.comments.results
				? [payload.comment, ...state.comments.results]
				: payload.comment
			return {
				...state,
				comments: {
					count: state.comments.count + 1,
					results: comments
				}
			}

		case constants.REMOVE_FALLACY_TAG:
			let tagIds = state.tag_ids.split(",")
			let tagNames = state.tag_names.split(",")
			tagIds = tagIds.filter(
				item => parseInt(item.trim(), 10) !== parseInt(payload.id.trim(), 10)
			)
			tagNames = tagNames.filter(item => item.trim() !== payload.name.trim())

			return {
				...state,
				tag_ids: tagIds.join(","),
				tag_names: tagNames.join(",")
			}

		case constants.SET_FALLACY_TAGS:
			return {
				...state,
				tags: [payload.tag]
			}

		case constants.SUBMIT_FALLACY_CONVERSATION:
			if (payload.error) {
				return {
					...state,
					error: true,
					errorMsg: payload.error,
					submitted: false
				}
			}
			const convo = state.conversation
				? [...state.conversation, ...payload.conversation]
				: payload.conversation
			return {
				...state,
				conversation: convo,
				error: false,
				errorMsg: "",
				status: payload.conversation.status,
				submitted: true
			}

		case constants.UPDATE_FALLACY:
			if (payload.error) {
				return {
					...state
				}
			}
			return {
				...state,
				explanation: payload.fallacy.explanation,
				fallacyId: parseInt(payload.fallacy.fallacy_id, 10),
				fallacyName: payload.fallacy.fallacy_name,
				tag_ids: payload.fallacy.tag_ids,
				tag_names: payload.fallacy.tag_names,
				title: payload.fallacy.title
			}

		default:
			return state
	}
}

export default fallacy
