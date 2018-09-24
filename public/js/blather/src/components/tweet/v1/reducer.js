import * as constants from "./constants"

const initial = () => ({})

const test = (state = initial(), action) => {
	switch (action.type) {
		case constants.SET_DATA:
			let quoted_tweet = {}
			if (action.payload.is_quote_status) {
				const quote = action.payload.quoted_status
				let qFullText = quote.full_text

				if (quote.display_text_range.length > 0) {
					const qTextStart = quote.display_text_range[0]
					const qTextLength = quote.display_text_range[1]
					qFullText = quote.full_text.substring(qTextStart, qTextLength)
				}

				quoted_tweet = {
					created_at: quote.created_at,
					extended_entities: quote.extended_entities,
					full_text: qFullText,
					id: quote.id,
					stats: {
						favorite_count: quote.favorite_count,
						retweet_count: quote.retweet_count
					},
					user: {
						description: quote.user.description,
						id: quote.user.id,
						location: quote.user.location,
						name: quote.user.name,
						profile_image_url: quote.user.profile_image_url,
						screen_name: quote.user.screen_name
					}
				}
			}

			let fullText = action.payload.full_text
			if (action.payload.display_text_range) {
				const textStart = action.payload.display_text_range[0]
				const textLength = action.payload.display_text_range[1]
				fullText = action.payload.full_text.substring(textStart, textLength)
			}

			return {
				...state,
				created_at: action.payload.created_at,
				extended_entities: action.payload.extended_entities,
				full_text: fullText,
				id: action.payload.id,
				is_quote_status: action.payload.is_quote_status,
				quoted_status: quoted_tweet,
				stats: {
					favorite_count: action.payload.favorite_count,
					retweet_count: action.payload.retweet_count
				},
				user: {
					description: action.payload.user.description,
					id: action.payload.user.id,
					location: action.payload.user.location,
					name: action.payload.user.name,
					profile_image_url: action.payload.user.profile_image_url,
					screen_name: action.payload.user.screen_name
				}
			}
		default:
			return state
	}
}

export default test
