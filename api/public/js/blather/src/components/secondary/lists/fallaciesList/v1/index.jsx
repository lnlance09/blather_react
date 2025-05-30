import "./style.css"
import { getFallacies, getTargets, toggleLoading, updateSearchTerm } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatPlural } from "utils/textFunctions"
import { DebounceInput } from "react-debounce-input"
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
import ImagePic from "images/avatar/brain-fart.gif"
import FallacyRef from "components/primary/fallacyRef/v1/"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Marked from "marked"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ResultItem from "components/primary/item/v1/"
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
			showFilter,
			showTargets: false,
			sortValue: "date",
			value
		}
	}

	componentDidMount() {
		this.props.updateSearchTerm({ q: "" })

		if (this.props.source !== "fallacy") {
			this.fetchFallacies(this.props)
		}

		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo: this.props.assignedTo,
			commentId: this.props.commentId,
			exclude: this.props.exclude,
			fallacies: this.props.fallacies,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0,
			shuffle: this.props.shuffle,
			sort: this.state.sortValue,
			tagId: this.props.tagId
		})

		if (this.props.source === "users") {
			this.props.getTargets({ id: this.props.assignedBy })
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			if (this.props.source === "pages") {
				this.setState({ value: this.props.fallacies })
			}

			if (
				prevProps.tagId !== this.props.tagId ||
				prevProps.fallacyId !== this.props.fallacyId ||
				prevProps.fallacies !== this.props.fallacies
			) {
				this.props.getFallacies({
					assignedBy: this.props.assignedBy,
					assignedTo: this.props.assignedTo,
					commentId: this.props.commentId,
					exclude: this.props.exclude,
					fallacies: this.props.fallacies,
					fallacyId: this.props.fallacyId,
					network: this.props.network,
					objectId: this.props.objectId,
					page: 0,
					q: this.props.q,
					shuffle: this.props.shuffle,
					sort: this.state.sortValue,
					tagId: this.props.tagId
				})
			}
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
			const newPage = parseInt(this.props.page + 1, 10)
			this.props.toggleLoading()
			this.props.getFallacies({
				assignedBy: this.props.assignedBy,
				assignedTo: this.props.assignedTo,
				commentId: this.props.commentId,
				exclude: this.props.exclude,
				fallacies: this.props.fallacies === "" ? this.state.value : this.props.fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: newPage,
				q: this.props.q,
				shuffle: this.props.shuffle,
				sort: this.state.sortValue,
				tagId: this.props.tagId
			})
		}
	}

	onChangeInput = q => {
		this.props.updateSearchTerm({ q })

		const assignedTo = this.props.source === "tag" ? this.state.value : this.props.assignedTo
		const fallacies = this.props.source === "tag" ? null : this.state.value
		this.props.getFallacies({
			assignedBy: this.props.assignedBy,
			assignedTo,
			commentId: this.props.commentId,
			exclude: this.props.exclude,
			fallacies,
			fallacyId: this.props.fallacyId,
			network: this.props.network,
			objectId: this.props.objectId,
			page: 0,
			q,
			shuffle: this.props.shuffle,
			sort: this.state.sortValue,
			tagId: this.props.tagId
		})
	}

	onChangeSearch = (e, { text, value }) => {
		this.setState({ value }, () => {
			const assignedTo = this.props.source === "tag" ? value : this.props.assignedTo
			const fallacies = this.props.source === "tag" ? null : value
			this.props.getFallacies({
				assignedBy: this.props.assignedBy,
				assignedTo,
				commentId: this.props.commentId,
				exclude: this.props.exclude,
				fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: 0,
				q: this.props.q,
				shuffle: this.props.shuffle,
				sort: this.state.sortValue,
				tagId: this.props.tagId
			})

			if (this.props.changeUrl) {
				this.props.setFallacyId(value)
			}
		})
	}

	onChangeSort = (e, { value }) => {
		this.setState({ sortValue: value }, () => {
			const assignedTo =
				this.props.source === "tag" ? this.state.value : this.props.assignedTo
			const fallacies = this.props.source === "tag" ? null : this.state.value
			this.props.getFallacies({
				assignedBy: this.props.assignedBy,
				assignedTo,
				commentId: this.props.commentId,
				exclude: this.props.exclude,
				fallacies,
				fallacyId: this.props.fallacyId,
				network: this.props.network,
				objectId: this.props.objectId,
				page: 0,
				q: this.props.q,
				shuffle: this.props.shuffle,
				sort: value,
				tagId: this.props.tagId
			})
		})
	}

	redirectToUrl = (e, url) => {
		if (!e.metaKey) {
			this.props.history.push(url)
		} else {
			window.open(url, "_blank").focus()
		}
	}

	render() {
		const { options, showFilter, showTargets, sortValue, value } = this.state
		const { q, source } = this.props
		const placeholder = source === "tag" ? "Filter by page" : "Filter by fallacy"

		const FilterSection = props => {
			const filterVisible = showFilter && !showTargets
			return (
				<div className="fallacyFilter">
					{source === "users" && (
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
											this.setState({ showTargets: !showTargets })
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
							<Form inverted size={this.props.size}>
								<Form.Field>
									<div className="ui icon input">
										<DebounceInput
											debounceTimeout={300}
											minLength={2}
											onChange={e => this.onChangeInput(e.target.value)}
											placeholder="Search..."
											value={q}
										/>
										<i aria-hidden="true" className="search icon" />
									</div>
								</Form.Field>
								<Form.Group widths="equal">
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
									<Form.Field
										control={Dropdown}
										fluid
										lazyLoad
										onChange={this.onChangeSort}
										options={[
											{ key: "date", text: "Date", value: "date" },
											{ key: "views", text: "Views", value: "views" }
										]}
										placeholder="Sort by"
										selection
										value={sortValue}
									/>
								</Form.Group>
							</Form>
							<div style={{ margin: "16px 0" }}>
								{value && (
									<FallacyRef
										canScreenshot={false}
										className="fallacyRef"
										id={parseInt(value, 10)}
										size="medium"
									/>
								)}
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
											bordered
											circular
											floated="right"
											onError={i => (i.target.src = ImagePic)}
											size="mini"
											src={img}
										/>
									)}
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
									<span style={{ lineHeight: "1.7" }}>
										<Icon inverted name="eye" />{" "}
										<b>{result.view_count} views</b>
									</span>{" "}
									<span style={{ float: "right" }}>
										<Label color="blue">{result.fallacy_name}</Label>
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
									<LazyLoad segment={false} />
								</Card.Content>
							</Card>
						)
					}
				}

				if (result.id) {
					let img =
						props.assignedBy || source === "fallacy" || source === "tag"
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
										bordered
										onError={i => (i.target.src = ImagePic)}
										src={img}
										ui={false}
										wrapped
									/>
								)}
								<Card.Content>
									{!props.usePics && (
										<Image
											bordered
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
					{FilterSection(this.props)}
					{this.props.results.length > 0 ? (
						<div>
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
						<div className={`emptyFallaciesContainer ${showTargets ? "targets" : ""}`}>
							<Segment inverted placeholder>
								<Header icon size="medium">
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
	exclude: PropTypes.array,
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
	q: PropTypes.string,
	results: PropTypes.array,
	setFallacyId: PropTypes.func,
	showPics: PropTypes.bool,
	shuffle: PropTypes.bool,
	size: PropTypes.string,
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
	updateSearchTerm: PropTypes.func,
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
	q: "",
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	showPics: true,
	shuffle: false,
	size: "big",
	targets: {
		page: 0,
		results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
	},
	toggleLoading,
	updateSearchTerm,
	useCards: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacies,
	...ownProps
})

export default connect(mapStateToProps, {
	getFallacies,
	getTargets,
	toggleLoading,
	updateSearchTerm
})(FallaciesList)
