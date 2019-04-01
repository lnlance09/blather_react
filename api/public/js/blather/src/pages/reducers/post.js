import * as constants from "../constants"

const initial = () => ({})

const post = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.CREATE_ARCHIVE:
			return {
				...state,
				archive: action.payload.archive
			}

		case constants.CREATE_COMMENT_ARCHIVE:
			return {
				...state,
				archive: action.payload.archive
			}

		case constants.CREATE_VIDEO_ARCHIVE:
			if (action.payload.error) {
				return {
					...state,
					archiveError: true,
					archiveErrorMsg: action.payload.error
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
						? [...state.archives, action.payload.archive]
						: [action.payload.archive],
				myArchives:
					state.myArchives.length > 0
						? [...state.myArchives, action.payload.archive]
						: [action.payload.archive]
			}

		case constants.DELETE_ARCHIVE:
			return {
				...state,
				archives: state.archives.filter(item => item.id !== action.payload.id),
				myArchives: state.myArchives.filter(item => item.id !== action.payload.id)
			}

		case constants.FETCH_VIDEO_COMMENTS:
			if (action.payload.error) {
				return {
					...state,
					comments: {
						code: action.payload.code,
						error: action.payload.error
					}
				}
			}

			const items =
				action.payload.page > 0
					? [...state.comments.items, ...action.payload.comments.items]
					: action.payload.comments.items
			return {
				...state,
				comments: {
					code: action.payload.code,
					count: action.payload.comments.count,
					error: action.payload.error,
					items: items,
					nextPageToken: action.payload.comments.nextPageToken,
					page: action.payload.page
				}
			}

		case constants.GET_POST_DATA:
			if (payload.error) {
				return {
					...state.post,
					error: payload.error,
					errorCode: payload.code,
					needToRefresh: payload.need_to_refresh
				}
			}

			let pageInfo = {}
			let profileImg = ""
			let existsOnYt = true
			let needToRefresh = false
			let info = {}

			if (payload.type === "comment") {
				profileImg = payload.data.commenter.img
				info.comment = {
					dateCreated: payload.data.date_created,
					id: payload.data.id,
					likeCount: parseInt(payload.data.like_count, 10),
					message: payload.data.message,
					user: {
						id: payload.data.commenter.id,
						img: payload.data.commenter.img,
						title: payload.data.commenter.title
					}
				}
				pageInfo = {
					id: payload.data.commenter.id,
					name: payload.data.commenter.title,
					type: "comment",
					username: ""
				}
			}

			if (payload.type === "tweet") {
				info = payload.data
				profileImg = payload.data.user.profile_image_url_https
				if (payload.data.retweeted_status) {
					profileImg = payload.data.retweeted_status.user.profile_image_url_https
				}
			}

			if (payload.type === "video") {
				info = payload.data
				existsOnYt = payload.exists_on_yt
				needToRefresh = payload.need_to_refresh
				if (!payload.error) {
					profileImg = payload.data.channel.img
				}
			}

			return {
				...state.post,
				archive: payload.archive,
				archives: payload.archives,
				error: payload.error,
				errorCode: payload.code,
				existsOnYt,
				info,
				needToRefresh,
				pageInfo,
				profileImg,
				type: payload.type
			}

		case constants.GET_VIDEO_ARCHIVES:
			return {
				...state,
				myArchives: payload.archives
			}

		case constants.INSERT_COMMENT:
			return {
				...state,
				archive: payload.archive,
				info: {
					...state.info,
					comment: {
						dateCreated: payload.data.date_created,
						id: payload.data.id,
						likeCount: payload.data.like_count,
						message: payload.data.message,
						user: {
							about: payload.data.commenter.about,
							id: payload.data.commenter.id,
							img: payload.data.commenter.img,
							title: payload.data.commenter.title
						}
					}
				},
				pageInfo: {
					id: payload.data.commenter.id,
					name: payload.data.commenter.title,
					type: "comment",
					username: ""
				}
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
					endTime: action.payload
				}
			}

		case constants.UNSET_COMMENT:
			return {
				...state,
				archive: false,
				info: {
					...state.info,
					comment: null
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

export default post
