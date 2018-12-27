import "./style.css"
import { getFallacies, getTargets } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatPlural } from "utils/textFunctions"
import { connect, Provider } from "react-redux"
import { Divider, Dropdown, Form, Image, Item, Message, Visibility } from "semantic-ui-react"
import fallacies from "fallacies.json"
import ImagePic from "images/image-square.png"
import Moment from "react-moment"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ResultItem from "components/item/v1/"
import store from "store"

class FallaciesList extends Component {
	constructor(props) {
		super(props)
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
			page: 0,
			showFilter: this.props.source !== "fallacy",
			showTargets: false
		}

		this.onChangeSearch = this.onChangeSearch.bind(this)
	}

	componentDidMount() {
		if (this.state.showFilter) {
			this.fetchFallacies()
		}
		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo: this.props.assignedTo,
			commentId: this.props.commentId,
			fallacies: this.state.fallaces,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0
		})
		if (this.props.source === "users") {
			this.props.getTargets({ id: this.props.assignedBy })
		}
	}

	componentWillReceiveProps(props) {
		if (
			this.props.assignedBy !== props.assignedBy ||
			this.props.assignedTo !== props.assignedTo ||
			this.props.commentId !== props.commentId ||
			this.props.objectId !== props.objectId
		) {
			this.fetchFallacies()
			this.props.getFallacies({
				assignedBy: props.assignedBy,
				assignedTo: props.assignedTo,
				commentId: props.commentId,
				fallacies: this.state.fallaces,
				fallacyId: props.fallacyId,
				network: props.network,
				objectId: props.objectId,
				page: props.page
			})
			if (props.source === "users") {
				this.props.getTargets({ id: props.assignedBy })
			}
		}
	}

	fetchFallacies() {
		let id = ""
		switch (this.props.source) {
			case "pages":
			case "targets":
				id = this.props.assignedTo
				break
			case "post":
				id = this.props.objectId
				break
			case "users":
				id = this.props.assignedBy
				break
			default:
				id = ""
		}
		let qs = `?id=${id}&type=${this.props.source}&network=${this.props.network}`
		if (this.props.source && this.props.assignedBy) {
			qs += `&assignedBy=${this.props.assignedBy}`
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
				fallacies: this.state.fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: newPage
			})
		}
	}

	onChangeSearch = (e, { value }) => {
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
									control={Dropdown}
									fluid
									onChange={this.onChangeSearch}
									options={options}
									placeholder="Filter by fallacy"
									search
									selection
									value={value}
								/>
							</Form>
							<Divider />
						</div>
					)}
				</div>
			)
		}
		const RenderFallacies = props => {
			return props.results.map((result, i) => {
				if (result.id) {
					let img =
						props.assignedBy || props.source === "fallacy"
							? result.page_profile_pic
							: result.user_img
					let meta = (
						<div>
							{props.source === "users"
								? `Assigned to ${result.page_name}`
								: `Assigned by ${result.user_name}`}{" "}
							<Moment date={adjustTimezone(result.date_created)} fromNow />
						</div>
					)
					return (
						<ResultItem
							description={result.explanation}
							history={props.history}
							id={`fallacy_${i}`}
							img={img}
							key={`fallacy_${i}`}
							meta={meta}
							sanitize
							tags={[result.fallacy_name]}
							title={result.title}
							type="fallacy"
							url={`/fallacies/${result.id}`}
						/>
					)
				} else {
					return (
						<Item key={`fallacy_${i}`}>
							<Item.Image size="small" src={ImagePic} />
							<Item.Content>
								<Image fluid src={ParagraphPic} />
							</Item.Content>
						</Item>
					)
				}
			})
		}
		const RenderTargets = props => {
			return props.targets.results.map((result, i) => {
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
							img={result.profile_pic}
							key={`target_${i}`}
							meta={meta}
							sanitize
							title={result.name}
							type="target"
							url={`/targets/${props.assignedBy}/${result.id}`}
						/>
					)
				} else {
					return (
						<Item key={`fallacy_${i}`}>
							<Item.Image size="small" src={ImagePic} />
							<Item.Content>
								<Image fluid src={ParagraphPic} />
							</Item.Content>
						</Item>
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
									<Item.Group className="targetItems" divided>
										{RenderTargets(this.props)}
									</Item.Group>
								) : (
									<Item.Group className="fallacyItems" divided>
										{RenderFallacies(this.props)}
									</Item.Group>
								)}
							</Visibility>
						</div>
					) : (
						<div className="emptyFallaciesContainer">
							<Message
								content={this.props.emptyMsgContent}
								header={this.props.emptyMsgHeader}
							/>
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
	commentId: PropTypes.string,
	emptyMsgContent: PropTypes.string,
	emptyMsgHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	fallacies: PropTypes.array,
	fallacyId: PropTypes.number,
	getFallacies: PropTypes.func,
	getTargets: PropTypes.func,
	hasMore: PropTypes.bool,
	name: PropTypes.string,
	network: PropTypes.string,
	objectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	page: PropTypes.number,
	results: PropTypes.array,
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
	emptyMsgContent: "Try searching something else...",
	emptyMsgHeader: "No fallacies",
	fallacies: fallacies,
	getFallacies: getFallacies,
	getTargets: getTargets,
	page: 0,
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
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
