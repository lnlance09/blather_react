import "react-image-lightbox/style.css"
import "./style.css"
import args from "options/arguments.json"
import { Button, Header, Image, List, Segment } from "semantic-ui-react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Link } from "react-router-dom"
import { getUsernameFromTweetUrl } from "utils/textFunctions"
import { FacebookShareButton, RedditShareButton, TwitterShareButton } from "react-share"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"
import Lightbox from "react-image-lightbox"
import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import PlaceholderPic from "images/images/image.png"

toast.configure(getConfig())

class Arguments extends Component {
	constructor(props) {
		super(props)
		this.state = {
			img: "",
			isOpen: false
		}
	}

	async componentDidMount() {
		const { argument } = this.props
		if (argument !== null) {
			this.scrollToItem(argument)
		}
	}

	scrollToItem(id) {
		const element = document.getElementById(id)
		const argElement = document.getElementById("arguments")
		window.scrollTo({
			behavior: "smooth",
			top: element.offsetTop + argElement.offsetTop
		})
	}

	render() {
		const { img, isOpen } = this.state
		const { args } = this.props

		return (
			<div className="arguments" id="arguments">
				<Segment.Group>
					{args.map(arg => {
						const { contradictions, description, examples, images, meme, tips } = arg
						let { fallacies } = arg
						if (typeof fallacies === "undefined") {
							fallacies = []
						}

						return (
							<Segment id={arg.argument} inverted key={arg.argument}>
								<Header className="argumentHeader" size="large">
									{description}
								</Header>

								{typeof meme === "string" && (
									<Image
										bordered
										centered
										onClick={() => this.setState({ img: meme, isOpen: true })}
										onError={i => (i.target.src = PlaceholderPic)}
										rounded
										size="medium"
										src={meme}
									/>
								)}

								{Array.isArray(meme) && (
									<Image.Group>
										{meme.map(item => (
											<Image
												bordered
												centered
												key={item}
												onClick={() =>
													this.setState({ img: item, isOpen: true })
												}
												onError={i => (i.target.src = PlaceholderPic)}
												rounded
												size="medium"
												src={item}
											/>
										))}
									</Image.Group>
								)}

								{tips.length > 0 && (
									<Fragment>
										<Header inverted>Tips</Header>
										<div
											className="ui large bulleted inverted relaxed list"
											role="list"
										>
											{tips.map(item => (
												<div
													className="item"
													key={item}
													role="listitem"
													dangerouslySetInnerHTML={{ __html: item }}
												/>
											))}
										</div>
									</Fragment>
								)}

								{contradictions.length > 0 && (
									<Fragment>
										<Header inverted>What this contradicts...</Header>
										<List className="contList" size="large">
											{contradictions.map(item => {
												let cont = args.filter(
													arg => arg.argument === item.argument
												)
												if (cont.length > 0) {
													cont = cont[0]
												}

												return (
													<Segment
														className="contSegment"
														key={cont.argument}
														inverted
														onClick={() => {
															this.scrollToItem(cont.argument)
														}}
													>
														<List.Item className="contHeader">
															<List.Content>
																{cont.description}
															</List.Content>
															<List size="large">
																<List.Item>
																	{item.description}
																</List.Item>
															</List>
														</List.Item>
													</Segment>
												)
											})}
										</List>
									</Fragment>
								)}

								<Image.Group size="small">
									{images.map(item => (
										<Image
											key={item}
											onClick={() =>
												this.setState({ img: item, isOpen: true })
											}
											onError={i => (i.target.src = PlaceholderPic)}
											rounded
											src={item}
										/>
									))}
								</Image.Group>

								{examples.length > 0 && (
									<Fragment>
										<Header inverted>Examples</Header>
										<List
											bulleted
											className="examplesList"
											inverted
											size="large"
										>
											{examples.map(item => (
												<List.Item key={item}>
													<a
														href={item}
														rel="noopener noreferrer"
														target="_blank"
													>
														{getUsernameFromTweetUrl(item)}
													</a>
												</List.Item>
											))}
										</List>
									</Fragment>
								)}

								{fallacies.length > 0 && (
									<Fragment>
										<Header inverted>Fallacies</Header>
										<List
											bulleted
											className="examplesList"
											inverted
											size="large"
										>
											{fallacies.map(item => (
												<List.Item key={item}>
													<Link to={`/fallacies/${item}`}>{item}</Link>
												</List.Item>
											))}
										</List>
									</Fragment>
								)}

								<Header inverted>Share</Header>

								<List className="shareList" horizontal size="large">
									<List.Item>
										<FacebookShareButton
											url={`${window.location.origin}/arguments/${arg.argument}`}
										>
											<Button
												circular
												color="facebook"
												icon="facebook f"
												size="big"
											/>
										</FacebookShareButton>
									</List.Item>
									<List.Item>
										<TwitterShareButton
											title={description}
											url={`${window.location.origin}/arguments/${arg.argument}`}
										>
											<Button
												circular
												color="twitter"
												icon="twitter"
												size="big"
											/>
										</TwitterShareButton>
									</List.Item>
									<List.Item>
										<RedditShareButton
											url={`${window.location.origin}/arguments/${arg.argument}`}
										>
											<Button
												circular
												className="redditBtn"
												icon="reddit alien"
												size="big"
											/>
										</RedditShareButton>
									</List.Item>
									<List.Item>
										<CopyToClipboard
											onCopy={() => toast.success("Copied")}
											text={`${window.location.origin}/arguments/${arg.argument}`}
										>
											<div>
												<Button
													circular
													color="red"
													icon="paperclip"
													size="big"
												/>{" "}
											</div>
										</CopyToClipboard>
									</List.Item>
								</List>
							</Segment>
						)
					})}
				</Segment.Group>

				{isOpen && (
					<Lightbox
						mainSrc={img}
						// nextSrc={rawImages[(photoIndex + 1) % rawImages.length]}
						onCloseRequest={() => this.setState({ isOpen: false })}
						onMoveNextRequest={() => null}
						onMovePrevRequest={() => null}
						prevSrc={null}
						reactModalStyle={{
							content: {
								top: "70px"
							}
						}}
					/>
				)}
			</div>
		)
	}
}

Arguments.propTypes = {
	args: PropTypes.arrayOf(
		PropTypes.shape({
			argument: PropTypes.string,
			contradictions: PropTypes.arrayOf(
				PropTypes.shape({
					argument: PropTypes.string,
					description: PropTypes.string
				})
			),
			description: PropTypes.string,
			examples: PropTypes.array,
			fallacies: PropTypes.array,
			images: PropTypes.array,
			tips: PropTypes.array
		})
	),
	argument: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
}

Arguments.defaultProps = {
	args,
	argument: null
}

export default Arguments
