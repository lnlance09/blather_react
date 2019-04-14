import "pages/css/index.css"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchFallacyCount, fetchPageData } from "pages/actions/page"
import { toggleLoading } from "pages/actions/user"
import { Provider, connect } from "react-redux"
import {
	Button,
	Container,
	Dimmer,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Segment
} from "semantic-ui-react"
import Breakdown from "components/breakdown/v1/"
import defaultImg from "images/image-square.png"
import FallaciesList from "components/fallaciesList/v1/"
import LazyLoad from "components/lazyLoad/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "../store"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"
import TweetList from "components/tweetList/v1/"
import VideoList from "components/videoList/v1/"

class Page extends Component {
	constructor(props) {
		super(props)
		const id = this.props.match.params.id
		const network = this.props.match.params.network
		const fallacyId = this.props.match.params.fallacyId
		let tab = this.props.match.params.tab
		const label = this.determineItemsLabel(network)
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = currentState.user.data.id

		if (tab === undefined) {
			tab = "fallacies"
		}

		this.state = {
			activeItem: tab === "fallacies" ? tab : label,
			authenticated,
			bearer,
			fallacyId,
			id,
			itemsLabel: label,
			network,
			page: 0,
			updated: false,
			userId
		}

		this.props.fetchPageData({
			bearer,
			id,
			type: network
		})

		this.props.toggleLoading({
			loading: this.props.loading
		})

		this.setFallacyId = this.setFallacyId.bind(this)
	}

	componentWillReceiveProps(props) {
		const id = props.match.params.id
		const network = props.match.params.network
		let tab = props.match.params.tab
		if (tab === undefined) {
			tab = "fallacies"
		}

		this.props.toggleLoading({
			loading: this.props.loading
		})

		if (this.state.id !== id) {
			this.props.fetchPageData({
				bearer: this.state.bearer,
				id,
				type: network
			})

			this.setState({
				id,
				network,
				page: 0
			})
		}

		const label = this.determineItemsLabel(network)
		this.setState({
			activeItem: tab === "fallacies" ? tab : label,
			itemsLabel: label,
			updated: !this.state.updated
		})

		this.props.toggleLoading({
			loading: this.props.loading
		})
	}

	determineItemsLabel(network) {
		switch (network) {
			case "twitter":
				return "tweets"
			case "youtube":
				return "videos"
			default:
				return null
		}
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/pages/${this.state.network}/${this.state.id}/${name}`)
	}

	setFallacyId = id => {
		this.setState({ activeItem: "fallacies", fallacyId: id })
		this.props.history.push(`/pages/${this.state.network}/${this.state.id}/fallacies/${id}`)
	}

	render() {
		const {
			activeItem,
			authenticated,
			bearer,
			fallacyId,
			id,
			itemsLabel,
			network,
			userId
		} = this.state

		if (this.props.error && this.props.errorCode !== 404 && network === "youtube") {
			this.props.refreshYouTubeToken({
				bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		}

		const DimmerMsg = ({ btn, msg, props }) => (
			<Dimmer active>
				<Header as="h2">{msg}</Header>
				{btn}
			</Dimmer>
		)

		const LazyLoadDefault = [{}, {}, {}, {}, {}].map((post, i) => {
			let marginTop = i === 0 ? 0 : 15
			return <LazyLoad key={`lazy_load_${i}`} style={{ marginTop: `${marginTop}px` }} />
		})

		const PageHeaderInfo = props => {
			const subheader = (
				<div>
					<Icon className={`${network}Icon`} name={network} />
					{" "}
					{props.username ? (
						<a
							className="externalUrl"
							href={props.externalUrl}
							onClick={() => window.open(props.externalUrl, "_blank")}
						>
							@{props.username}
						</a>
					) : (
						<span>YouTube profile</span>
					)}
				</div>
			)
			return (
				<div className="pageHeaderInfo">
					<TitleHeader subheader={subheader} title={props.name} />
				</div>
			)
		}

		const PageMenu = props => (
			<Menu className="socialMediaPageMenu" fluid pointing secondary stackable>
				<Menu.Item
					active={activeItem === itemsLabel}
					name={itemsLabel}
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "fallacies"}
					name="fallacies"
					onClick={this.handleItemClick}
				>
					Fallacies{" "}
					{props.fallacyCount > 0 && (
						<Label color="red" size="small">
							{props.fallacyCount}
						</Label>
					)}
				</Menu.Item>
			</Menu>
		)

		const ShowContent = props => {
			if (props.id) {
				if (activeItem === "fallacies") {
					return (
						<FallaciesList
							assignedTo={props.id}
							changeUrl
							emptyMsgContent={`No fallacies have been assigned to ${props.name}`}
							fallacies={fallacyId}
							history={props.history}
							icon="sticky note"
							network={network}
							setFallacyId={this.setFallacyId}
							showPics={false}
							source="pages"
						/>
					)
				}

				if (authenticated) {
					if (activeItem === "tweets" && props.data.linkedTwitter) {
						return (
							<Segment basic>
								<TweetList bearer={bearer} history={props.history} username={id} />
							</Segment>
						)
					}

					if (activeItem === "videos" && props.data.linkedYoutube) {
						return (
							<Segment basic>
								<VideoList bearer={bearer} channelId={id} history={props.history} />
							</Segment>
						)
					}

					return (
						<Dimmer.Dimmable as={Segment} dimmed>
							{LazyLoadDefault}
							<DimmerMsg
								btn={
									<Button
										color={props.network}
										icon
										onClick={() =>
											props.history.push(`/settings/${props.network}`)
										}
									>
										<Icon name={props.network} /> Link your {props.network}
									</Button>
								}
								msg={`Link your ${props.network} to start calling ${
									props.name
								} out`}
								props={props}
							/>
						</Dimmer.Dimmable>
					)
				}
				return (
					<Dimmer.Dimmable as={Segment} className="signInPlaceholder" dimmed>
						{LazyLoadDefault}
						<DimmerMsg
							btn={
								<Button
									color="blue"
									onClick={() => props.history.push("/signin")}
									size="large"
								>
									Sign in
								</Button>
							}
							msg={`Call ${props.name} out`}
							props={props}
						/>
					</Dimmer.Dimmable>
				)
			}
		}

		return (
			<Provider store={store}>
				<div className="socialMediaPage">
					<DisplayMetaTags page="pages" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{this.props.exists ? (
						<Container className="mainContainer" textAlign="left">
							<Grid>
								<Grid.Column width={16}>
									<Image
										bordered
										centered
										circular
										className="profilePic"
										onError={i => (i.target.src = defaultImg)}
										rounded
										size="medium"
										src={this.props.img}
									/>
									{PageHeaderInfo(this.props)}
									<Header as="h2" dividing>
										Breakdown
									</Header>
									{this.props.id && (
										<Breakdown
											authenticated={authenticated}
											count={this.props.fallacyCount}
											dbId={this.props.dbId}
											id={this.props.id}
											name={this.props.name}
											network={network}
											setFallacyId={this.setFallacyId}
											sincerity={this.props.sincerity}
											turingTest={this.props.turingTest}
											userId={parseInt(userId, 10)}
											username={this.props.username}
										/>
									)}
									{PageMenu(this.props)}
									<Container className="profileContentContainer">
										{ShowContent(this.props)}
									</Container>
								</Grid.Column>
							</Grid>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
							<Header size="medium">This page does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Page.propTypes = {
	about: PropTypes.string,
	dbId: PropTypes.number,
	error: PropTypes.bool,
	errorCode: PropTypes.number,
	exists: PropTypes.bool,
	externalUrl: PropTypes.string,
	fallacyCount: PropTypes.number,
	fetchPageData: PropTypes.func,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	img: PropTypes.string,
	isVerified: PropTypes.bool,
	loading: PropTypes.bool,
	name: PropTypes.string,
	network: PropTypes.string,
	posts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.shape({
			count: PropTypes.number,
			data: PropTypes.array,
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			errorType: PropTypes.number,
			hasMore: PropTypes.bool,
			loading: true
		})
	]),
	sincerityTest: PropTypes.object,
	toggleLoading: PropTypes.func,
	turingTest: PropTypes.object,
	refreshYouTubeToken: PropTypes.func,
	username: PropTypes.string
}

Page.defaultProps = {
	error: false,
	exists: true,
	fallacies: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	fetchPageData,
	img: defaultImg,
	loading: false,
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	refreshYouTubeToken,
	sincerityTest: {},
	toggleLoading,
	turingTest: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.page,
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		fetchFallacyCount,
		fetchPageData,
		refreshYouTubeToken,
		toggleLoading
	}
)(Page)
