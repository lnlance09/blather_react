import "./style.css"
import { createArchive } from "pages/actions/post"
import { adjustTimezone } from "utils/dateFunctions"
import { linkHashtags, linkMentions } from "utils/linkifyAdditions"
import { Provider, connect } from "react-redux"
import { Card, Icon, Image, Label, List, Message, Popup, Transition } from "semantic-ui-react"
import ItemPic from "images/square-image.png"
import Linkify from "react-linkify"
import Moment from "react-moment"
import NumberFormat from "react-number-format"
import Parser from "html-react-parser"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Tweet extends Component {
	constructor(props) {
		super(props)
		this.state = {
			animation: "fade",
			duration: 700,
			highlight: "",
			visible: false
		}
		linkMentions("twitter")
		linkHashtags("https://www.twitter.com/hashtag/")
		this.onClickArchive = this.onClickArchive.bind(this)
	}

	componentDidMount() {
		this.setState({ visible: this.props.archive ? true : false })
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ visible: nextProps.archive ? true : false })
	}

	onClickArchive = () => {
		this.props.createArchive({
			bearer: this.props.bearer,
			url: `https://twitter.com/${this.props.user.screen_name}/status/${this.props.id}`
		})
	}

	getHighlightedText = (text, higlight) => {
		const parts = text.split(new RegExp(`(${higlight.replace(/[()]/g, "")})`, "gi"))
		return parts.map(part =>
			part.toLowerCase() === higlight.toLowerCase() ? (
				<b key={`highlighted${part}`}>{part}</b>
			) : (
				part
			)
		)
	}

	render() {
		const { animation, duration, visible } = this.state
		const className = `tweet ${this.props.redirect ? " clickable" : ""}`
		const ArchiveIcon = props => {
			if (props.canArchive && !props.archive) {
				return (
					<List.Item className="archiveListItem">
						<Popup
							className="archivePopup"
							content="Archive"
							position="bottom left"
							trigger={
								<List.Content>
									<List.Header>
										<Icon
											color="yellow"
											name="sticky note"
											onClick={this.onClickArchive}
											size="large"
										/>
									</List.Header>
								</List.Content>
							}
						/>
					</List.Item>
				)
			}
			return false
		}
		const ArchiveInfo = props => {
			if (props.archive && props.canArchive) {
				const archiveDate = adjustTimezone(props.archive.date_created)
				return (
					<Transition animation={animation} duration={duration} visible={visible}>
						<Message className="archiveMsg">
							<Icon color="green" name="checkmark" /> Archived this{" "}
							<a
								href={`http://archive.is/${props.archive.code}`}
								rel="noopener noreferrer"
								target="_blank"
							>
								tweet
							</a>{" "}
							<Moment date={archiveDate} fromNow />
						</Message>
					</Transition>
				)
			}
		}
		const CardHeader = props => {
			let profileImg = props.useLocalProfilePic
				? props.profileImg
				: props.user.profile_image_url_https
			let name = props.user.name
			let screenName = props.user.screen_name
			let createdAt = new Date(props.created_at)
			if (props.retweeted_status) {
				createdAt = new Date(props.retweeted_status.created_at)
				name = props.retweeted_status.user.name
				profileImg = props.useLocalProfilePic
					? props.profileImg
					: props.retweeted_status.user.profile_image_url_https
				screenName = props.retweeted_status.user.screen_name
			}

			return (
				<div>
					<Image
						circular
						className="tweetUserImg"
						onError={i => (i.target.src = ItemPic)}
						floated="left"
						src={profileImg.replace("_normal", "")}
					/>
					<Card.Header className="tweetUserName">{name}</Card.Header>
					<Card.Meta className="tweetUserScreenName">
						@{screenName} •
						<span className="tweetTime">
							<Moment date={createdAt} fromNow />
						</span>
					</Card.Meta>
				</div>
			)
		}
		const ParseMedia = ({ props }) => {
			if (props.extended_entities.media) {
				return props.extended_entities.media.map((item, i) => {
					if (item.type === "photo" || item.type === "video") {
						return (
							<div className="mediaPic" key={`embed_${i}`}>
								<Image
									as="a"
									bordered
									className="mediaImg"
									href={item.expanded_url}
									rounded={false}
									size={props.imageSize}
									src={item.media_url_https}
									target="_blank"
								/>
							</div>
						)
					}
					return null
				})
			}
		}
		const QuotedTweet = props => {
			if (props.is_quote_status) {
				let quotedName = props.quoted_status.user.name
				let quotedScreenName = props.quoted_status.user.screen_name
				let quotedFullText = props.quoted_status.full_text
				if (props.quoted_status === undefined) {
					quotedName = props.retweeted_status.user.name
					quotedScreenName = props.retweeted_status.user.screen_name
					quotedFullText = props.retweeted_status.full_text
				}

				return (
					<Card className="quotedTweet" fluid>
						<Card.Content className="quotedTweetContent">
							<Card.Header className="quotedHeader">
								{quotedName}{" "}
								<span className="quotedScreenName">@{quotedScreenName}</span>
							</Card.Header>
							<Card.Description className="quotedTextTweet">
								<Linkify
									properties={{
										target: "_blank"
									}}
								>
									{quotedFullText}
								</Linkify>
							</Card.Description>
						</Card.Content>
					</Card>
				)
			}
			return null
		}
		const RetweetedText = props => {
			let retweetedText = ""
			if (props.retweeted_status) {
				retweetedText = `${props.user.name} Retweeted`
				return (
					<div className="retweetedText">
						<Icon name="retweet" />
						{retweetedText}
					</div>
				)
			}
			return false
		}
		const StatsBar = ({ favoriteCount, retweetCount }) => {
			return (
				<List floated="left" horizontal>
					<List.Item>
						<Label basic>
							<Icon color="blue" name="retweet" size="large" />{" "}
							<NumberFormat
								displayType={"text"}
								thousandSeparator={true}
								value={retweetCount}
							/>
						</Label>
					</List.Item>
					<List.Item className="favoriteItem">
						<Label basic>
							<Icon name="like" size="large" />{" "}
							<NumberFormat
								displayType={"text"}
								thousandSeparator={true}
								value={favoriteCount}
							/>
						</Label>
					</List.Item>
				</List>
			)
		}
		const tweetText = Parser(
			this.props.retweeted_status
				? this.props.retweeted_status.full_text
				: this.props.full_text
		)
		const LinkifiedTweet = (
			<Linkify
				properties={{
					target: "_blank"
				}}
				sanitize
			>
				{this.props.highlight
					? this.getHighlightedText(tweetText, this.props.highlightedText)
					: tweetText}
			</Linkify>
		)

		return (
			<Provider store={store}>
				<div className={className}>
					<Card fluid>
						{RetweetedText(this.props)}
						<Card.Content
							onClick={() => {
								if (this.props.redirect) {
									this.props.push(`/tweet/${this.props.id}`)
								}
							}}
						>
							{CardHeader(this.props)}
							<Card.Description
								className="linkifyTweet"
								onMouseUp={this.props.handleHoverOn}
							>
								{LinkifiedTweet}
								<ParseMedia props={this.props} />
							</Card.Description>
							{QuotedTweet(this.props)}
						</Card.Content>
						{this.props.showStats && (
							<Card.Content extra>
								<StatsBar
									favoriteCount={
										this.props.retweeted_status
											? this.props.retweeted_status.favorite_count
											: this.props.stats.favorite_count
									}
									retweetCount={
										this.props.retweeted_status
											? this.props.retweeted_status.retweet_count
											: this.props.stats.retweet_count
									}
								/>
								<List floated="right" horizontal>
									{this.props.externalLink && (
										<List.Item className="externalLinkListItem">
											<Popup
												className="twitterExternalPopup"
												content="View on Twitter"
												position="bottom left"
												trigger={
													<List.Content>
														<List.Header>
															<Icon
																name="twitter"
																onClick={() =>
																	window.open(
																		`https://twitter.com/${
																			this.props.user
																				.screen_name
																		}/status/${this.props.id}`,
																		"_blank"
																	)
																}
																size="large"
															/>
														</List.Header>
													</List.Content>
												}
											/>
										</List.Item>
									)}
									{ArchiveIcon(this.props)}
								</List>
							</Card.Content>
						)}
					</Card>
					{ArchiveInfo(this.props)}
				</div>
			</Provider>
		)
	}
}

Tweet.propTypes = {
	archive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			code: PropTypes.string,
			date_created: PropTypes.string,
			link: PropTypes.string,
			network: PropTypes.string
		})
	]),
	bearer: PropTypes.string,
	canArchive: PropTypes.bool,
	createArchive: PropTypes.func,
	created_at: PropTypes.string,
	extended_entities: PropTypes.shape({
		media: PropTypes.array
	}),
	externalLink: PropTypes.bool,
	fetchData: PropTypes.func,
	full_text: PropTypes.string,
	handleHoverOn: PropTypes.func,
	highlight: PropTypes.bool,
	highlightedText: PropTypes.string,
	id: PropTypes.string,
	imageSize: PropTypes.string,
	is_quote_status: PropTypes.bool,
	key: PropTypes.string,
	profileImg: PropTypes.string,
	quoted_status: PropTypes.shape({
		created_at: PropTypes.string,
		full_text: PropTypes.string,
		id: PropTypes.number,
		stats: PropTypes.shape({
			favorite_count: PropTypes.number,
			retweet_count: PropTypes.number
		}),
		user: PropTypes.shape({
			description: PropTypes.string,
			id: PropTypes.number,
			location: PropTypes.string,
			name: PropTypes.string,
			profile_image_url: PropTypes.string,
			screen_name: PropTypes.string
		})
	}),
	quoted_status_id_str: PropTypes.string,
	quoted_status_permalink: PropTypes.shape({
		expanded: PropTypes.string
	}),
	redirect: PropTypes.bool,
	retweeted_status: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			created_at: PropTypes.string,
			full_text: PropTypes.string,
			id: PropTypes.number,
			stats: PropTypes.shape({
				favorite_count: PropTypes.number,
				retweet_count: PropTypes.number
			}),
			user: PropTypes.shape({
				description: PropTypes.string,
				id: PropTypes.number,
				location: PropTypes.string,
				name: PropTypes.string,
				profile_image_url: PropTypes.string,
				screen_name: PropTypes.string
			})
		})
	]),
	showStats: PropTypes.bool,
	stats: PropTypes.shape({
		favorite_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		retweet_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	}),
	useLocalProfilePic: PropTypes.bool,
	user: PropTypes.shape({
		description: PropTypes.string,
		id: PropTypes.number,
		location: PropTypes.string,
		name: PropTypes.string,
		profile_image_url: PropTypes.string,
		screen_name: PropTypes.string
	})
}

Tweet.defaultProps = {
	canArchive: false,
	createArchive,
	extended_entities: {
		media: []
	},
	externalLink: false,
	highlight: false,
	imageSize: "tiny",
	quoted_status: {
		user: {}
	},
	redirect: false,
	retweeted_status: {
		user: {}
	},
	showStats: true,
	stats: {},
	useLocalProfilePic: false,
	user: {}
}

const mapStateToProps = (state, ownProps) => ({
	...state.post,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ createArchive }
)(Tweet)
