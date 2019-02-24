import "./style.css"
import { getArchives } from "pages/actions/user"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Dropdown, Form, Header, Icon, Item, Segment, Visibility } from "semantic-ui-react"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import Parser from "html-react-parser"
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
			page: 0
		}
	}

	componentDidMount() {
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

	onChangeSearch = (e, { value }) => {
		this.setState({ archives: value, page: 0, value })
		this.props.getArchives({
			id: this.props.id,
			page: 0,
			pageId: value
		})
	}

	render() {
		const { options, value } = this.state
		const RenderArchives = props => {
			return props.archives.map((archive, i) => {
				if (archive.code) {
					let info = parseArchiveInfo(archive)
					let meta = (
						<div>
							<p>
								<Icon name="clock outline" />{" "}
								<Moment date={adjustTimezone(archive.date_created)} fromNow />
							</p>
						</div>
					)
					let menu = (
						<Dropdown
							className="archiveItemMenu"
							direction="left"
							icon="ellipsis vertical"
						>
							<Dropdown.Menu>
								<Dropdown.Item
									icon={archive.network}
									onClick={() => window.open(archive.link, "_blank").focus()}
									text={`View ${
										archive.network === "twitter" ? "tweet" : "video"
									}`}
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
					return (
						<ResultItem
							description={
								info.description === null
									? info.description
									: Parser(info.description)
							}
							history={props.history}
							id={`archive_${i}`}
							img={info.img}
							key={`archive_${i}`}
							menu={menu}
							meta={meta}
							sanitize={false}
							title={info.title}
							type="archive"
							url={
								archive.network === "twitter"
									? `/tweet/${archive.tweet_id}`
									: `/video/${archive.video_id}`
							}
						/>
					)
				} else {
					return <LazyLoad key={`archive_${i}`} />
				}
			})
		}
		const parseArchiveInfo = archive => {
			switch (archive.network) {
				case "twitter":
					return {
						description: archive.full_text,
						img: archive.twitter_profile_pic,
						title: `Tweet by ${archive.twitter_page_name}`
					}
				case "youtube":
					return {
						description: archive.title,
						img: archive.youtube_video_profile_pic,
						title: `YouTube video by ${archive.youtube_video_page_name}`
					}
				default:
					return null
			}
		}

		return (
			<div className="archivesList">
				{this.props.archives.length > 0 ? (
					<Visibility
						className="archiveWrapper"
						continuous
						onBottomVisible={this.loadMore}
					>
						<Form>
							<Form.Field
								control={Dropdown}
								fluid
								onChange={this.onChangeSearch}
								options={options}
								placeholder="Filter by page or channel"
								search
								selection
								value={value}
							/>
						</Form>
						<Item.Group className="fallacyItems" divided>
							{RenderArchives(this.props)}
						</Item.Group>
					</Visibility>
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
	getArchives: getArchives,
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
