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
			let s3Pic = ""
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

			let archives = payload.archives

			if (payload.type === "tweet") {
				s3Pic = payload.profile_pic
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

				if (action.a) {
					archives = [
						archives.find(item => item.id === action.a),
						...archives.filter(item => item.id !== action.a)
					]
				}
			}

			return {
				...state,
				archive: payload.archive,
				archives,
				error: payload.error,
				errorCode: payload.code,
				existsOnYt,
				info,
				needToRefresh,
				pageInfo,
				profileImg,
				s3Pic,
				type: payload.type
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

		case constants.UNSET_COMMENT:
			return {
				...state,
				archive: false,
				info: {
					...state.info,
					comment: null
				}
			}

		default:
			return state
	}
}

export default post
