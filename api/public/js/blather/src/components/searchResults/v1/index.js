import "./style.css"
import { fetchSearchResults, toggleSearchLoading } from "./actions"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatNumber, formatPlural } from "utils/textFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { Container, Icon, Item, Message, Statistic, Visibility } from "semantic-ui-react"
import _ from "lodash"
import itemPic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ResultItem from "components/item/v1/"
import Tweet from "components/tweet/v1/"
import store from "store"

class SearchResults extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: this.props.data,
			page: 0
		}
	}

	componentDidMount() {
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
		if (this.props.hasMore) {
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({
				loadingMore: true,
				page: newPage
			})
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
		const { loadingMore } = this.state

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
								<Icon name="arrow right" />{" "}
								<span>
									Assigned to <b>{result.page_name}</b>
								</span>
								<Icon className={`${result.network}Icon`} name={result.network} />
							</p>
							<p>
								<Icon name="clock outline" />
								<Moment date={adjustTimezone(result.date_created)} fromNow />
							</p>
						</div>
					)
					return {
						description: result.explanation,
						extra: null,
						img: result.page_profile_pic,
						meta: dateCreated,
						tags: [`${result.fallacy_name}`],
						title: result.title,
						truncate: false,
						url: `/fallacies/${result.id}`,
						useMarked: true
					}

				case "profiles":
					return {
						description: result.about,
						extra: {
							count: result.like_count,
							term: "follower"
						},
						img: result.profile_pic,
						meta: `@${result.username}`,
						tags: [],
						title: result.name,
						truncate: false,
						url: `/pages/twitter/${result.username}`,
						useMarked: false
					}

				case "users":
					return {
						description: result.about,
						extra: [
							{
								count: result.discussion_count,
								term: "discussion"
							},
							{ count: result.fallacy_count, term: "fallacy" }
						],
						img: result.profile_pic ? result.profile_pic : itemPic,
						meta: `@${result.username}`,
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
			if (props.hasMore && loadingMore) {
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

		const lazyLoad = this.props.data.map((result, i) => <LazyLoad key={`search_result_${i}`} />)

		const ResultsHeader = count => (
			<Statistic size="tiny">
				<Statistic.Value>{formatNumber(count)}</Statistic.Value>
				<Statistic.Label>{formatPlural(count, "result")}</Statistic.Label>
			</Statistic>
		)

		const ResultItems = ({ props }) => {
			if (props.loading) {
				return <Item.Group divided>{lazyLoad}</Item.Group>
			}

			if (props.count > 0) {
				return (
					<Item.Group divided>
						<SearchResults props={props} />
					</Item.Group>
				)
			}

			return (
				<Message
					className="emptyMsg"
					content="Try modifying your search"
					header="No results..."
					icon="search"
					warning
				/>
			)
		}

		const SearchResults = ({ props }) => {
			return props.data.map((result, i) => {
				if (props.type === "tweets" && result.tweet_json) {
					let marginTop = i === 0 ? 0 : 12
					let tweet = JSON.parse(result.tweet_json)
					return (
						<div key={`tweet_${i}`} style={{ marginTop: `${marginTop}px` }}>
							<Tweet
								created_at={tweet.created_at}
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
						sanitize
						tags={itemData.tags}
						title={itemData.title}
						truncate={itemData.truncate}
						type={props.type}
						url={itemData.url}
						useMarked={itemData.useMarked}
					/>
				)
			})
		}

		return (
			<Provider store={store}>
				<div className="searchResults">
					<div>
						<div className="resultsCount">{ResultsHeader(this.props.count)}</div>
						<div className="clearfix" />
					</div>
					{LinkAccountMsg(this.props)}
					<Container className="searchContentContainer">
						<Visibility continuous offset={[50, 50]} onBottomVisible={this.loadMore}>
							<ResultItems props={this.props} />
							{LazyLoadMore(this.props)}
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
	toggleSearchLoading,
	type: "profiles"
}

const mapStateToProps = (state, ownProps) => ({
	...state.searchResults,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		fetchSearchResults,
		refreshYouTubeToken,
		toggleSearchLoading
	}
)(SearchResults)
