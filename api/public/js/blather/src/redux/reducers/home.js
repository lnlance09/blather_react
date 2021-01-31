import * as constants from "../constants"

const initial = () => ({})

const home = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.GET_HIT_LIST:
			return {
				...state,
				hitList: payload.pages
			}

		case constants.GET_POST_FROM_URL:
			if (payload.error) {
				return {
					...state.post,
					error: payload.error,
					errorCode: payload.code,
					needToRefresh: payload.need_to_refresh,
					type: payload.type
				}
			}

			const mediaId = payload.mediaId
			const network = payload.network
			let info = {}
			let page = {}
			let profileImg = ""

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
				page = {
					id: payload.data.commenter.id,
					name: payload.data.commenter.title,
					type: "comment",
					username: ""
				}
			}

			let archives = payload.archives

			if (payload.type === "tweet") {
				info = payload.data
				page = {
					id: info.user.id_str,
					img: info.user.profile_image_url_https,
					name: info.user.name,
					type: "twitter",
					username: info.user.screen_name
				}
				profileImg = payload.data.user.profile_image_url_https
				if (payload.data.retweeted_status) {
					profileImg = payload.data.retweeted_status.user.profile_image_url_https
				}
			}

			if (payload.type === "video") {
				info = payload.data
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
				fetched: true,
				info,
				mediaId,
				network,
				page,
				profileImg,
				type: payload.type
			}

		case constants.GET_TWEETS_FOR_ASSIGNMENT:
			return {
				...state,
				tweets: payload.tweets
			}

		case constants.RESET_FETCHED:
			return {
				...state,
				fetched: !state.fetched
			}

		default:
			return state
	}
}

export default home
