import { refreshYouTubeToken } from "components/secondary/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { formatNumber } from "utils/textFunctions"
import { fetchFallacyCount, fetchPageData, reset } from "redux/actions/page"
import { Provider, connect } from "react-redux"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Placeholder,
	Segment
} from "semantic-ui-react"
import Breakdown from "components/primary/breakdown/v1/"
import defaultImg from "images/images/square-image.png"
import DefaultLayout from "layouts"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import LazyLoad from "components/primary/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"
import store from "../store"
import TitleHeader from "components/primary/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"
import TweetList from "components/secondary/lists/tweetList/v1/"
import VideoList from "components/secondary/lists/videoList/v1/"

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
			tab = "credibility"
		}

		this.state = {
			activeItem: tab === "credibility" ? tab : label,
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

		this.props.reset()
		this.props.fetchPageData({
			bearer,
			id,
			type: network
		})
	}

	componentDidMount() {}

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			const id = this.props.match.params.id
			const network = this.props.match.params.network
			let tab = this.props.match.params.tab
			if (tab === undefined) {
				tab = "credibility"
			}

			if (this.state.id !== id) {
				this.props.reset()
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
				activeItem: tab === "credibility" ? tab : label,
				itemsLabel: label,
				updated: !this.state.updated
			})
		}
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

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })

	scrollToMenu() {
		const element = document.getElementsByClassName("socialMediaPageMenu")
		element[0].scrollIntoView({ behavior: "smooth" })
	}

	setFallacyId = id => {
		this.scrollToMenu()
		this.setState({ activeItem: "fallacies", fallacyId: id })
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
				<Header as="h2" inverted>
					{msg}
				</Header>
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
					{props.username && (
						<a
							className="externalUrl"
							href={props.externalUrl}
							onClick={e => {
								e.preventDefault()
								window.open(props.externalUrl, "_blank")
							}}
						>
							@{props.username}
						</a>
					)}
				</div>
			)

			return (
				<div className="pageHeaderInfo">
					<TitleHeader subheader={subheader} textAlign="center" title={props.name} />
				</div>
			)
		}

		const PageMenu = props => (
			<Menu attached className="socialMediaPageMenu" inverted pointing secondary size="big">
				<Menu.Item
					active={activeItem === "credibility"}
					name="credibility"
					onClick={this.handleItemClick}
				/>
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
						<Label color="red" floating>
							{formatNumber(props.fallacyCount)}
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
							icon="warning sign"
							itemsPerRow={2}
							network={network}
							setFallacyId={this.setFallacyId}
							showPics={false}
							size="large"
							source="pages"
						/>
					)
				}

				if (activeItem === "credibility") {
					return (
						<Breakdown
							authenticated={authenticated}
							count={props.fallacyCount}
							dbId={props.dbId}
							history={props.history}
							id={props.id}
							name={props.name}
							network={network}
							placeholder={props.placeholder}
							setFallacyId={this.setFallacyId}
							sincerity={props.sincerity}
							turingTest={props.turingTest}
							userId={userId}
							username={props.username}
						/>
					)
				}

				if (activeItem === "videos") {
					return (
						<Segment basic>
							<VideoList
								bearer={bearer}
								channelId={id}
								emptyMsgContent="No videos"
								history={props.history}
							/>
						</Segment>
					)
				}

				if (authenticated) {
					if (activeItem === "tweets" && props.data.linkedTwitter) {
						return <TweetList bearer={bearer} history={props.history} username={id} />
					}

					return (
						<Dimmer.Dimmable as={Segment} dimmed>
							{LazyLoadDefault}
							<DimmerMsg
								btn={
									<Button
										color={network}
										icon
										onClick={() => props.history.push(`/settings/${network}`)}
									>
										<Icon name={network} /> Link your {network}
									</Button>
								}
								msg={`Link your ${network} to start calling ${props.name} out`}
								props={props}
							/>
						</Dimmer.Dimmable>
					)
				}

				return (
					<Dimmer.Dimmable as={Segment} className="signInPlaceholder" dimmed inverted>
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
			return null
		}

		return (
			<Provider store={store}>
				<div className="socialMediaPage">
					<DisplayMetaTags page="pages" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem=""
						containerClassName="socialMediaPage"
						history={this.props.history}
					>
						{this.props.exists ? (
							<Fragment>
								<Container className="imgContainer" textAlign="center">
									{this.props.id ? (
										<Image
											centered
											circular
											className="profilePic"
											onError={i => (i.target.src = defaultImg)}
											rounded
											size="medium"
											src={this.props.img}
										/>
									) : (
										<Placeholder className="profilePicPlaceholder" inverted>
											<Placeholder.Image square />
										</Placeholder>
									)}

									{PageHeaderInfo(this.props)}
								</Container>

								<Divider hidden section />

								{PageMenu(this.props)}

								<Container className="profileContentContainer">
									{ShowContent(this.props)}
								</Container>
							</Fragment>
						) : (
							<Fragment>
								<Image
									centered
									className="trumpImg404"
									size="medium"
									src={TrumpImg}
								/>
								<Header inverted size="large" textAlign="center">
									This page does not exist!
								</Header>
							</Fragment>
						)}
					</DefaultLayout>
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
	name: PropTypes.string,
	network: PropTypes.string,
	placeholder: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			summary: PropTypes.string,
			user_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			user_img: PropTypes.string,
			user_name: PropTypes.string
		})
	]),
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
	reset: PropTypes.func,
	sincerityTest: PropTypes.object,
	turingTest: PropTypes.object,
	refreshYouTubeToken: PropTypes.func,
	username: PropTypes.string
}

Page.defaultProps = {
	error: false,
	exists: true,
	fetchPageData,
	img: defaultImg,
	placeholder: {},
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	refreshYouTubeToken,
	reset,
	sincerityTest: {},
	turingTest: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.page,
		...state.user,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	fetchFallacyCount,
	fetchPageData,
	refreshYouTubeToken,
	reset
})(Page)
