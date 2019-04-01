import "pages/css/index.css"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { downloadVideo, fetchPostData } from "pages/actions/post"
import { Provider, connect } from "react-redux"
import {
	Breadcrumb,
	Container,
	Divider,
	Header,
	Image,
	Message,
	Segment,
	Sticky
} from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import FallaciesList from "components/fallaciesList/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import ThumbnailPic from "images/image.png"
import Tweet from "components/tweet/v1/"
import YouTubeCommentsSection from "components/youTubeVideo/v1/comments"
import YouTubeVideo from "components/youTubeVideo/v1/"

class Post extends Component {
	constructor(props) {
		super(props)
		const path = this.props.match.path
		let id = this.props.match.params.id
		if (id.substring(id.length - 1, id.length) === "&") {
			id = id.slice(0, -1)
		}

		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const { network, type, url } = this.postType(id, path)
		this.state = {
			authenticated,
			bearer,
			highlightedText: "",
			id,
			network,
			submitted: false,
			type
		}

		this.props.fetchPostData({
			bearer: currentState.user.bearer,
			url
		})

		if (type === "video" && this.props.existsOnYt) {
			this.props.downloadVideo({ audio: 0, id })
		}

		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleContextRef = contextRef => this.setState({ contextRef })

	handleHoverOn = e => {
		let text = ""
		if (window.getSelection) {
			text = window.getSelection().toString()
		} else if (document.selection) {
			text = document.selection.createRange().text
		}
		this.setState({ highlightedText: text })
	}

	handleSubmit = () => {
		this.setState({ submitted: !this.state.submitted })
	}

	postType(id, path) {
		switch (path) {
			case "/comment/:id":
				return {
					network: "youtube",
					type: "comment",
					url: `youtube/comment?id=${id}`
				}
			case "/tweet/:id":
				return {
					network: "twitter",
					type: "tweet",
					url: `twitter/tweet?id=${id}`
				}
			case "/video/:id":
				return {
					network: "youtube",
					type: "video",
					url: `youtube/video?id=${id}`
				}
			default:
				return false
		}
	}

	render() {
		const { authenticated, bearer, contextRef, highlightedText, id, network, type } = this.state
		if (this.props.needToRefresh) {
			this.props.refreshYouTubeToken({
				bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		}

		const { error, errorCode, info } = this.props
		const containerClassName = info ? "mainContainer bc" : "mainContainer"
		const tweetExists = error && network === "twitter" ? false : true
		const videoExists = error && errorCode === 404 && network === "youtube" ? false : true
		const user = info ? (network === "twitter" ? info.user : info.channel) : null

		const Breadcrumbs = props => {
			if (props.info) {
				switch (type) {
					case "comment":
						if (props.info.comment.user) {
							return (
								<Breadcrumb>
									<Breadcrumb.Section
										link
										onClick={() => this.props.history.push("/search/youtube")}
									>
										YouTube comments
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section
										link
										onClick={() =>
											this.props.history.push(
												`/pages/youtube/${props.info.comment.user.id}`
											)
										}
									>
										{props.info.comment.user.title}
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section active>
										{props.info.comment.id}
									</Breadcrumb.Section>
								</Breadcrumb>
							)
						}
						return null
					case "tweet":
						if (props.info.user) {
							return (
								<Breadcrumb>
									<Breadcrumb.Section
										link
										onClick={() => this.props.history.push("/search/twitter")}
									>
										Twitter profiles
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section
										link
										onClick={() =>
											this.props.history.push(
												`/pages/twitter/${props.info.user.screen_name}`
											)
										}
									>
										{props.info.user.name}
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section
										link
										onClick={() =>
											this.props.history.push(
												`/pages/twitter/${
													props.info.user.screen_name
												}/tweets`
											)
										}
									>
										Tweets
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section active>{props.info.id}</Breadcrumb.Section>
								</Breadcrumb>
							)
						}
						return null
					case "video":
						if (props.info.channel) {
							return (
								<Breadcrumb>
									<Breadcrumb.Section
										link
										onClick={() => this.props.history.push("/search/youtube")}
									>
										YouTube channels
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section
										link
										onClick={() =>
											this.props.history.push(
												`/pages/youtube/${props.info.channel.id}`
											)
										}
									>
										{props.info.channel.title}
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section
										link
										onClick={() =>
											this.props.history.push(
												`/pages/youtube/${props.info.channel.id}/videos`
											)
										}
									>
										Videos
									</Breadcrumb.Section>
									<Breadcrumb.Divider icon="right chevron" />
									<Breadcrumb.Section active>{props.info.id}</Breadcrumb.Section>
								</Breadcrumb>
							)
						}
						return null
					default:
						return null
				}
			}
			return null
		}
		const DisplayFallacies = props => {
			if (props.info) {
				return (
					<div className="fallaciesWrapper">
						<Header dividing size="large">
							Fallacies
						</Header>
						<FallaciesList
							commentId={type === "comment" ? id : null}
							emptyMsgContent={`No fallacies have been assigned to this ${type}`}
							icon={network}
							network={network}
							objectId={props.info.id}
							source="post"
							{...props}
						/>
					</div>
				)
			}
			return null
		}
		const DisplayFallacyForm = props => (
			<div className="fallacyFormWrapper">
				<FallacyForm
					authenticated={authenticated}
					bearer={bearer}
					commentId={type === "comment" ? id : null}
					handleSubmit={this.handleSubmit}
					highlightedText={highlightedText}
					history={props.history}
					network={network}
					objectId={id}
					pageInfo={pageInfo}
					sendNotification={props.sendNotification}
					type={type}
					user={user}
				/>
			</div>
		)
		const DisplayPost = props => {
			switch (type) {
				case "comment":
					if (props.info) {
						return (
							<div>
								<YouTubeCommentsSection
									archive={props.archive}
									auth={authenticated}
									bearer={bearer}
									comment={props.info.comment}
									handleHoverOn={this.handleHoverOn}
									highlightedText={highlightedText}
									history={props.history}
									sendNotification={props.sendNotification}
									showComment
									showComments={false}
									source="post"
									videoId={props.info.id}
								/>
								<Divider />
							</div>
						)
					}
					break
				case "tweet":
					if (props.info) {
						return (
							<div>
								<Tweet
									archive={props.archive}
									archives={props.archives}
									bearer={bearer}
									canArchive
									created_at={props.info.created_at}
									extended_entities={props.info.extended_entities}
									externalLink
									highlight={highlightedText !== ""}
									highlightedText={highlightedText}
									full_text={props.info.full_text}
									handleHoverOn={this.handleHoverOn}
									id={props.info.id_str}
									imageSize="medium"
									is_quote_status={props.info.is_quote_status}
									profileImg={props.profileImg}
									quoted_status={
										props.info.quoted_status === undefined &&
										props.info.is_quote_status
											? props.info.retweeted_status
											: props.info.quoted_status
									}
									quoted_status_id_str={props.info.quoted_status_id_str}
									quoted_status_permalink={props.info.quoted_status_permalink}
									retweeted_status={
										props.info.retweeted_status === undefined
											? false
											: props.info.retweeted_status
									}
									stats={{
										favorite_count: props.info.favorite_count,
										retweet_count: props.info.retweet_count
									}}
									useLocalProfilePic
									user={props.info.user}
								/>
								{DisplayFallacyForm(props)}
							</div>
						)
					} else {
						return <LazyLoad />
					}
				case "video":
					if (props.info && videoExists) {
						return (
							<div>
								<YouTubeVideo
									bearer={bearer}
									canArchive
									channel={props.info.channel}
									dateCreated={props.info.date_created}
									description={props.info.description}
									existsOnYt={props.existsOnYt}
									history={props.history}
									id={props.info.id}
									placeholder={props.info.img}
									playing
									s3Link={props.info.s3_link}
									sendNotification={props.sendNotification}
									showComments
									showStats={false}
									stats={props.info.stats}
									title={props.info.title}
								/>
								{DisplayFallacyForm(props)}
								<YouTubeCommentsSection
									archive={props.archive}
									auth={authenticated}
									bearer={bearer}
									comments={props.comments}
									handleHoverOn={this.handleHoverOn}
									highlightedText={highlightedText}
									history={props.history}
									sendNotification={props.sendNotification}
									showComment={false}
									showComments
									source="post"
									videoId={props.info.id}
								/>
							</div>
						)
					} else {
						return (
							<Segment className="lazyLoadSegment">
								<Image centered size="large" src={ThumbnailPic} />
							</Segment>
						)
					}
				case "youtube_comment":
					return null
				default:
					return null
			}
		}
		const pageInfo = user
			? {
					id: `${user.id}`,
					name: network === "youtube" ? user.title : user.name,
					type: network,
					username: network === "youtube" ? null : user.screen_name
			  }
			: null

		return (
			<Provider store={store}>
				<div className="postPage">
					<DisplayMetaTags page="post" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{this.props.info && (
						<Sticky className="sticky" context={contextRef}>
							<div className="breadcrumbContainer">
								<Container>{Breadcrumbs(this.props)}</Container>
							</div>
						</Sticky>
					)}

					<Container className={containerClassName} text>
						{DisplayPost(this.props)}
						{!tweetExists && <Message content="This tweet does not exist" error />}
						{!videoExists && <Message content="This video does not exist" error />}
						{!this.props.error && <div>{DisplayFallacies(this.props)}</div>}
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Post.propTypes = {
	archive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			code: PropTypes.string,
			date_created: PropTypes.string,
			link: PropTypes.string
		})
	]),
	archives: PropTypes.array,
	downloadVideo: PropTypes.func,
	error: PropTypes.bool,
	errorCode: PropTypes.number,
	existsOnYt: PropTypes.bool,
	info: PropTypes.object,
	fallacyCount: PropTypes.number,
	needToRefresh: PropTypes.bool,
	profileImg: PropTypes.string,
	refreshYouTubeToken: PropTypes.func,
	sendNotification: PropTypes.func,
	type: PropTypes.string
}

Post.defaultProps = {
	archives: [],
	data: null,
	downloadVideo,
	existsOnYt: true,
	needToRefresh: false,
	refreshYouTubeToken
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.post,
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{ downloadVideo, fetchPostData, refreshYouTubeToken }
)(Post)
