import { getPostFromUrl } from "redux/actions/home"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Divider, Header, Icon, Input, Message, Segment } from "semantic-ui-react"
import DefaultLayout from "layouts"
import FallacyForm from "components/secondary/fallacyForm/v1/"
import queryString from "query-string"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import Tweet from "components/primary/tweet/v1/"

class Home extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const user = currentState.user
		const auth = user.authenticated
		const bearer = user.bearer

		const qs = queryString.parse(this.props.location.search)
		const url = qs.url

		this.state = {
			auth,
			bearer,
			endTime: "",
			fallacyId: "1",
			formVisible: true,
			highlightedText: "IF YOU ARE NOT HAPPY HERE, YOU CAN LEAVE!",
			startTime: "",
			text: "",
			type: null,
			url,
			user
		}
	}

	componentDidMount() {
		const qs = queryString.parse(this.props.location.search)
		const url = qs.url
		this.setState({ url }, () => {
			this.props.getPostFromUrl({
				bearer: this.state.bearer,
				url
			})
		})
	}

	handleHoverOn = e => {
		let text = ""
		if (window.getSelection) {
			text = window.getSelection().toString()
		} else if (document.selection) {
			text = document.selection.createRange().text
		}
		this.setState({ highlightedText: text })
	}

	onChangeText = (e, { value }) => {
		this.setState({ text: value })
	}

	onKeyUp = e => {
		if (e.keyCode === 8) {
			this.setState({ url: "", videoId: null })
		}
	}

	onPaste = e => {
		const url = e.clipboardData.getData("Text")
		this.setState({ url })
		this.props.getPostFromUrl({
			bearer: this.state.bearer,
			url
		})
	}

	render() {
		const {
			auth,
			bearer,
			endTime,
			fallacyId,
			highlightedText,
			id,
			startTime,
			url,
			user
		} = this.state
		const { info, mediaId, page, type } = this.props

		const validPost = type === "tweet"

		return (
			<Provider store={store}>
				<div className="homePage">
					<DisplayMetaTags page="home" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem="addInteraction"
						containerClassName="homePage"
						history={this.props.history}
					>
						<Header as="h1" className="heroHeader" inverted>
							Assign a Logical Fallacy
						</Header>

						<Input
							className="heroInput"
							fluid
							icon="twitter"
							iconPosition="left"
							inverted
							onKeyUp={this.onKeyUp}
							onPaste={this.onPaste}
							placeholder="Paste a link to a Tweet"
							size="big"
							value={url}
						/>

						<Divider inverted section />

						{validPost && url !== "" ? (
							<div>
								<div className="postContainer">
									{type === "tweet" && (
										<Tweet
											bearer={bearer}
											created_at={info.created_at}
											displayTextRange={info.display_text_range}
											extended_entities={info.extended_entities}
											externalLink
											highlight={highlightedText !== ""}
											highlightedText={highlightedText}
											full_text={info.full_text}
											handleHoverOn={this.handleHoverOn}
											history={this.props.history}
											id={info.id_str}
											imageSize="medium"
											is_quote_status={info.is_quote_status}
											profileImg={this.props.profileImg}
											quoted_status={
												info.quoted_status === undefined &&
												info.is_quote_status
													? info.retweeted_status
													: info.quoted_status
											}
											quoted_status_id_str={info.quoted_status_id_str}
											quoted_status_permalink={info.quoted_status_permalink}
											retweeted_status={
												info.retweeted_status === undefined
													? false
													: info.retweeted_status
											}
											stats={{
												favorite_count: info.favorite_count,
												retweet_count: info.retweet_count
											}}
											user={info.user}
										/>
									)}
									{type === "video" && (
										<Message
											content="Link your YouTube account to assign fallacies to videos"
											warning
										/>
									)}
								</div>

								<Divider inverted section />

								<FallacyForm
									authenticated={auth}
									bearer={bearer}
									commentId={type === "comment" ? id : null}
									endTime={endTime}
									fallacyId={fallacyId}
									handleSubmit={this.handleSubmit}
									highlightedText={highlightedText}
									history={this.props.history}
									network={this.props.network}
									objectId={mediaId}
									pageInfo={page}
									sendNotification={this.props.sendNotification}
									startTime={startTime}
									type={type}
									user={user}
								/>

								{!auth && (
									<Message error>
										<Message.Content>
											<Message.Header>Sign in</Message.Header>
											This will be assigned anonymously. It is recommended
											that you <Link to="/signin">sign in</Link>.
										</Message.Content>
									</Message>
								)}
							</div>
						) : (
							<Segment inverted padded="very" placeholder>
								<Header icon>
									<Icon className="twitterIcon" name="twitter" />
								</Header>
							</Segment>
						)}
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

Home.propTypes = {
	getPostFromUrl: PropTypes.func,
	info: PropTypes.object,
	mediaId: PropTypes.string,
	network: PropTypes.string,
	page: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	type: PropTypes.string
}

Home.defaultProps = {
	getPostFromUrl,
	info: {},
	page: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.home,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	getPostFromUrl
})(Home)
