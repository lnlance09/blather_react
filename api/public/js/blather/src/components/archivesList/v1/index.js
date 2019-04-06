import "./style.css"
import { getArchives } from "pages/actions/user"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import {
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Input,
	Item,
	Segment,
	Visibility
} from "semantic-ui-react"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import _ from "lodash"
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
			q: ""
		}
	}

	componentWillMount() {
		this.getArchivedUsers()
		this.props.getArchives({
			id: this.props.id,
			page: this.props.page
		})
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
				pageId: this.state.value
			})
			this.props.getArchives({
				id: this.props.id,
				page: newPage,
				pageId: this.state.value
			})
		}
	}

	onChangeInput = (e, { value }) => {
		this.setState({ page: 0, q: value })
		this.props.getArchives({
			id: this.props.id,
			page: 0,
			pageId: this.state.value,
			q: value
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
						title: `Tweet by ${archive.page_name}`
					}
				case "video":
					return {
						description: archive.description,
						img: archive.profile_pic,
						link: `/video/${archive.video_id}`,
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
							img={info.img}
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
							<Form.Field
								control={Input}
								icon="search"
								onChange={_.debounce(this.onChangeInput, 8000, {
									leading: true
								})}
								placeholder="Search"
								value={q}
							/>
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
									<Icon color="red" name="save" />
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
	page: PropTypes.number
}

ArchivesList.defaultProps = {
	archives: [{}, {}, {}, {}, {}, {}, {}, {}],
	emptyMsgContent: "This user has not archived anything yet",
	emptyMsgHeader: "No archives",
	getArchives,
	page: 0
}

const mapStateToProps = (state, ownProps) => ({
	...state.pageUser,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getArchives }
)(ArchivesList)
