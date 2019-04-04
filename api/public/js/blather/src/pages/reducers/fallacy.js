import * as constants from "../constants"

const initial = () => ({})

const fallacy = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.CREATE_FALLACY_VIDEO:
			return {
				...state,
				creating: false,
				exportVideoUrl: payload.video
			}

		case constants.GET_FALLACY:
			if (payload.error) {
				return {
					...state,
					error: true
				}
			}

			/* Parse the material. The tweet and/or video */
			const archive = payload.archive
			const contradictionArchive = payload.contradictionArchive
			const fallacy = payload.fallacy
			const similarCount = payload.similarCount
			let contradiction = null
			let contradictionTweet = null
			let comment = null
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
				if (fallacy.comment_id) {
					comment = {
						dateCreated: fallacy.comment_created_at,
						id: fallacy.comment_id,
						likeCount: parseInt(fallacy.comment_like_count, 10),
						message: fallacy.comment_message,
						user: {
							id: fallacy.comment_channel_id,
							img: fallacy.page_profile_pic,
							title: fallacy.page_name
						},
						videoId: fallacy.comment_video_id
					}
				} else {
					video = {
						channel: {
							id: fallacy.video_channel_id,
							img: fallacy.video_channel_img,
							title: fallacy.video_channel_name
						},
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
			}

			if (payload.fallacy.contradiction_network === "twitter") {
				contradictionTweet = JSON.parse(fallacy.contradiction_tweet_json)
				contradictionTweet.archive = contradictionArchive
				contradiction = {
					highlightedText:
						fallacy.contradiction_highlighted_text === ""
							? null
							: fallacy.contradiction_highlighted_text,
					tweet: contradictionTweet,
					user: {
						img: fallacy.contradiction_page_profile_pic
					}
				}
			}

			if (payload.fallacy.contradiction_network === "youtube") {
				if (fallacy.contradiction_comment_id) {
					contradiction = {
						comment: {
							dateCreated: fallacy.contradiction_comment_created_at,
							id: fallacy.contradiction_comment_id,
							likeCount: parseInt(fallacy.contradiction_comment_like_count, 10),
							message: fallacy.contradiction_comment_message,
							user: {
								id: fallacy.contradiction_comment_channel_id,
								img: fallacy.contradiction_page_profile_pic,
								title: fallacy.contradiction_page_name
							},
							videoId: fallacy.contradiction_comment_video_id
						},
						highlightedText:
							fallacy.contradiction_highlighted_text === ""
								? null
								: fallacy.contradiction_highlighted_text
					}
				} else {
					contradiction = {
						video: {
							channel: {
								id: fallacy.contradiction_video_channel_id,
								img: fallacy.contradiction_page_profile_pic,
								title: fallacy.contradiction_page_name
							},
							dateCreated: fallacy.contradiction_video_created_at,
							description: fallacy.contradiction_video_description,
							endTime: fallacy.contradiction_end_time,
							id: fallacy.contradiction_video_video_id,
							startTime: fallacy.contradiction_start_time,
							stats: {
								dislikeCount: parseInt(
									fallacy.contradiction_video_dislike_count,
									10
								),
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
			}

			const user = {
				id: fallacy.page_id,
				img: fallacy.page_profile_pic,
				name: fallacy.page_name,
				type: fallacy.page_type,
				username: fallacy.page_username
			}
			const pageTitle = `@${user.username} ${fallacy.title} - ${fallacy.fallacy_name} by ${
				user.name
			}`

			/* Determine what kind of export can be made */
			const refId = fallacy.ref_id
			const videoRefIds = [4, 5, 6, 7, 8]
			let canMakeVideo = false
			let screenshotEl = "tweetContradiction"
			let originalPayload = {}
			let contradictionPayload = {}

			if (
				(refId === 3 || refId === 11) &&
				contradiction.video.endTime - contradiction.video.startTime < 61 &&
				contradiction.video.endTime > 0
			) {
				canMakeVideo = true

				// original content is a tweet
				if (refId === 3) {
					screenshotEl = "tweetOriginal"
					originalPayload = {
						date: tweet.created_at,
						id: tweet.id,
						type: "tweet"
					}
				}

				// original content is a comment
				if (refId === 11) {
					screenshotEl = "commentOriginal"
					originalPayload = {
						date: comment.dateCreated,
						id: comment.id,
						type: "comment"
					}
				}

				contradictionPayload = {
					date: contradiction.video.dateCreated,
					endTime: parseInt(contradiction.video.endTime, 10),
					id: contradiction.video.id,
					startTime: parseInt(contradiction.video.startTime, 10),
					type: "video"
				}
			}

			if (videoRefIds.includes(refId)) {
				if (video.endTime - video.startTime < 61 && video.endTime > 0) {
					canMakeVideo = true
				}
				if (
					refId === 6 &&
					contradiction.video.endTime - contradiction.video.startTime > 60
				) {
					canMakeVideo = false
				}

				// original content is a video
				originalPayload = {
					date: video.dateCreated,
					endTime: parseInt(video.endTime, 10),
					id: video.id,
					startTime: parseInt(video.startTime, 10),
					type: "video"
				}
			}

			// contradiction is a video
			if (refId === 6) {
				contradictionPayload = {
					date: contradiction.video.dateCreated,
					endTime: parseInt(contradiction.video.endTime, 10),
					id: contradiction.video.id,
					startTime: parseInt(contradiction.video.startTime, 10),
					type: "video"
				}
			}

			// contradiction is a comment
			if (refId === 7 || refId === 10) {
				if (refId === 7) {
					screenshotEl = "commentContradiction"
				}

				contradictionPayload = {
					date: contradiction.comment.dateCreated,
					id: contradiction.comment.id,
					type: "comment"
				}
			}

			// contradiction is a tweet
			if (refId === 8) {
				contradictionPayload = {
					date: contradiction.tweet.created_at,
					id: contradiction.tweet.id,
					type: "tweet"
				}
			}

			const canScreenshot = [1, 2, 9, 10].includes(refId)

			return {
				...state,
				canMakeVideo,
				canRespond: fallacy.can_respond === "1",
				canScreenshot,
				comment,
				contradiction,
				contradictionPayload,
				createdAt: fallacy.date_created,
				createdBy: {
					id: parseInt(fallacy.user_id, 10),
					img: fallacy.user_img,
					name: fallacy.user_name,
					username: fallacy.user_username
				},
				endTime: fallacy.end_time,
				error: false,
				explanation: fallacy.explanation,
				fallacyId: parseInt(fallacy.fallacy_id, 10),
				fallacyName: fallacy.fallacy_name,
				highlightedText: fallacy.highlighted_text === "" ? null : fallacy.highlighted_text,
				id: parseInt(fallacy.id, 10),
				originalPayload,
				pageTitle,
				refId,
				s3Link: fallacy.s3_link,
				screenshotEl,
				status: parseInt(fallacy.status, 10),
				similarCount,
				startTime: fallacy.start_time,
				tag_ids: fallacy.tag_ids,
				tag_names: fallacy.tag_names,
				title: fallacy.title,
				tweet,
				user,
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
			const conversation = state.conversation
				? [...state.conversation, ...payload.conversation]
				: payload.conversation
			return {
				...state,
				conversation,
				error: false,
				errorMsg: "",
				status: payload.conversation.status,
				submitted: true
			}

		case constants.TOGGLE_CREATE_MODE:
			return {
				...state,
				creating: !state.toggle
			}

		case constants.UPDATE_FALLACY:
			if (payload.error) {
				return {
					...state
				}
			}

			contradiction = state.contradiction
			originalPayload = state.originalPayload
			contradictionPayload = state.contradictionPayload

			let validOriginalLength = true
			let validContradictionLength = true
			let startTime = parseInt(payload.fallacy.start_time, 10)
			let endTime = parseInt(payload.fallacy.end_time, 10)

			if (payload.fallacy.network === "youtube" && payload.fallacy.comment_id === null) {
				validOriginalLength = false
				if (endTime - startTime < 61 && endTime > 0) {
					validOriginalLength = true
				}

				originalPayload = {
					...state.originalPayload,
					endTime,
					startTime
				}
			}

			if (
				payload.fallacy.contradiction_network === "youtube" &&
				payload.fallacy.contradiction_comment_id === null
			) {
				startTime = parseInt(payload.fallacy.contradiction_start_time, 10)
				endTime = parseInt(payload.fallacy.contradiction_end_time, 10)

				validContradictionLength = false
				if (endTime - startTime < 61 && endTime > 0) {
					validContradictionLength = true
				}

				contradiction = {
					...state.contradiction,
					video: {
						...state.contradiction.video,
						endTime,
						startTime
					}
				}

				contradictionPayload = {
					...state.contradictionPayload,
					endTime,
					startTime
				}
			}

			return {
				...state,
				canMakeVideo: validOriginalLength && validContradictionLength,
				contradiction,
				contradictionPayload,
				endTime: payload.fallacy.end_time,
				explanation: payload.fallacy.explanation,
				fallacyId: parseInt(payload.fallacy.fallacy_id, 10),
				fallacyName: payload.fallacy.fallacy_name,
				originalPayload,
				startTime: payload.fallacy.start_time,
				tag_ids: payload.fallacy.tag_ids,
				tag_names: payload.fallacy.tag_names,
				title: payload.fallacy.title
			}

		default:
			return state
	}
}

export default fallacy
