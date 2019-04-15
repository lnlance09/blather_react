import "./style.css"
import { fetchPagePosts } from "./actions"
import { connect } from "react-redux"
import { Item, Message, Visibility } from "semantic-ui-react"
import _ from "lodash"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Tweet from "components/tweet/v1/"

class TweetList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loading: false,
			page: 0
		}

		this.loadMoreItems = _.debounce(this.loadMoreItems.bind(this), 200)
	}

	componentWillMount() {
		this.props.fetchPagePosts({
			bearer: this.props.bearer,
			id: this.props.username,
			type: "twitter"
		})
	}

	componentWillReceiveProps(props) {
		if (this.props.username !== props.username) {
			this.props.fetchPagePosts({
				bearer: props.bearer,
				id: props.username,
				type: "twitter"
			})
		}
	}

	loadMoreItems = () => {
		if (this.props.posts.hasMore) {
			const lastId = this.props.posts.lastId
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({ loading: true, page: newPage })
			this.props.fetchPagePosts({
				bearer: this.props.bearer,
				id: this.props.username,
				lastId,
				page: newPage,
				type: "twitter"
			})
		}
	}

	render() {
		const { loading } = this.state

		const EmptyMsg = props => {
			if (!props.posts.loading && props.posts.count === 0) {
				return (
					<Message
						content={props.posts.blocked ? props.posts.errorMsg : props.emptyMsgHeader}
					/>
				)
			}
			return null
		}

		const RenderTweets = this.props.posts.data.map((post, i) => {
			let marginTop = i === 0 ? 0 : 12
			if (post.id) {
				return (
					<div key={`tweet_${i}`} style={{ marginTop: `${marginTop}px` }}>
						<Tweet
							created_at={post.created_at}
							extended_entities={post.extended_entities}
							full_text={post.full_text}
							id={post.id_str}
							imageSize="medium"
							key={`tweet_key_${i}`}
							is_quote_status={post.is_quote_status}
							quoted_status={
								post.quoted_status === undefined && post.is_quote_status
									? post.retweeted_status
									: post.quoted_status
							}
							quoted_status_id_str={post.quoted_status_id_str}
							quoted_status_permalink={post.quoted_status_permalink}
							redirect
							retweeted_status={
								post.retweeted_status === undefined ? false : post.retweeted_status
							}
							stats={{
								favorite_count: post.favorite_count,
								retweet_count: post.retweet_count
							}}
							user={{
								id: post.user.id,
								name: post.user.name,
								profile_image_url_https: post.user.profile_image_url_https,
								screen_name: post.user.screen_name
							}}
							{...this.props.history}
						/>
					</div>
				)
			} else {
				return <LazyLoad key={`tweet_${i}`} style={{ marginTop: `${marginTop}px` }} />
			}
		})

		const lazyLoadMore = props => {
			if (loading && props.posts.hasMore) {
				return <LazyLoad />
			}
		}

		return (
			<div className="tweetList">
				<Visibility continuous offset={[50, 50]} onBottomVisible={this.loadMoreItems}>
					<Item.Group>{RenderTweets}</Item.Group>
					{lazyLoadMore(this.props)}
				</Visibility>
				{EmptyMsg(this.props)}
			</div>
		)
	}
}

TweetList.propTypes = {
	bearer: PropTypes.string,
	emptyMsgContent: PropTypes.string,
	emptyMsgHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	fetchPagePosts: PropTypes.func,
	page: PropTypes.number,
	posts: PropTypes.shape({
		blocked: PropTypes.bool,
		count: PropTypes.number,
		data: PropTypes.array,
		error: PropTypes.bool,
		errorMsg: PropTypes.string,
		errorType: PropTypes.number,
		hasMore: PropTypes.bool,
		loading: PropTypes.bool
	}),
	username: PropTypes.string
}

TweetList.defaultProps = {
	emptyMsgContent: "",
	emptyMsgHeader: "This user has not tweeted yet",
	fetchPagePosts,
	page: 0,
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}],
		loading: true
	}
}

const mapStateToProps = (state, ownProps) => ({
	...state.tweetList,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ fetchPagePosts }
)(TweetList)
