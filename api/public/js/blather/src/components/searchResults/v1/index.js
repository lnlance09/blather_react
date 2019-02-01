import "./style.css"
import { fetchSearchResults } from "./actions"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
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
import store from "store"

class SearchResults extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: this.props.data,
			loading: true,
			page: 0
		}
		this.loadMore = _.debounce(this.loadMore.bind(this), 200)
	}

	componentDidMount() {
		this.props.fetchSearchResults({
			bearer: this.props.bearer,
			fallacies: this.props.fallacies,
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
			this.setState({ loading: false })
			this.props.fetchSearchResults({
				bearer: newProps.bearer,
				fallacies: newProps.fallacies,
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
			}, 200)
		}
		const formatData = result => {
			switch (this.props.type) {
				case "fallacies":
					let dateCreated = (
						<div>
							Assigned <Moment date={result.date_created} fromNow /> by{" "}
							{result.user_name}
						</div>
					)
					return {
						description: result.explanation,
						extra: null,
						img: result.page_profile_pic,
						meta: dateCreated,
						tags: [`${result.fallacy_name}`],
						title: result.title,
						url: `/fallacies/${result.id}`
					}
				case "twitter":
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
						url: `/pages/twitter/${result.username}`
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
						url: `/users/${result.username}`
					}
				case "youtube":
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
						url: `/pages/youtube/${result.social_media_id}`
					}
				default:
					return {}
			}
		}
		const lazyLoadMore = props => {
			if (props.hasMore && loadingMore) {
				return <LazyLoad />
			}
			return null
		}
		const linkAccountMsg = props => {
			if (props.authenticated && props.type === "twitter" && !props.linkedTwitter) {
				return (
					<Message className="linkAccountMsg" icon>
						<Icon className="twitterIcon" name="twitter" />
						<Message.Content>
							<Message.Header>Link your Twitter</Message.Header>
							You can search live results after you{" "}
							<Link to={`/settings/twitter`}>link</Link> your account
						</Message.Content>
					</Message>
				)
			}

			if (props.authenticated && props.type === "youtube" && !props.linkedYoutube) {
				return (
					<Message className="linkAccountMsg" icon>
						<Icon className="youtubeIcon" name="youtube" />
						<Message.Content>
							<Message.Header>Link your YouTube</Message.Header>
							You can search live results after you{" "}
							<Link to={`/settings/youtube`}>link</Link> your account
						</Message.Content>
					</Message>
				)
			}

			return null
		}
		const lazyLoad = this.props.data.map((result, i) => <LazyLoad key={`search_result_${i}`} />)
		const resultsHeader = count => (
			<Statistic size="tiny">
				<Statistic.Value>{formatNumber(count)}</Statistic.Value>
				<Statistic.Label>{formatPlural(count, "result")}</Statistic.Label>
			</Statistic>
		)
		const resultItems = props => {
			if (props.loading) {
				return <Item.Group divided>{lazyLoad}</Item.Group>
			}

			if (props.count > 0) {
				return <Item.Group divided>{searchResults}</Item.Group>
			}

			return (
				<div>
					<Message
						className="emptyMsg"
						content="Try modifying your search"
						header="No results..."
					/>
				</div>
			)
		}
		const searchResults = this.props.data.map((result, i) => {
			let itemData = formatData(result)
			return (
				<ResultItem
					description={itemData.description}
					extra={itemData.extra}
					history={this.props.history}
					id={`${this.props.type}_${i}`}
					img={itemData.img}
					key={`${this.props.type}_${i}`}
					meta={itemData.meta}
					sanitize
					tags={itemData.tags}
					title={itemData.title}
					type={this.props.type}
					url={itemData.url}
				/>
			)
		})

		return (
			<Provider store={store}>
				<div className="searchResults">
					<div>
						<div className="resultsCount">{resultsHeader(this.props.count)}</div>
						<div className="clearfix" />
					</div>
					{linkAccountMsg(this.props)}
					<Container className="searchContentContainer">
						<Visibility continuous offset={[50, 50]} onBottomVisible={this.loadMore}>
							{resultItems(this.props)}
							{lazyLoadMore(this.props)}
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
	linkedTwitter: PropTypes.bool,
	linkedYoutube: PropTypes.bool,
	loading: PropTypes.bool,
	nextPageToken: PropTypes.string,
	page: PropTypes.number,
	pages: PropTypes.number,
	q: PropTypes.string,
	refreshYouTubeToken: PropTypes.func,
	type: PropTypes.string
}

SearchResults.defaultProps = {
	count: 0,
	data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	error: false,
	fetchSearchResults: fetchSearchResults,
	hasMore: false,
	loading: true,
	page: 0,
	q: "",
	refreshYouTubeToken: refreshYouTubeToken,
	type: "twitter"
}

const mapStateToProps = (state, ownProps) => ({
	...state.searchResults,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		fetchSearchResults,
		refreshYouTubeToken
	}
)(SearchResults)
