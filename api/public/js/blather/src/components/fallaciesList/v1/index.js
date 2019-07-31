import "./style.css"
import { getFallacies, getTargets } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatPlural } from "utils/textFunctions"
import { connect, Provider } from "react-redux"
import {
	Card,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	Message,
	Placeholder,
	Segment,
	Visibility
} from "semantic-ui-react"
import ImagePic from "images/brain-fart.gif"
import FallacyRef from "components/fallacyRef/v1/"
import Marked from "marked"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class FallaciesList extends Component {
	constructor(props) {
		super(props)
		const showFilter = this.props.source !== "fallacy"
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
			value: this.props.fallacies ? this.props.fallacies : ""
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
			page: 0
		})
		if (this.props.source === "users") {
			this.props.getTargets({ id: this.props.assignedBy })
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

		let qs = `?id=${id}&type=${props.source}&network=${props.network}`
		if (props.source && props.assignedBy) {
			qs += `&assignedBy=${props.assignedBy}`
		}
		return fetch(`${window.location.origin}/api/fallacies/uniqueFallacies${qs}`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ options: data.fallacies })
					})
				}
			})
			.catch(err => console.log(err))
	}

	loadMore = () => {
		if (this.props.hasMore) {
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({
				loadingMore: true,
				page: newPage
			})
			this.props.getFallacies({
				assignedBy: this.props.assignedBy,
				assignedTo: this.props.assignedTo,
				commentId: this.props.commentId,
				fallacies:
					this.props.fallacies === "" ? this.state.fallacies : this.props.fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: newPage
			})
		}
	}

	onChangeSearch = (e, { text, value }) => {
		this.setState({ fallacies: value, page: 0, value })
		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo: this.props.assignedTo,
			commentId: this.props.commentId,
			fallacies: value,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0
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
							<Form>
								<Form.Field
									clearable
									control={Dropdown}
									fluid
									lazyLoad
									onChange={this.onChangeSearch}
									options={options}
									placeholder="Filter by fallacy"
									scrolling
									selection
									value={value}
								/>
							</Form>
							<Divider />
							<FallacyRef
								canScreenshot={false}
								className="fallacyRef"
								id={parseInt(value, 10)}
							/>
							<Divider />
						</div>
					)}
				</div>
			)
		}

		const RenderFallacies = ({ props }) => {
			return props.results.map((result, i) => {
				if (result.id) {
					let img = result.s3_link && result.network === "twitter" ? result.s3_link : ImagePic
					let meta = (
						<div>
							<p>
								<Icon
									color="green"
									name={props.source === "users" ? "arrow right" : "arrow left"}
								/>{" "}
								{props.source === "users" ? (
									<span>
										Assigned to <b>{result.page_name}</b>
									</span>
								) : (
									<span>
										Assigned by <b>{result.user_name}</b>
									</span>
								)}{" "}
							</p>
						</div>
					)
					const url = `/fallacies/${result.slug}`
					return (
						<Card onClick={e => this.redirectToUrl(e, url)}>
							<Image
								onError={i => (i.target.src = ImagePic)}
								src={img}
								ui={false}
								wrapped
							/>
							<Card.Content>
								<Card.Header>{result.title}</Card.Header>
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
							<Card.Content extra>
								<span>
									<Icon name="eye" />
									{result.view_count} views
								</span>{" "}
								<span style={{ float: "right" }}>
									<Moment date={adjustTimezone(result.date_created)} fromNow />
								</span>
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
			})
		}

		const RenderTargets = ({ props }) => {
			return props.targets.results.map((result, i) => {
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
							<Image onError={i => (i.target.src = ImagePic)} src={img} ui={false} wrapped />
							<Card.Content>
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
									<div>
										<Divider />
										<Card.Group itemsPerRow={this.props.itemsPerRow} stackable>
											<RenderTargets props={this.props} />
										</Card.Group>
									</div>
								) : (
									<Card.Group itemsPerRow={this.props.itemsPerRow} stackable>
										<RenderFallacies props={this.props} />
									</Card.Group>
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
	name: PropTypes.string,
	network: PropTypes.string,
	objectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	page: PropTypes.number,
	results: PropTypes.array,
	setFallacyId: PropTypes.func,
	showPics: PropTypes.bool,
	source: PropTypes.string,
	targets: PropTypes.shape({
		count: PropTypes.number,
		hasMore: PropTypes.bool,
		loadingMore: PropTypes.bool,
		page: PropTypes.number,
		pages: PropTypes.number,
		results: PropTypes.array
	})
}

FallaciesList.defaultProps = {
	changeUrl: false,
	emptyMsgContent: "Try searching something else...",
	fallacies: "",
	getFallacies,
	getTargets,
	icon: "tweet",
	itemsPerRow: 3,
	page: 0,
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	showPics: true,
	targets: {
		page: 0,
		results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
	}
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacies,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getFallacies, getTargets }
)(FallaciesList)
