import "./style.css"
import { getArchives } from "pages/actions/user"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Icon, Image, Item, Message, Visibility } from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import Moment from "react-moment"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import ResultItem from "components/item/v1/"
import React, { Component } from "react"

class ArchivesList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			id: null,
			loadingMore: false,
			page: 0
		}
	}

	componentDidMount() {
		this.props.getArchives({
			id: this.props.id,
			page: this.props.page
		})
	}

	loadMore = () => {
		if (this.props.hasMore) {
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({
				loadingMore: true,
				page: newPage
			})
			this.props.getArchives({
				id: this.props.id,
				page: newPage
			})
		}
	}

	render() {
		const renderArchives = props => {
			return props.archives.map((archive, i) => {
				if (archive.code) {
					let info = parseArchiveInfo(archive)
					let meta = (
						<div>
							<Icon className={`${archive.network}Icon`} name={archive.network} />{" "}
							<Moment date={adjustTimezone(archive.date_created)} fromNow />
						</div>
					)
					return (
						<ResultItem
							description={info.description}
							history={props.history}
							id={`archive_${i}`}
							img={info.img}
							key={`archive_${i}`}
							meta={meta}
							redirect={false}
							sanitize
							title={info.title}
							type="archive"
							url={`http://archive.is/${archive.code}`}
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
				{this.props.archives.length > 0 && (
					<Visibility
						continuous
						onBottomVisible={this.loadMore}
						style={{ marginTop: "14px" }}>
						<Item.Group className="fallacyItems" divided>
							{renderArchives(this.props)}
						</Item.Group>
					</Visibility>
				)}
				{this.props.archives.length === 0 && (
					<div className="emptyFallaciesContainer">
						<Message
							content="This user has not archived anything yet"
							header="No results"
						/>
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
