import "./style.css"
import { mapIdsToNames } from "utils/arrayFunctions"
import { getFeed } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatGrammar, formatPlural } from "utils/textFunctions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { Feed, Image, Label, Visibility } from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Lightbox from "react-image-lightbox"
import Marked from "marked"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Tweet from "components/tweet/v1/"

class FeedComponent extends Component {
	constructor(props) {
		super(props)
		this.state = {
			currentImg: "",
			lightboxOpen: false,
			loadingMore: false,
			page: 0
		}

		Marked.setOptions({
			renderer: new Marked.Renderer(),
			highlight: function(code) {
				// return require('highlight.js').highlightAuto(code).value;
			},
			pedantic: false,
			breaks: false,
			sanitize: false,
			smartLists: true,
			smartypants: false,
			xhtml: false
		})
	}

	componentDidMount() {
		if (this.props.count === 0) {
			this.props.getFeed({ page: 0 })
		}
	}

	loadMore = () => {
		if (this.props.hasMore) {
			const newPage = parseInt(this.props.page + 1, 10)
			if (newPage > this.state.page) {
				this.setState({ loadingMore: true, page: newPage })
				this.props.getFeed({ page: newPage })
			}
		}
	}

	render() {
		const { currentImg, lightboxOpen, loadingMore } = this.state

		const LazyLoadMore = props => {
			if (loadingMore && props.hasMore) {
				return <LazyLoad />
			}
		}

		const RenderFeed = props => {
			return props.results.map((result, i) => {
				if (result.id && result.item_type === "fallacy") {
					let userLink = `/pages/${result.page_type}/${
						result.page_type === "twitter" ? result.page_username : result.page_id
					}`

					return (
						<Feed.Event key={`feed_${i}`}>
							<Feed.Label
								image={result.page_profile_pic}
								onClick={() => props.history.push(userLink)}
								onError={i => (i.target.src = ImagePic)}
							/>
							<Feed.Content>
								<Feed.Summary>
									<Link to={userLink}>{result.page_name}</Link> has been charged
									with {formatGrammar(result.fallacy_name)}{" "}
									<Link to={`/fallacies/${result.slug}`}>
										{result.fallacy_name}
									</Link>
									<Feed.Date>
										<Moment
											date={adjustTimezone(result.date_created)}
											fromNow
										/>
									</Feed.Date>
								</Feed.Summary>
								<Feed.Extra images>
									<div
										dangerouslySetInnerHTML={{
											__html: Marked(result.explanation)
										}}
										onClick={() =>
											props.history.push(`/fallacies/${result.id}`)
										}
									/>
									{result.s3_link && result.network === "twitter" ? (
										<Image
											bordered
											inline
											onClick={() => {
												this.setState({
													lightboxOpen: true,
													currentImg: result.s3_link
												})
											}}
											onError={i => (i.target.src = ImagePic)}
											rounded
											src={result.s3_link}
										/>
									) : null}
								</Feed.Extra>
								{result.tag_ids !== null ? (
									<Feed.Meta>
										<Feed.Content>
											<Label.Group size="large">
												{RenderTags(tags(result))}
											</Label.Group>
										</Feed.Content>
									</Feed.Meta>
								) : null}
							</Feed.Content>
						</Feed.Event>
					)
				}

				if (result.id && result.item_type === "archive") {
					let tweet = result.type === "tweet" ? JSON.parse(result.tweet_json) : null
					let duration = result.end_time - result.start_time
					return (
						<Feed.Event key={`feed_${i}`}>
							<Feed.Label
								image={result.user_img}
								onClick={() => null}
								onError={i => (i.target.src = ImagePic)}
							/>
							<Feed.Content>
								<Feed.Summary>
									<Link to={`/users/${result.user_id}`}>{result.user_name}</Link>{" "}
									archived{" "}
									{result.type === "video" && (
										<span>
											<Link
												to={`/${result.type}/${result.video_id}?a=${
													result.id
												}&x=${result.start_time}&y=${result.end_time}`}
											>
												{duration} {formatPlural(duration, "second")}
											</Link>{" "}
											of{" "}
											<Link to={`/${result.type}/${result.video_id}`}>
												{result.title}
											</Link>
										</span>
									)}
									{result.type === "tweet" && (
										<span>
											a{" "}
											<Link to={`/${result.type}/${result.tweet_id}`}>
												{result.type}
											</Link>
										</span>
									)}
									<Feed.Date>
										<Moment
											date={adjustTimezone(result.date_created)}
											fromNow
										/>
									</Feed.Date>
								</Feed.Summary>
								{result.type === "video" && (
									<div>
										<Feed.Extra className="archiveExtra" images>
											<Image
												className="videoImg"
												onClick={() =>
													this.props.history.push(
														`/video/${result.video_id}?a=${
															result.id
														}&x=${result.start_time}&y=${
															result.end_time
														}`
													)
												}
												onError={i => (i.target.src = ImagePic)}
												size="big"
												src={
													result.video_img
														? result.video_img.replace(
																"default",
																"hqdefault"
														  )
														: null
												}
											/>
										</Feed.Extra>
										<Feed.Extra text>
											<i>{result.description}</i>
										</Feed.Extra>
									</div>
								)}
								{result.type === "tweet" && (
									<Feed.Extra className="archiveExtra" text>
										<Tweet
											created_at={tweet.created_at}
											extended_entities={tweet.extended_entities}
											full_text={tweet.full_text}
											id={tweet.id_str}
											imageSize="medium"
											key={`tweet_key_${i}`}
											is_quote_status={tweet.is_quote_status}
											quoted_status={
												tweet.quoted_status === undefined &&
												tweet.is_quote_status
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
												profile_image_url_https:
													tweet.user.profile_image_url_https,
												screen_name: tweet.user.screen_name
											}}
											{...this.props.history}
										/>
									</Feed.Extra>
								)}
							</Feed.Content>
						</Feed.Event>
					)
				}

				return <LazyLoad key={`feed_${i}`} />
			})
		}

		const RenderTags = tags =>
			tags.map((tag, i) => (
				<Label
					basic
					key={`label_${i}`}
					onClick={() => this.props.history.push(`/tags/${tag.id.trim()}`)}
				>
					{tag.name}
				</Label>
			))

		const tags = result => {
			if (result.tag_ids === null || result.tag_names === null) {
				return []
			}
			return mapIdsToNames(result.tag_ids, result.tag_names)
		}

		return (
			<Visibility className="feedWrapper" continuous onBottomVisible={this.loadMore}>
				<Feed size={this.props.size}>
					{RenderFeed(this.props)}
					{LazyLoadMore(this.props)}
				</Feed>
				{lightboxOpen && (
					<Lightbox
						mainSrc={currentImg}
						onCloseRequest={() => this.setState({ lightboxOpen: false })}
						reactModalStyle={{
							content: {
								top: "70px"
							}
						}}
					/>
				)}
			</Visibility>
		)
	}
}

FeedComponent.propTypes = {
	count: PropTypes.number,
	getFeed: PropTypes.func,
	hasMore: PropTypes.bool,
	loadingMore: PropTypes.bool,
	page: PropTypes.number,
	pages: PropTypes.number,
	results: PropTypes.array,
	size: PropTypes.string
}

FeedComponent.defaultProps = {
	count: 0,
	getFeed,
	page: 0,
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	size: "large"
}

const mapStateToProps = (state, ownProps) => ({
	...state.feed,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getFeed }
)(FeedComponent)
