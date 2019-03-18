import "pages/css/index.css"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchFallacyCount, fetchPageData } from "pages/actions/page"
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
	Responsive,
	Segment
} from "semantic-ui-react"
import AboutCard from "components/aboutCard/v1/"
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
			tab = "breakdown"
		}

		this.state = {
			activeItem: tab === "fallacies" || tab === "breakdown" ? tab : label,
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
			bearer: this.state.bearer,
			id: this.state.id,
			type: this.state.network
		})

		this.setFallacyId = this.setFallacyId.bind(this)
	}

	componentWillReceiveProps(props) {
		const id = props.match.params.id
		const network = props.match.params.network
		let tab = props.match.params.tab
		if (tab === undefined) {
			tab = "breakdown"
		}

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
			activeItem: tab === "fallacies" || tab === "breakdown" ? tab : label,
			itemsLabel: label,
			updated: !this.state.updated
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
					{props.username && (
						<a
							className="externalUrl"
							href={props.externalUrl}
							onClick={() => window.open(props.externalUrl, "_blank")}
						>
							@{props.username}
						</a>
					)}{" "}
					<Icon className={`${network}Icon`} name={network} />
				</div>
			)
			return <TitleHeader subheader={subheader} title={props.name} />
		}
		const PageMenu = props => (
			<Menu className="socialMediaPageMenu" fluid stackable tabular>
				<Menu.Item
					active={activeItem === "breakdown"}
					name="breakdown"
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
						<Label color="red" size="small">
							{props.fallacyCount}
						</Label>
					)}
				</Menu.Item>
			</Menu>
		)
		const ShowContent = props => {
			if (props.id) {
				if (activeItem === "breakdown") {
					return (
						<Breakdown
							authenticated={authenticated}
							count={props.fallacyCount}
							dbId={props.dbId}
							id={props.id}
							name={props.name}
							network={network}
							setFallacyId={this.setFallacyId}
							sincerity={props.sincerity}
							turingTest={props.turingTest}
							userId={parseInt(userId, 10)}
							username={props.username}
						/>
					)
				}

				if (activeItem === "fallacies") {
					return (
						<Segment stacked>
							<FallaciesList
								assignedTo={props.id}
								changeUrl
								emptyMsgContent={`No fallacies have been assigned to ${props.name}`}
								fallacies={fallacyId}
								history={props.history}
								icon="sticky note"
								network={network}
								page={0}
								setFallacyId={this.setFallacyId}
								showPics={false}
								source="pages"
							/>
						</Segment>
					)
				}

				if (authenticated) {
					if (activeItem === "tweets" && props.data.linkedTwitter) {
						return (
							<Segment stacked>
								<TweetList bearer={bearer} history={props.history} username={id} />
							</Segment>
						)
					}

					if (activeItem === "videos" && props.data.linkedYoutube) {
						return (
							<Segment stacked>
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
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>{PageHeaderInfo(this.props)}</Grid.Row>
									<Grid.Row className="pageContentRow">
										<Image
											className="profilePic"
											onError={i => (i.target.src = defaultImg)}
											rounded
											src={this.props.img}
										/>
										<AboutCard
											description={this.props.about}
											linkify
											title="About"
										/>
										{PageMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Row>
								</Grid>
							</Responsive>
							<Responsive minWidth={1025}>
								<Grid>
									<Grid.Column width={4}>
										<Image
											centered
											className="profilePic"
											onError={i => (i.target.src = defaultImg)}
											rounded
											src={this.props.img}
										/>
										<AboutCard
											description={this.props.about}
											linkify
											title="About"
										/>
									</Grid.Column>
									<Grid.Column width={12}>
										{PageHeaderInfo(this.props)}
										{PageMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Column>
								</Grid>
							</Responsive>
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
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	refreshYouTubeToken,
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

export default connect(
	mapStateToProps,
	{
		fetchFallacyCount,
		fetchPageData,
		refreshYouTubeToken
	}
)(Page)
