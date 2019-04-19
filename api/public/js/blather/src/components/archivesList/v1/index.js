import "./style.css"
import { getArchives } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatDuration } from "utils/textFunctions"
import { connect } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import { Divider, Dropdown, Form, Header, Icon, Item, Segment, Visibility } from "semantic-ui-react"
import ItemPic from "images/square-image.png"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import ResultItem from "components/item/v1/"
import React, { Component } from "react"

class ArchivesList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			id: null,
			loadingMore: false,
			options: [],
			page: this.props.page,
			q: this.props.q
		}
	}

	componentDidMount() {
		this.getArchivedUsers()
		this.props.getArchives({
			id: this.props.id,
			page: 0,
			q: this.props.q
		})
	}

	componentWillReceiveProps(newProps) {
		if (this.props.q !== newProps.q) {
			this.setState({ q: newProps.q })
		}
	}

	getArchivedUsers() {
		let qs = `?id=${this.props.id}&unique=1&page=0`
		return fetch(`${window.location.origin}/api/users/getArchivedLinks${qs}`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						data.links.map(a => a.image.onError = i => i.target.src = ItemPic)
						this.setState({ options: data.links })
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
				page: newPage,
				pageId: this.state.value,
				q: this.state.q
			})
			this.props.getArchives({
				id: this.props.id,
				page: newPage,
				pageId: this.state.value,
				q: this.state.q
			})
		}
	}

	onChangeInput = value => {
		this.setState({ page: 0, q: value })
		this.props.getArchives({
			id: this.props.id,
			page: 0,
			pageId: this.state.value,
			q: this.state.q
		})
	}

	onChangeSearch = (e, { value }) => {
		this.setState({ page: 0, value })
		this.props.getArchives({
			id: this.props.id,
			page: 0,
			pageId: value,
			q: this.state.q
		})
	}

	render() {
		const { options, q, value } = this.state

		const ParseArchiveInfo = archive => {
			switch (archive.type) {
				case "comment":
					return {
						description: archive.title,
						img: archive.profile_pic,
						link: `/comment/${archive.comment_id}`,
						title: `Comment by ${archive.page_name}`
					}
				case "tweet":
					return {
						description: archive.full_text,
						img: archive.profile_pic,
						link: `/tweet/${archive.tweet_id}`,
						title: archive.page_name
					}
				case "video":
					return {
						description: `${formatDuration(archive.start_time)} - ${formatDuration(
							archive.end_time
						)} - ${archive.description}`,
						img: archive.profile_pic,
						link: `/video/${archive.video_id}?a=${archive.id}`,
						title: archive.title
					}
				default:
					return null
			}
		}
		const RenderArchives = props => {
			return props.archives.map((archive, i) => {
				if (archive.link) {
					let info = ParseArchiveInfo(archive)
					let meta = (
						<div>
							<p>
								<Icon name="clock outline" />{" "}
								<Moment date={adjustTimezone(archive.date_created)} fromNow />
								{"  "}
								<Icon className={`${archive.network}Icon`} name={archive.network} />
							</p>
						</div>
					)
					let menu = null
					if (archive.type === "tweet" || archive.type === "comment") {
						menu = (
							<Dropdown
								className="archiveItemMenu"
								direction="left"
								icon="ellipsis vertical"
							>
								<Dropdown.Menu>
									<Dropdown.Item
										icon={archive.network}
										onClick={() => window.open(archive.link, "_blank").focus()}
										text={`View ${archive.type}`}
									/>
									<Dropdown.Item
										icon="sticky note"
										onClick={() =>
											window
												.open(`http://archive.is/${archive.code}`, "_blank")
												.focus()
										}
										text="View archive"
									/>
								</Dropdown.Menu>
							</Dropdown>
						)
					}
					return (
						<ResultItem
							description={info.description}
							highlight={q !== ""}
							highlightText={q}
							history={props.history}
							id={`archive_${i}`}
							key={`archive_${i}`}
							menu={menu}
							meta={meta}
							sanitize={false}
							title={info.title}
							type="archive"
							truncate={false}
							url={info.link}
						/>
					)
				} else {
					return <LazyLoad key={`archive_${i}`} />
				}
			})
		}

		return (
			<div className="archivesList">
				<Visibility className="archiveWrapper" continuous onBottomVisible={this.loadMore}>
					<Form>
						<Form.Group widths="equal">
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
							<Form.Field
								clearable
								control={Dropdown}
								onChange={this.onChangeSearch}
								options={options}
								placeholder="Filter by page or channel"
								search
								selection
								value={value}
							/>
						</Form.Group>
					</Form>
					<Divider />
					{this.props.archives.length > 0 ? (
						<Item.Group className="fallacyItems" divided>
							{RenderArchives(this.props)}
						</Item.Group>
					) : (
						<div className="emptyArchiveContainer">
							<Segment placeholder>
								<Header icon>
									<Icon color="blue" name="save" />
									{this.props.emptyMsgContent}
								</Header>
							</Segment>
						</div>
					)}
				</Visibility>
			</div>
		)
	}
}

ArchivesList.propTypes = {
	archives: PropTypes.array,
	emptyMsgContent: PropTypes.string,
	emptyMsgHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	getArchives: PropTypes.func,
	id: PropTypes.number,
	page: PropTypes.number,
	q: PropTypes.string,
	submitted: PropTypes.bool
}

ArchivesList.defaultProps = {
	archives: [{}, {}, {}, {}, {}, {}, {}, {}],
	emptyMsgContent: "This user has not archived anything yet",
	emptyMsgHeader: "No archives",
	getArchives,
	page: 0,
	q: "",
	submitted: false
}

const mapStateToProps = (state, ownProps) => ({
	...state.archives,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getArchives }
)(ArchivesList)
