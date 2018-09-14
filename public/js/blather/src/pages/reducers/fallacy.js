import * as constants from '../constants';

const initial = () => ({

})

const fallacy = (state = initial(), action) => {
    const payload = action.payload
    switch(action.type) {
        case constants.GET_FALLACY:
            const fallacy = payload.fallacy
            let contradiction = null
            let tweet = null
            let video = null

            if(fallacy.network === 'twitter') {
                tweet = JSON.parse(fallacy.tweet_json)
                if(fallacy.archive_code) {
                    tweet.archive = {
                        code: fallacy.archive_code,
                        date_created: fallacy.archive_date_created,
                        object_id: fallacy.archive_object_id
                    }
                } else {
                    tweet.archive = null
                }
            }

            if(fallacy.network === 'youtube') {
                video = {
                    channel: {
                        id: fallacy.video_channel_id,
                        img: fallacy.video_channel_img,
                        title: fallacy.video_channel_name
                    },
                    comment: {
                        dateCreated: fallacy.comment_created_at,
                        id: fallacy.comment_id,
                        likeCount: fallacy.comment_like_count,
                        message: fallacy.comment_message,
                        user: {
                            id: fallacy.comment_channel_id,
                            img: fallacy.page_profile_pic,
                            title: fallacy.page_name
                        }
                    },
                    dateCreated: fallacy.video_created_at,
                    description: fallacy.video_description,
                    id: fallacy.video_video_id,
                    startTime: fallacy.start_time,
                    stats: {
                        dislikeCount: parseInt(fallacy.video_dislike_count,10),
                        likeCount: parseInt(fallacy.video_like_count,10),
                        likePct: (fallacy.video_like_count/(fallacy.video_like_count+fallacy.video_dislike_count))*100,
                        viewCount: parseInt(fallacy.video_view_count,10)
                    },
                    title: fallacy.video_title
                }
            }

            if(payload.fallacy.contradiction_network === 'twitter') {
                contradiction = {
                    tweet: JSON.parse(fallacy.contradiction_tweet_json)
                }
            }

            if(payload.fallacy.contradiction_network === 'youtube') {
                let comment = null
                if(fallacy.contradiction_comment_id) {
                    comment = {
                        dateCreated: fallacy.contradiction_comment_created_at,
                        id: fallacy.contradiction_comment_id,
                        likeCount: fallacy.contradiction_comment_like_count,
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
                        comment: comment,
                        dateCreated: fallacy.contradiction_video_created_at,
                        description: fallacy.contradiction_video_description,
                        endTime: fallacy.contradiction_end_time,
                        id: fallacy.contradiction_video_video_id,
                        startTime: fallacy.contradiction_start_time,
                        stats: {
                            dislikeCount: parseInt(fallacy.contradiction_video_dislike_count,10),
                            likeCount: parseInt(fallacy.contradiction_video_like_count,10),
                            likePct: (fallacy.contradiction_video_like_count/(fallacy.contradiction_video_like_count+fallacy.contradiction_video_dislike_count))*100,
                            viewCount: parseInt(fallacy.contradiction_video_view_count,10)
                        },
                        title: fallacy.contradiction_video_video_title
                    }
                }
            }

            return {
                ...state,
                canRespond: fallacy.can_respond === '1',
                contradiction: contradiction,
                createdAt: fallacy.date_created,
                createdBy: {
                    id: parseInt(fallacy.user_id,10),
                    img: fallacy.user_img,
                    name: fallacy.user_name,
                    username: fallacy.user_username
                },
                explanation: fallacy.explanation,
                fallacyId: parseInt(fallacy.fallacy_id,10),
                fallacyName: fallacy.fallacy_name,
                status: parseInt(fallacy.status,10),
                title: fallacy.title,
                startTime: fallacy.start_time,
                tweet: tweet,
                user: {
                    id: fallacy.page_id,
                    img: fallacy.page_profile_pic,
                    name: fallacy.page_name,
                    type: fallacy.page_type,
                    username: fallacy.page_username
                },
                video: video,
                viewCount: parseInt(fallacy.view_count,10)
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
                conversation: payload.conversation
            }

        case constants.POST_COMMENT:
            const comments = state.comments.results ? [payload.comment, ...state.comments.results] : payload.comment
            const count = state.comments.count+1
            return {
                ...state,
                comments: {
                    count: count,
                    results: comments
                }
            }

        case constants.SET_FALLACY_TAGS:
            return {
                ...state,
                tags: [payload.tag]
            }

        case constants.SUBMIT_FALLACY_CONVERSATION:
            if(payload.error) {
                return {
                    ...state,
                    error: true,
                    errorMsg: payload.error,
                    submitted: false
                }
            }

            const convo = state.conversation ? [...state.conversation, ...payload.conversation] : payload.conversation
            return {
                ...state,
                conversation: convo,
                error: false,
                errorMsg: '',
                submitted: true
            }

        case constants.UPDATE_FALLACY:
            if(payload.error) {
                return {
                    ...state,
                }
            }
            return {
                ...state,
                explanation: payload.fallacy.explanation,
                fallacyId: parseInt(payload.fallacy.fallacyId, 10),
                fallacyName: payload.fallacy.fallacyName,
                title: payload.fallacy.title
            }

        default:
            return state;
    }
}

export default fallacy