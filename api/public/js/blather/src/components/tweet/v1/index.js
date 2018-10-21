import "./style.css"
import { createArchive } from "pages/actions/post"
import { adjustTimezone } from "utils/dateFunctions"
import { linkMentions, linkHashtags } from "utils/linkifyAdditions"
import { Provider, connect } from "react-redux"
import { Card, Embed, Icon, Image, List, Message, Popup, Transition } from "semantic-ui-react"
import itemPic from "images/square-image.png"
import Linkify from "react-linkify"
import Moment from "react-moment"
import NumberFormat from "react-number-format"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Tweet extends Component {
	constructor(props) {
		super(props)
		this.state = {
			animation: "fade",
			duration: 700,
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

	render() {
		const { animation, duration, visible } = this.state
		let className = "tweet"
		className += this.props.redirect ? " clickable" : ""
		const archiveIcon = props => {
			if (props.canArchive && !props.archive) {
				return (
					<List floated="right" horizontal>
						<List.Item className="archiveListItem">
							<Popup
								className="archivePopup"
								content="Archive"
								position="bottom left"
								trigger={
									<List.Content>
										<List.Header>
											<Icon
												name="archive"
												onClick={this.onClickArchive}
												size="large"
											/>
										</List.Header>
									</List.Content>
								}
							/>
						</List.Item>
					</List>
				)
			}
			return false
		}
		const archiveInfo = props => {
			if (props.canArchive && props.archive) {
				const archiveDate = adjustTimezone(props.archive.date_created)
				return (
					<Transition animation={animation} duration={duration} visible={visible}>
						<Message className="archiveMsg" positive>
							<Icon name="checkmark" /> You archived this{" "}
							<a href={`http://archive.is/${props.archive.code}`} target="_blank">
								tweet
							</a>{" "}
							<Moment date={archiveDate} fromNow />
						</Message>
					</Transition>
				)
			}
		}
		const parseMedia = props => {
			if (props.extended_entities) {
				props.extended_entities.media.map((item, i) => {
					switch (item.type) {
						case "photo":
							return (
								<div key={`embed_${i}`}>
									<Image
										as="a"
										bordered
										className="mediaImg"
										href={item.expanded_url}
										rounded={false}
										size="tiny"
										src={item.media_url_https}
										target="_blank"
									/>
								</div>
							)
						case "video":
							return (
								<div key={`embed_${i}`}>
									<Embed
										className="mediaVideo"
										placeholder={item.media_url_https}
										url={item.video_info.variants[0].url}
									/>
								</div>
							)
						default:
							return false
					}
				})
			}
			return false
		}
		const quotedTweet = props => {
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
		const retweetedText = props => {
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
		const retweetedTweet = props => {
			let profileImage = props.user.profile_image_url_https
			let name = props.user.name
			let screenName = props.user.screen_name
			let createdAt = new Date(props.created_at)
			if (props.retweeted_status) {
				profileImage = props.retweeted_status.user.profile_image_url_https
				name = props.retweeted_status.user.name
				screenName = props.retweeted_status.user.screen_name
				createdAt = new Date(props.retweeted_status.created_at)
			}
			profileImage = profileImage.replace("_normal", "")

			return (
				<div>
					<Image
						circular
						className="tweetUserImg"
						onError={i => (i.target.src = itemPic)}
						floated="left"
						src={profileImage}
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
		const ShowMedia = props => {
			if (props.extended_entities.media) {
				return props.extended_entities.media.map((media, i) => {
					if (media.type === "photo" || media.type === "video") {
						return (
							<div className="mediaPic" key={media.display_url}>
								<Image
									centered
									rounded
									onError={i => (i.target.src = itemPic)}
									size="small"
									src={media.media_url_https}
								/>
							</div>
						)
					}
				})
			}
		}
		const StatsBar = ({ favoriteCount, retweetCount }) => {
			return (
				<div>
					<List floated="left" horizontal>
						<List.Item>
							<Icon color="blue" name="retweet" size="large" />
							<List.Content>
								<List.Header>
									<NumberFormat
										displayType={"text"}
										thousandSeparator={true}
										value={retweetCount}
									/>
								</List.Header>
							</List.Content>
						</List.Item>
						<List.Item>
							<Icon name="like" size="large" />
							<List.Content>
								<List.Header>
									<NumberFormat
										displayType={"text"}
										thousandSeparator={true}
										value={favoriteCount}
									/>
								</List.Header>
							</List.Content>
						</List.Item>
					</List>
				</div>
			)
		}

		return (
			<Provider store={store}>
				<div
					className={className}
					onClick={() => {
						if (this.props.redirect) {
							this.props.push(`/tweet/${this.props.id}`)
						}
					}}
				>
					<Card fluid>
						{retweetedText(this.props)}
						<Card.Content>
							{retweetedTweet(this.props)}
							<Card.Description className="tweetUserTweet">
								<Linkify
									properties={{
										target: "_blank"
									}}
								>
									{this.props.retweeted_status
										? this.props.retweeted_status.full_text
										: this.props.full_text}
								</Linkify>
								{parseMedia(this.props)}
							</Card.Description>
							{quotedTweet(this.props)}
							{ShowMedia(this.props)}
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
								{archiveIcon(this.props)}
							</Card.Content>
						)}
					</Card>
					{archiveInfo(this.props)}
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
	fetchData: PropTypes.func,
	full_text: PropTypes.string,
	id: PropTypes.string,
	is_quote_status: PropTypes.bool,
	key: PropTypes.string,
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
	createArchive: createArchive,
	extended_entities: {
		media: []
	},
	quoted_status: {
		user: {}
	},
	redirect: false,
	retweeted_status: {
		user: {}
	},
	showStats: true,
	stats: {},
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
