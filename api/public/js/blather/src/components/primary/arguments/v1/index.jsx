import "./style.css"
import args from "options/arguments.json"
import { Header, Image, Label, List, Segment } from "semantic-ui-react"
import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import PlaceholderPic from "images/images/image.png"

class Arguments extends Component {
	constructor(props) {
		super(props)
		this.state = {
			
		}
	}

	componentDidMount() {
		
	}

	scrollToItem(id) {
		const element = document.getElementById(id)
		// element.scrollIntoView({ behavior: "smooth", offset: -100 })
		window.scrollTo({
			behavior: "smooth",
			top: element.offsetTop + 64
		})
	}

	render() {
		const { args } = this.props

		return (
			<div className="arguments">
				<Segment.Group>
					{args.map((arg, i) => {
						const { contradictions, description, examples, images, meme, tips } = arg
						return (
							<Segment id={arg.argument} inverted>
								<Label attached="top right" color="blue" inverted>
									{i+1}
								</Label>
								<Header className="argumentHeader" size="large">
									{description}
								</Header>

								{typeof meme === "string" && (
									<Image
										bordered
										centered
										onError={i => (i.target.src = PlaceholderPic)}
										rounded
										size="medium"
										src={meme}
									/>
								)}

								{Array.isArray(meme) && (
									<Image.Group>
										{meme.map((item) => (
											<Image
												bordered
												centered
												onError={i => (i.target.src = PlaceholderPic)}
												rounded
												size="medium"
												src={item}
											/>
										))}
									</Image.Group>
								)}
							
								<Header inverted>
									Tips
								</Header>
								<List bulleted inverted relaxed size="large">
									{tips.map((item) => (
										<List.Item>
											{item}
										</List.Item>
									))}
								</List>

								{contradictions.length > 0 && (
									<Header inverted>
										What this contradicts...
									</Header>
								)}
								<List className="contList" size="large">
									{contradictions.map((item) => {
										let cont = args.filter(arg => arg.argument === item.argument)
										if (cont.length > 0) {
											cont = cont[0]
										}

										return (
											<Segment
												className="contSegment"
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

								{typeof images !== "undefined" && (
									<Image.Group>
										{images.map((item) => (
											<Image
												onError={i => (i.target.src = PlaceholderPic)}
												rounded
												size="small"
												src={item}
											/>
										))}
									</Image.Group>
								)}

								{examples.length > 0 && (
									<Header inverted>
										Examples
									</Header>
								)}
								<List bulleted className="examplesList" inverted>
									{examples.map((item) => (
										<List.Item>
											<a href={item} target="_blank">{item}</a>
										</List.Item>
									))}
								</List>
							</Segment>	
						)
					})}
				</Segment.Group>
			</div>
		)
	}
}

Arguments.propTypes = {
	args: PropTypes.arrayOf(PropTypes.shape({
		argument: PropTypes.string,
		contradictions: PropTypes.arrayOf(PropTypes.shape({
			argument: PropTypes.string,
			description: PropTypes.string
		})),
		description: PropTypes.string,
		examples: PropTypes.array,
		images: PropTypes.array,
		tips: PropTypes.array
	}))
}

Arguments.defaultProps = {
	args
}

export default Arguments
