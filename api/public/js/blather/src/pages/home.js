import "pages/css/index.css"
import { getPostFromUrl } from "pages/actions/home"
import { connect, Provider } from "react-redux"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Container, Header, Input, Message } from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import Logo from "components/header/v1/images/logo.svg"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"
import Tweet from "components/tweet/v1/"

class Home extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const user = currentState.user
		const auth = user.authenticated
		const bearer = user.bearer

		this.state = {
			auth,
			bearer,
			endTime: "",
			highlightedText: "",
			startTime: "",
			type: null,
			url: "",
			user
		}

		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.onKeyUp = this.onKeyUp.bind(this)
		this.onPaste = this.onPaste.bind(this)
	}

	componentDidMount() {
		this.setState({ formVisible: true })
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

	onKeyUp = e => {
		if (e.keyCode === 8) {
			this.setState({ tweetId: null, url: "", videoId: null })
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
		const { auth, bearer, endTime, highlightedText, id, startTime, url, user } = this.state
		const { info, mediaId, page, type } = this.props
		const validPost = type === "tweet"

		return (
			<Provider store={store}>
				<div className="aboutPage">
					<DisplayMetaTags page="home" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<div>
							<ReactSVG
								className="heroLogo"
								evalScripts="always"
								src={Logo}
								svgClassName="heroLogo"
							/>
							<Header as="h1" className="heroHeader" textAlign="center">
								Blather
								<Header.Subheader>Call out fallacious reasoning</Header.Subheader>
							</Header>
							<Input
								className="heroInput"
								fluid
								icon="linkify"
								iconPosition="left"
								onKeyUp={this.onKeyUp}
								onPaste={this.onPaste}
								placeholder="Paste a link to a Tweet"
								size="large"
								value={url}
							/>

							<div className="postContainer">
								{type === "tweet" && (
									<Tweet
										bearer={bearer}
										created_at={info.created_at}
										extended_entities={info.extended_entities}
										externalLink
										highlight={highlightedText !== ""}
										highlightedText={highlightedText}
										full_text={info.full_text}
										handleHoverOn={this.handleHoverOn}
										id={info.id_str}
										imageSize="medium"
										is_quote_status={info.is_quote_status}
										profileImg={this.props.profileImg}
										quoted_status={
											info.quoted_status === undefined && info.is_quote_status
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
										useLocalProfilePic
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

							{validPost && (
								<FallacyForm
									authenticated={auth}
									bearer={bearer}
									commentId={type === "comment" ? id : null}
									endTime={endTime}
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
							)}
						</div>
					</Container>
					<PageFooter />
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

export default connect(
	mapStateToProps,
	{
		getPostFromUrl
	}
)(Home)
