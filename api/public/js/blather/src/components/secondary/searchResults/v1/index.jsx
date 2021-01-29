import "./style.css"
import { fetchSearchResults, resetSearchData, toggleSearchLoading } from "./actions"
import { refreshYouTubeToken } from "components/secondary/authentication/v1/actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { Container, Icon, Item, Message, Segment, Visibility } from "semantic-ui-react"
import _ from "lodash"
import itemPic from "images/images/image-square.png"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ResultItem from "components/primary/item/v1/"
import Tweet from "components/primary/tweet/v1/"
import store from "store"

class SearchResults extends Component {
	constructor(props) {
		super(props)
		this.state = {}

		this.loadMore = _.debounce(this.loadMore.bind(this), 800)
	}

	componentDidMount() {
		this.props.resetSearchData()
		this.props.fetchSearchResults({
			bearer: this.props.bearer,
			fallacies: this.props.fallacies,
			page: 0,
			q: this.props.q,
			type: this.props.type
		})
	}

	componentWillUpdate(newProps) {
		if (
			newProps.q !== this.props.q ||
			newProps.type !== this.props.type ||
			newProps.fallacies !== this.props.fallacies
		) {
			this.props.toggleSearchLoading()
			this.props.resetSearchData()
			this.props.fetchSearchResults({
				bearer: newProps.bearer,
				fallacies: newProps.fallacies,
				page: 0,
				q: newProps.q,
				type: newProps.type
			})
		}
	}

	loadMore = () => {
		if (this.props.hasMore && !this.props.loading) {
			let newPage = this.props.page + 1
			this.props.toggleSearchLoading()
			this.props.fetchSearchResults({
				bearer: this.props.bearer,
				fallacies: this.props.fallacies,
				nextPageToken: this.props.nextPageToken,
				q: this.props.q,
				page: newPage,
				type: this.props.type
			})
		}
	}

	render() {
		if (this.props.error && this.props.type === "youtube") {
			this.props.refreshYouTubeToken({
				bearer: this.props.bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		}

		const FormatData = result => {
			switch (this.props.type) {
				case "channels":
					let extra = null
					if (result.like_count) {
						extra = {
							count: result.like_count,
							term: "subscriber"
						}
					}
					return {
						description: result.about,
						extra: extra,
						img: result.profile_pic,
						meta: result.username,
						sanitize: true,
						tags: [],
						title: result.name,
						truncate: false,
						url: `/pages/youtube/${result.social_media_id}`,
						useMarked: false
					}

				case "fallacies":
					let dateCreated = (
						<div>
							<p>
								<span>
									Assigned to <b>{result.page_name}</b>
								</span>
							</p>
						</div>
					)
					return {
						description: result.explanation,
						extra: null,
						img: result.page_profile_pic,
						meta: dateCreated,
						sanitize: true,
						tags: [`${result.fallacy_name}`],
						title: result.title,
						truncate: false,
						url: `/fallacies/${result.id}`,
						useMarked: true
					}

				case "grifters":
					return {
						description: result.about,
						extra: null,
						img: result.profile_pic,
						meta: `${result.fallacy_count} fallacies`,
						sanitize: false,
						title: result.name,
						truncate: true,
						url: `/pages/twitter/${result.username}`,
						useMarked: false
					}

				case "profiles":
					return {
						description: result.about,
						img: result.profile_pic,
						meta: `@${result.username}`,
						tags: [],
						title: result.name,
						truncate: false,
						url: `/pages/twitter/${result.username}`,
						useMarked: false
					}

				case "tags":
					return {
						description: result.description,
						extra: null,
						img: result.tag_img,
						meta: (
							<div>
								Edited <Moment date={adjustTimezone(result.date_updated)} fromNow />
							</div>
						),
						sanitize: true,
						tags: [],
						title: result.value,
						truncate: true,
						url: `/tags/${result.slug}`,
						useMarked: false
					}

				case "users":
					return {
						description: result.about,
						img: result.profile_pic ? result.profile_pic : itemPic,
						meta: `@${result.username}`,
						sanitize: true,
						tags: [],
						title: result.name,
						truncate: true,
						url: `/users/${result.username}`,
						useMarked: false
					}

				case "videos":
					return {
						description: result.description,
						extra: null,
						img: result.img ? result.img.replace("default", "hqdefault") : null,
						meta: (
							<div>
								<p>
									<Icon name="clock outline" />
									<Moment date={adjustTimezone(result.date_created)} fromNow />
								</p>
							</div>
						),
						sanitize: true,
						tags: [],
						title: result.title,
						truncate: true,
						url: `/video/${result.video_id}`,
						useMarked: false
					}

				default:
					return {}
			}
		}

		const LazyLoadMore = props => {
			if (props.hasMore && props.loading) {
				return <LazyLoad />
			}
			return null
		}

		const LinkAccountMsg = props => {
			if (props.authenticated && props.type === "profiles" && !props.linkedTwitter) {
				return (
					<Message className="linkAccountMsg" icon>
						<Icon className="twitterIcon" name="twitter" />
						<Message.Content>
							<Message.Header>Link your Twitter</Message.Header>
							You can search live results after you{" "}
							<Link to="/settings/twitter">link</Link> your account
						</Message.Content>
					</Message>
				)
			}

			if (props.authenticated && props.type === "channels" && !props.linkedYoutube) {
				return (
					<Message className="linkAccountMsg" icon>
						<Icon className="youtubeIcon" name="youtube" />
						<Message.Content>
							<Message.Header>Link your YouTube</Message.Header>
							You can search live results after you{" "}
							<Link to="/settings/youtube">link</Link> your account
						</Message.Content>
					</Message>
				)
			}

			return null
		}

		const ResultItems = props => {
			if (props.count > 0) {
				return <Item.Group divided>{SearchResults(props)}</Item.Group>
			}

			if (props.count === 0) {
				return <LazyLoad />
			}

			return null
		}

		const SearchResults = props => {
			return props.data.map((result, i) => {
				if (props.type === "tweets" && result.tweet_json) {
					let marginTop = i === 0 ? 0 : 12
					let tweet = JSON.parse(result.tweet_json)
					return (
						<div key={`tweet_${i}`} style={{ marginTop: `${marginTop}px` }}>
							<Tweet
								created_at={tweet.created_at}
								displayTextRange={tweet.display_text_range}
								extended_entities={tweet.extended_entities}
								full_text={tweet.full_text}
								highlight={true}
								highlightedText={props.q}
								id={tweet.id_str}
								imageSize="medium"
								key={`tweet_key_${i}`}
								is_quote_status={tweet.is_quote_status}
								quoted_status={
									tweet.quoted_status === undefined && tweet.is_quote_status
										? tweet.retweeted_status
										: tweet.quoted_status
								}
								quoted_status_id_str={tweet.quoted_status_id_str}
								quoted_status_permalink={tweet.quoted_status_permalink}
								redirect
								retweeted_status={
									tweet.retweeted_status === undefined
										? false
										: tweet.retweeted_status
								}
								stats={{
									favorite_count: tweet.favorite_count,
									retweet_count: tweet.retweet_count
								}}
								user={{
									id: tweet.user.id,
									name: tweet.user.name,
									profile_image_url_https: tweet.user.profile_image_url_https,
									screen_name: tweet.user.screen_name
								}}
								{...this.props.history}
							/>
						</div>
					)
				}

				if (
					result.id ||
					result.video_id ||
					result.tweet_id ||
					result.social_media_id ||
					result.channel_id
				) {
					let itemData = FormatData(result)
					return (
						<ResultItem
							description={itemData.description}
							extra={itemData.extra}
							highlight={props.q !== "" && props.type === "fallacies"}
							highlightText={props.q}
							history={props.history}
							id={`${props.type}_${i}`}
							img={itemData.img}
							key={`${props.type}_${i}`}
							meta={itemData.meta}
							sanitize={itemData.sanitize}
							tags={itemData.tags}
							title={itemData.title}
							truncate={itemData.truncate}
							type={props.type}
							url={itemData.url}
							useMarked={itemData.useMarked}
						/>
					)
				}

				return <LazyLoad />
			})
		}

		return (
			<Provider store={store}>
				<div className="searchResults">
					{LinkAccountMsg(this.props)}
					<Container className="searchContentContainer">
						<Visibility continuous onBottomVisible={this.loadMore}>
							<Segment className="resultsSegment" inverted>
								{this.props.count === 0 && !this.props.loading && (
									<Message
										className="emptyMsg"
										content="Try modifying your search"
										header="No results..."
										icon="search"
										warning
									/>
								)}
								{ResultItems(this.props)}
								{LazyLoadMore(this.props)}
							</Segment>
						</Visibility>
					</Container>
				</div>
			</Provider>
		)
	}
}

SearchResults.propTypes = {
	authenticated: PropTypes.bool,
	count: PropTypes.number,
	data: PropTypes.array,
	error: PropTypes.bool,
	fetchSearchResults: PropTypes.func,
	hasMore: PropTypes.bool,
	history: PropTypes.object,
	linkedTwitter: PropTypes.bool,
	linkedYoutube: PropTypes.bool,
	loading: PropTypes.bool,
	nextPageToken: PropTypes.string,
	page: PropTypes.number,
	pages: PropTypes.number,
	q: PropTypes.string,
	refreshYouTubeToken: PropTypes.func,
	resetSearchData: PropTypes.func,
	toggleSearchLoading: PropTypes.func,
	type: PropTypes.string
}

SearchResults.defaultProps = {
	count: 0,
	data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	error: false,
	fetchSearchResults,
	hasMore: false,
	loading: true,
	page: 0,
	q: "",
	refreshYouTubeToken,
	resetSearchData,
	toggleSearchLoading,
	type: "profiles"
}

const mapStateToProps = (state, ownProps) => ({
	...state.searchResults,
	...ownProps
})

export default connect(mapStateToProps, {
	fetchSearchResults,
	refreshYouTubeToken,
	resetSearchData,
	toggleSearchLoading
})(SearchResults)
