import "./style.css"
import { getFallacies, getTargets, toggleLoading } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatPlural } from "utils/textFunctions"
import { connect, Provider } from "react-redux"
import {
	Card,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	Item,
	Label,
	Message,
	Placeholder,
	Segment,
	Visibility
} from "semantic-ui-react"
import ImagePic from "images/brain-fart.gif"
import FallacyRef from "components/fallacyRef/v1/"
import LazyLoad from "components/lazyLoad/v1/"
import Marked from "marked"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ResultItem from "components/item/v1/"
import store from "store"

class FallaciesList extends Component {
	constructor(props) {
		super(props)
		const showFilter = this.props.source !== "fallacy"
		let value = this.props.fallacies ? this.props.fallacies : ""
		if (this.props.source === "tag") {
			value = this.props.assignedTo
		}

		this.state = {
			assignedBy: null,
			assignedTo: null,
			commentId: null,
			fallacyId: 0,
			loadingMore: false,
			network: "",
			objectId: null,
			options: [],
			q: "",
			page: this.props.page,
			showFilter,
			showTargets: false,
			value
		}

		this.onChangeSearch = this.onChangeSearch.bind(this)
	}

	componentDidMount() {
		if (this.props.source !== "fallacy") {
			this.fetchFallacies(this.props)
		}
		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo: this.props.assignedTo,
			commentId: this.props.commentId,
			fallacies: this.props.fallacies,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0,
			tagId: this.props.tagId
		})
		if (this.props.source === "users") {
			this.props.getTargets({ id: this.props.assignedBy })
		}
	}

	componentWillUpdate(nextProps) {
		if (nextProps.tagId !== this.props.tagId) {
			this.props.getFallacies({
				assignedBy: nextProps.assignedBy,
				assignedTo: nextProps.assignedTo,
				commentId: nextProps.commentId,
				fallacies: nextProps.fallacies,
				fallacyId: nextProps.fallacyId,
				network: nextProps.network,
				objectId: nextProps.objectId,
				page: 0,
				tagId: nextProps.tagId
			})
		}
	}

	fetchFallacies(props) {
		let id = ""

		switch (props.source) {
			case "pages":
			case "targets":
				id = props.assignedTo
				break
			case "post":
				id = props.objectId
				break
			case "users":
				id = props.assignedBy
				break
			default:
				id = ""
		}

		let endpoint = "fallacies/uniqueFallacies"
		let qs = `?id=${id}&type=${props.source}&network=${props.network}`
		if (props.source && props.assignedBy) {
			qs += `&assignedBy=${props.assignedBy}`
		}

		if (props.source === "tag") {
			endpoint = "tags/getTaggedUsers"
			qs = `?id=${props.tagId}`
		}

		return fetch(`${window.location.origin}/api/${endpoint}${qs}`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						const options = props.source === "tag" ? data.users : data.fallacies
						this.setState({ options })
					})
				}
			})
			.catch(err => console.log(err))
	}

	loadMore = () => {
		if (this.props.hasMore && !this.props.loadingMore) {
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({ page: newPage })
			this.props.toggleLoading()
			this.props.getFallacies({
				assignedBy: this.props.assignedBy,
				assignedTo: this.props.assignedTo,
				commentId: this.props.commentId,
				fallacies:
					this.props.fallacies === "" ? this.state.fallacies : this.props.fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: newPage,
				tagId: this.props.tagId
			})
		}
	}

	onChangeSearch = (e, { text, value }) => {
		this.setState({ fallacies: value, page: 0, value })
		const assignedTo = this.props.source === "tag" ? value : this.props.assignedTo
		const fallacies = this.props.source === "tag" ? null : value

		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo,
			commentId: this.props.commentId,
			fallacies,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0,
			tagId: this.props.tagId
		})
		if (this.props.changeUrl) {
			this.props.setFallacyId(value)
		}
	}

	redirectToUrl = (e, url) => {
		if (!e.metaKey) {
			this.props.history.push(url)
		} else {
			window.open(url, "_blank").focus()
		}
	}

	render() {
		const { options, showFilter, showTargets, value } = this.state
		const placeholder = this.props.source === "tag" ? "Filter by page" : "Filter by fallacy"

		const FilterSection = ({ props }) => {
			const filterVisible = showFilter && !showTargets
			return (
				<div className="fallacyFilter">
					{props.source === "users" && (
						<Message
							className="targetMsg"
							content={
								<div>
									{props.targets.count}{" "}
									{formatPlural(props.targets.count, "target")} -{" "}
									<span
										className="viewAllTargets"
										onClick={e => {
											e.preventDefault()
											this.setState({ showTargets: showTargets === false })
										}}
									>
										{showTargets ? "View all fallacies" : "View all targets"}
									</span>
								</div>
							}
							header={`See who has been on ${props.name}'s radar`}
							icon="crosshairs"
						/>
					)}
					{filterVisible && (
						<div>
							<Form size="large">
								<Form.Field
									clearable
									control={Dropdown}
									fluid
									lazyLoad
									onChange={this.onChangeSearch}
									options={options}
									placeholder={placeholder}
									selection
									value={value}
								/>
							</Form>
							<div style={{ margin: "16px 0" }}>
								<FallacyRef
									canScreenshot={false}
									className="fallacyRef"
									id={parseInt(value, 10)}
								/>
							</div>
						</div>
					)}
				</div>
			)
		}

		const RenderFallacies = ({ props }) => {
			return props.results.map((result, i) => {
				if (props.useCards) {
					if (result.id) {
						let img = result.page_profile_pic ? result.page_profile_pic : ImagePic
						let meta = (
							<div>
								<p>
									<b>{result.user_name}</b>{" "}
									<Icon color="green" name="arrow right" />{" "}
									<b>{result.page_name}</b>
								</p>
							</div>
						)
						const url = `/fallacies/${result.slug}`
						return (
							<Card key={result.id} onClick={e => this.redirectToUrl(e, url)}>
								{props.usePics && (
									<div className="image parent">
										<div
											className="one"
											style={{ backgroundImage: `url(${img})` }}
										/>
										<div
											className="two"
											style={{ backgroundImage: `url(${result.user_img})` }}
										/>
									</div>
								)}
								<Card.Content>
									{!props.usePics && (
										<Image
											circular
											floated="right"
											onError={i => (i.target.src = ImagePic)}
											size="mini"
											src={img}
										/>
									)}
									<Card.Header>{result.title}</Card.Header>
									<Card.Meta>{meta}</Card.Meta>
									<Card.Meta>
										{result.network === "youtube" && (
											<b>
												<Icon className="youtubeIcon" name="youtube" />{" "}
											</b>
										)}
										{result.network === "twitter" && (
											<b>
												<Icon className="twitterIcon" name="twitter" />{" "}
											</b>
										)}
										<Moment
											date={adjustTimezone(result.date_created)}
											fromNow
										/>
									</Card.Meta>
									<Card.Description
										dangerouslySetInnerHTML={{
											__html:
												result.explanation !== undefined &&
												result.explanation !== null
													? Marked(result.explanation)
													: null
										}}
									/>
								</Card.Content>
								<Card.Content extra>
									<span style={{ lineHeight: "1.7" }}>
										<Icon name="eye" />
										<b>{result.view_count} views</b>
									</span>{" "}
									<span style={{ float: "right" }}>
										<Label color="blue" tag>
											{result.fallacy_name}
										</Label>
									</span>
								</Card.Content>
							</Card>
						)
					} else {
						return (
							<Card key={`fallacyCard${i}`}>
								{props.usePics && (
									<Placeholder>
										<Placeholder.Image square />
									</Placeholder>
								)}
								<Card.Content>
									<Placeholder>
										<Placeholder.Header>
											<Placeholder.Line length="very long" />
											<Placeholder.Line length="medium" />
										</Placeholder.Header>
										<Placeholder.Paragraph>
											<Placeholder.Line length="short" />
										</Placeholder.Paragraph>
									</Placeholder>
								</Card.Content>
							</Card>
						)
					}
				}

				if (result.id) {
					let img =
						props.assignedBy || props.source === "fallacy" || props.source === "tag"
							? result.page_profile_pic
							: result.user_img
					let meta = (
						<div>
							<p>
								<b>{result.page_name}</b> <Icon color="green" name="arrow left" />{" "}
								<b>{result.user_name}</b>
							</p>
							<p>
								<Icon name="clock outline" />
								<Moment date={adjustTimezone(result.date_created)} fromNow />
							</p>
						</div>
					)

					return (
						<ResultItem
							description={result.explanation}
							history={props.history}
							id={`fallacy_${i}`}
							img={props.showPics ? img : null}
							key={`fallacy_${i}`}
							meta={meta}
							tags={[result.fallacy_name]}
							title={result.title}
							type="fallacy"
							url={`/fallacies/${result.slug}`}
							useMarked
						/>
					)
				}

				return <LazyLoad key={`target_${i}`} />
			})
		}

		const RenderTargets = ({ props }) => {
			return props.targets.results.map((result, i) => {
				if (props.useCards) {
					if (result.id) {
						let img = props.showPics ? result.profile_pic : null
						let meta = (
							<div>
								{result.count} {formatPlural(result.count, "fallacy")}
							</div>
						)
						const url = `/targets/${props.assignedBy}/${result.id}`
						return (
							<Card onClick={e => this.redirectToUrl(e, url)}>
								{props.usePics && (
									<Image
										onError={i => (i.target.src = ImagePic)}
										src={img}
										ui={false}
										wrapped
									/>
								)}
								<Card.Content>
									{!props.usePics && (
										<Image
											circular
											floated="right"
											onError={i => (i.target.src = ImagePic)}
											size="mini"
											src={img}
										/>
									)}
									<Card.Header>{result.name}</Card.Header>
									<Card.Meta>{meta}</Card.Meta>
									<Card.Description
										dangerouslySetInnerHTML={{
											__html:
												result.explanation !== undefined &&
												result.explanation !== null
													? Marked(result.explanation)
													: null
										}}
									/>
								</Card.Content>
							</Card>
						)
					} else {
						return (
							<Card>
								<Placeholder>
									<Placeholder.Image square />
								</Placeholder>
								<Card.Content>
									<Placeholder>
										<Placeholder.Header>
											<Placeholder.Line length="very short" />
											<Placeholder.Line length="medium" />
										</Placeholder.Header>
										<Placeholder.Paragraph>
											<Placeholder.Line length="short" />
										</Placeholder.Paragraph>
									</Placeholder>
								</Card.Content>
							</Card>
						)
					}
				}

				if (result.id) {
					let meta = (
						<div>
							{result.count} {formatPlural(result.count, "fallacy")}
						</div>
					)
					return (
						<ResultItem
							description=""
							history={props.history}
							id={`target_${i}`}
							img={props.showPics ? result.profile_pic : null}
							key={`target_${i}`}
							meta={meta}
							sanitize
							title={result.name}
							type="target"
							url={`/targets/${props.assignedBy}/${result.id}`}
						/>
					)
				}

				return <LazyLoad key={`target_${i}`} />
			})
		}

		return (
			<Provider store={store}>
				<div className="fallaciesList">
					{this.props.results.length > 0 ? (
						<div>
							<FilterSection props={this.props} />
							<Visibility
								className="fallaciesWrapper"
								continuous
								onBottomVisible={this.loadMore}
							>
								{showTargets ? (
									<div style={{ marginTop: "16px" }}>
										{this.props.useCards ? (
											<Card.Group
												itemsPerRow={this.props.itemsPerRow}
												stackable
											>
												<RenderTargets props={this.props} />
											</Card.Group>
										) : (
											<Item.Group divided>
												<RenderTargets props={this.props} />
											</Item.Group>
										)}
									</div>
								) : this.props.useCards ? (
									<Card.Group itemsPerRow={this.props.itemsPerRow} stackable>
										<RenderFallacies props={this.props} />
									</Card.Group>
								) : (
									<Item.Group className="fallacyItems" divided>
										<RenderFallacies props={this.props} />
									</Item.Group>
								)}
							</Visibility>
						</div>
					) : (
						<div className="emptyFallaciesContainer">
							<Segment placeholder>
								<Header icon>
									<Icon
										className={`${this.props.icon}Icon`}
										name={this.props.icon}
									/>
									{this.props.emptyMsgContent}
								</Header>
							</Segment>
						</div>
					)}
				</div>
			</Provider>
		)
	}
}

FallaciesList.propTypes = {
	assignedBy: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	assignedTo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	changeUrl: PropTypes.bool,
	commentId: PropTypes.string,
	emptyMsgContent: PropTypes.string,
	fallacies: PropTypes.string,
	fallacyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	getFallacies: PropTypes.func,
	getTargets: PropTypes.func,
	hasMore: PropTypes.bool,
	icon: PropTypes.string,
	itemsPerRow: PropTypes.number,
	loadingMore: PropTypes.bool,
	name: PropTypes.string,
	network: PropTypes.string,
	objectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	page: PropTypes.number,
	results: PropTypes.array,
	setFallacyId: PropTypes.func,
	showPics: PropTypes.bool,
	source: PropTypes.string,
	tagId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	targets: PropTypes.shape({
		count: PropTypes.number,
		hasMore: PropTypes.bool,
		loadingMore: PropTypes.bool,
		page: PropTypes.number,
		pages: PropTypes.number,
		results: PropTypes.array
	}),
	toggleLoading: PropTypes.func,
	useCards: PropTypes.bool
}

FallaciesList.defaultProps = {
	changeUrl: false,
	emptyMsgContent: "Try searching something else...",
	fallacies: "",
	getFallacies,
	getTargets,
	icon: "tweet",
	itemsPerRow: 3,
	loadingMore: false,
	page: 0,
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	showPics: true,
	targets: {
		page: 0,
		results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
	},
	toggleLoading,
	useCards: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacies,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getFallacies, getTargets, toggleLoading }
)(FallaciesList)
